export type BookStatus = 'reading' | 'finished' | 'want-to-read';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  status: BookStatus;
  rating?: number; // 1–10
  quotes?: string;
  thoughts?: string;
  dateAdded: string;
  dateStarted?: string;
  dateFinished?: string;
}
