import { Seat } from './seats';

export interface TheaterData {
  numRows: number;
  numCols: number;
  seats: Seat[];
  assignedAudienceIds: string[];
}
