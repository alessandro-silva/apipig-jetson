import { injectable, inject } from 'tsyringe';
import fetch from 'node-fetch';

import AppError from '@shared/errors/AppError';
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProvider';
import IScoresRepository from '../repositories/IScoresRepository';

interface IRequest {
  id: string;
  file: string;
  token: string;
}

@injectable()
class UploadScoreService {
  constructor(
    @inject('ScoresRepository')
    private scoresRepository: IScoresRepository,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider,
  ) { }

  public async execute({ file, id, token }: IRequest): Promise<any> {
    const score = await this.scoresRepository.findById(id);

    if (!score) {
      throw new AppError('Score does not exists.');
    }

    score.file = file;
    score.status = true;

    await this.scoresRepository.save(score);
    const scoreWithRelation = await this.scoresRepository.findById(id);
    if (!scoreWithRelation) {
      throw new AppError('Score does not exists.');
    }

    const scoreReturn = await fetch(`http://167.71.20.221/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(scoreWithRelation),
    }).then(async () => {
      if (score.file) {
        await this.storageProvider.delete(score.file, 'scores/file');
      }

      await this.storageProvider.save(file, 'scores/file');

      return score;
    }).catch(async () => {
      score.status = false;

      await this.scoresRepository.save(score);

      throw new AppError('Fetch erro in upload.');
    });

    return scoreReturn;
  }
}

export default UploadScoreService;
