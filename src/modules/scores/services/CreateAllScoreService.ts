import { injectable, inject } from 'tsyringe';
import { uuid } from 'uuidv4';

import IScoresRepository from '../repositories/IScoresRepository';
import Score from '../infra/typeorm/entities/Score';

interface IRequest {
  quantity: number;
  producer_id?: string;
  weight: string;
  type: string;
  nfe: string;
  start_date: Date;
  end_date: Date;
}

@injectable()
class CreateScoreService {
  constructor(
    @inject('ScoresRepository')
    private scoresRepository: IScoresRepository,
  ) {}

  public async execute({
    quantity,
    producer_id,
    weight,
    type,
    nfe,
    start_date,
    end_date,
  }: IRequest): Promise<Score> {
    const score = await this.scoresRepository.create({
      quantity,
      producer_id,
      weight,
      type,
      nfe,
      start_date,
      end_date,
    });

    return score;
  }
}

export default CreateScoreService;
