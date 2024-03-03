export default interface ICreateScoreDTO {
  producer_id?: string;
  quantity: number;
  weight: string;
  type: string;
  nfe: string;
  start_date: Date;
  end_date: Date;
}
