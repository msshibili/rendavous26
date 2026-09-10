export interface TeamScore {
  id: string;
  name: string;
  points: number;
  stagePoints: number;
  offStagePoints: number;
  color: string;
  leadTag?: string;
  updatedAt?: string;
}
