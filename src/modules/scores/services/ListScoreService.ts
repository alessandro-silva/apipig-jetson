import { injectable, inject } from 'tsyringe';

import IScoresRepository from '../repositories/IScoresRepository';
import { ScoreMap } from '../mapper/ScoreMap';
import IScoreResponseDTO from '../dtos/IScoreResponseDTO';

@injectable()
class ListScoreService {
  constructor(
    @inject('ScoresRepository')
    private scoresRepository: IScoresRepository,
  ) { }

  public async execute(): Promise<IScoreResponseDTO[]> {
    const scores = await this.scoresRepository.findAll();

    const scoresMap = scores.map(score => { return ScoreMap.toDTO(score) })

    const scoresOrderByStartDate = scoresMap.sort((a, b) =>
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    );

    return scoresOrderByStartDate;
  }
}

export default ListScoreService;
