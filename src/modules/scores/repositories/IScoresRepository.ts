import Score from '../infra/typeorm/entities/Score';
import ICreateScoreDTO from '../dtos/ICreateScoreDTO';

export default interface IScoresRepository {
  findAll(): Promise<Score[]>;
  findById(id: string): Promise<Score | undefined>;
  findByStatus(status: boolean): Promise<Score[]>;
  create(data: ICreateScoreDTO): Promise<Score>;
  save(score: Score): Promise<Score>;
}
