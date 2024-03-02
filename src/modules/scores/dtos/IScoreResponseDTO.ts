export default interface IScoreResponseDTO {
  producer_id: string;
  quantity: number;
  weight: string;
  type: string;
  start_date: Date;
  end_date: Date;
  status: boolean;
  file_url(): string;
}
