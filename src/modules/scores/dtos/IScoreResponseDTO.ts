export default interface IScoreResponseDTO {
  quantity: number;
  weight: string;
  start_date: Date;
  end_date: Date;
  status: boolean;
  file_url(): string;
}
