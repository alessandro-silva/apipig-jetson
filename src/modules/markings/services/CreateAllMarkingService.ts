import { injectable, inject } from 'tsyringe';

import IMarkingsRepository from '../repositories/IMarkingsRepository';
import Marking from '../infra/typeorm/entities/Marking';

interface IRequest {
  quantity: number;
  weight: string;
  score_id: string;
  sequence: number;
}

@injectable()
class CreateAllMarkingService {
  constructor(
    @inject('MarkingsRepository')
    private markingsRepository: IMarkingsRepository,
  ) {}

  public async execute(data: IRequest[]): Promise<Marking[]> {
    const markings = await this.markingsRepository.createAll(data);

    return markings;
  }
}

export default CreateAllMarkingService;
