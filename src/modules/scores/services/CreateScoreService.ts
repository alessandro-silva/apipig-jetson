import { injectable, inject } from 'tsyringe';
import { uuid } from 'uuidv4';

import IScoresRepository from '../repositories/IScoresRepository';
import Score from '../infra/typeorm/entities/Score';

interface IRequest {
  quantity: number;
  weight: string;
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
    weight,
    start_date,
    end_date,
  }: IRequest): Promise<Score> {
    const score = await this.scoresRepository.create({
      id: uuid(),
      quantity,
      weight,
      start_date,
      end_date,
    });

    return score;
  }
}

export default CreateScoreService;
