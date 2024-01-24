import { classToClass } from 'class-transformer';

import IScoreResponseDTO from '../dtos/IScoreResponseDTO';
import Score from '../infra/typeorm/entities/Score';

// eslint-disable-next-line import/prefer-default-export
export class ScoreMap {
  static toDTO({
    id,
    weight,
    quantity,
    start_date,
    end_date,
    status,
    file,
    file_url,
    markings,
  }: Score): IScoreResponseDTO {
    const score = classToClass({
      id,
      weight,
      quantity,
      start_date,
      end_date,
      status,
      file,
      file_url,
      markings,
    });

    return score;
  }
}
