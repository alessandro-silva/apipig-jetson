import { injectable, inject } from 'tsyringe';

import IScoresRepository from '../repositories/IScoresRepository';
import Score from '../infra/typeorm/entities/Score';

interface IRequest {
  producer_id?: string;
  quantity: number;
  weight: string;
  type: string;
  nfe: string;
  start_date: Date;
  end_date: Date;
  farm_id: string;
}

@injectable()
class CreateScoreService {
  constructor(
    @inject('ScoresRepository')
    private scoresRepository: IScoresRepository,
  ) {}

  public async execute({
    producer_id,
    quantity,
    weight,
    type,
    nfe,
    start_date,
    end_date,
    farm_id,
  }: IRequest): Promise<Score> {
    const score = await this.scoresRepository.create({
      producer_id,
      quantity,
      weight,
      type,
      nfe,
      start_date,
      end_date,
      farm_id,
    });

    return score;
  }
}

export default CreateScoreService;
