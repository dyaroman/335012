export type NavigationAction = 'today' | 'prev' | 'next';

export interface EventData {
  id?: string;
  title: string;
  date: string;
  time: string;
  color: string;
  note: string;
}

export interface PopoverPosition {
  top: number;
  left: number;
  arrowOffset?: number;
  isAbove?: boolean;
}

export interface SelectedDateTime {
  date: string;
  time: string;
}
