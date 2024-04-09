export default interface IScoreResponseDTO {
  producer_id: string;
  quantity: number;
  weight: string;
  type: string;
  nfe: string;
  start_date: Date;
  end_date: Date;
  status: boolean;
  farm_id?: string;
  file_url(): string;
}
