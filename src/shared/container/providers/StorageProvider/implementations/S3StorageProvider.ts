import fs from 'fs';
import mime from 'mime';
import { resolve } from 'path';
import { S3 } from 'aws-sdk';
import uploadConfig from '@config/upload';
import AppError from '@shared/errors/AppError';
import IStorageProvider from '../models/IStorageProvider';

class S3StorageProvider implements IStorageProvider {
  private client: S3;

  constructor() {
    this.client = new S3({
      region: process.env.AWS_BUCKET_REGION,
    });
  }

  public async save(file: string, folder: string): Promise<string> {
    const originalName = resolve(uploadConfig.tmpFolder, file);

    const fileContent = await fs.promises.readFile(originalName);
    // const fileContent = await fs.promises.readFile(originalName, {
    //   encoding: 'utf-8',
    // });

    const ContentType = mime.getType(originalName);

    const [, type] = originalName.split('@');

    if (type === 'blob') {
      await this.client
        .putObject({
          Bucket: `${process.env.AWS_BUCKET}/${folder}`,
          Key: file,
          ACL: 'public-read',
          Body: fileContent,
          ContentType: 'application/octet-stream',
        })
        .promise();

      await fs.promises.unlink(originalName);

      return file;
    }

    if (!ContentType) {
      throw new AppError('Error Content Type!');
    }

    await this.client
      .putObject({
        Bucket: `${process.env.AWS_BUCKET}/${folder}`,
        Key: file,
        ACL: 'public-read',
        Body: fileContent,
        ContentType,
      })
      .promise();

    await fs.promises.unlink(originalName);

    return file;
  }

  public async delete(file: string, folder: string): Promise<void> {
    await this.client
      .deleteObject({
        Bucket: `${process.env.AWS_BUCKET}/${folder}`,
        Key: file,
      })
      .promise();
  }
}

export default S3StorageProvider;
