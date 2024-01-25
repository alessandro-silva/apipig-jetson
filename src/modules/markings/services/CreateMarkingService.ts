import { injectable, inject } from 'tsyringe';

import IMarkingsRepository from '../repositories/IMarkingsRepository';
import Marking from '../infra/typeorm/entities/Marking';
import { uuid } from 'uuidv4';

interface IRequest {
  quantity: number;
  weight: string;
  score_id: string;
  sequence: number;
}

@injectable()
class CreateMarkingService {
  constructor(
    @inject('MarkingsRepository')
    private markingsRepository: IMarkingsRepository,
  ) {}

  public async execute({
    quantity,
    weight,
    score_id,
    sequence,
  }: IRequest): Promise<Marking> {
    const marking = await this.markingsRepository.create({
      id: uuid(),
      quantity,
      weight,
      score_id,
      sequence,
    });

    return marking;
  }
}

export default CreateMarkingService;
