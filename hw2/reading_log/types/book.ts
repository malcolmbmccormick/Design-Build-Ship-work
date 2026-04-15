export type BookStatus = 'reading' | 'finished' | 'want-to-read';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  genre?: string;
  status: BookStatus;
  rating?: number;
  quotes?: string;
  thoughts?: string;
  cover_url?: string;
  description?: string;
  page_count?: number;
  open_library_key?: string;
  date_added: string;
  date_started?: string;
  date_finished?: string;
  created_at?: string;
}
