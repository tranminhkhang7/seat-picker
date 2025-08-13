export interface Seat {
  id: string;
  row: number;
  col: number;
  audienceId: string | null;
  isSelected: boolean;
  isEditing: boolean;
  isHidden: boolean;
  disabled: boolean;
}
