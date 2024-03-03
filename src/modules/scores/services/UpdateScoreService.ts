import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IScoresRepository from '../repositories/IScoresRepository';
import Score from '../infra/typeorm/entities/Score';

interface IRequest {
  id: string;
  producer_id?: string;
  quantity?: number;
  weight?: string;
  type?: string;
  nfe?: string;
  start_date?: Date;
  end_date?: Date;
}

@injectable()
class UpdateScoreService {
  constructor(
    @inject('ScoresRepository')
    private scoresRepository: IScoresRepository,
  ) {}

  public async execute({
    id,
    producer_id,
    quantity,
    weight,
    type,
    nfe,
    start_date,
    end_date,
  }: IRequest): Promise<Score> {
    const score = await this.scoresRepository.findById(id);

    if (!score) {
      throw new AppError('Score not exists.');
    }

    if (quantity) {
      score.quantity = quantity;
    }

    if (weight) {
      score.weight = weight;
    }

    if (type) {
      score.type = type;
    }

    if (start_date) {
      score.start_date = start_date;
    }

    if (end_date) {
      score.end_date = end_date;
    }

    if (producer_id) {
      score.producer_id = producer_id;
    }

    if (nfe) {
      score.nfe = nfe;
    }

    return this.scoresRepository.save(score);
  }
}

export default UpdateScoreService;
