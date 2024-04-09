import { classToClass } from 'class-transformer';

import IScoreResponseDTO from '../dtos/IScoreResponseDTO';
import Score from '../infra/typeorm/entities/Score';

// eslint-disable-next-line import/prefer-default-export
export class ScoreMap {
  static toDTO({
    id,
    weight,
    type,
    nfe,
    quantity,
    start_date,
    end_date,
    status,
    file,
    file_url,
    markings,
    producer_id,
    created_at,
    updated_at,
    farm_id,
  }: Score): IScoreResponseDTO {
    const score = classToClass({
      id,
      weight,
      type,
      nfe,
      quantity,
      start_date,
      end_date,
      status,
      file,
      file_url,
      markings,
      producer_id,
      created_at,
      updated_at,
      farm_id,
    });

    return score;
  }
}
