'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Book } from '@/types/book';

const SEED_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    status: 'finished',
    rating: 10,
    quotes: '"I must not fear. Fear is the mind-killer."',
    thoughts: 'A stunning world-building achievement. The ecology of Arrakis feels completely real. Paul\'s transformation is haunting.',
    dateAdded: '2024-09-01',
    dateStarted: '2024-09-01',
    dateFinished: '2024-09-20',
  },
  {
    id: '2',
    title: 'The Road',
    author: 'Cormac McCarthy',
    genre: 'Literary Fiction',
    status: 'finished',
    rating: 9,
    quotes: '"Carry the fire."',
    thoughts: 'Bleak and devastating but somehow also the most tender love story I\'ve read. Prose is stripped to bone.',
    dateAdded: '2024-10-05',
    dateStarted: '2024-10-05',
    dateFinished: '2024-10-12',
  },
  {
    id: '3',
    title: 'Blood Meridian',
    author: 'Cormac McCarthy',
    genre: 'Western',
    status: 'reading',
    rating: undefined,
    quotes: '"Whatever in creation exists without my knowledge exists without my consent."',
    thoughts: 'Relentlessly violent but the Judge is one of the most terrifying characters in all of literature.',
    dateAdded: '2025-01-10',
    dateStarted: '2025-01-10',
  },
  {
    id: '4',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    genre: 'Fantasy',
    status: 'finished',
    rating: 9,
    quotes: '"The Beauty of the House is immeasurable; its Kindness infinite."',
    thoughts: 'Utterly unique. Nothing else reads like this. The House feels like a dream you\'ve had but can\'t quite remember.',
    dateAdded: '2024-11-15',
    dateStarted: '2024-11-15',
    dateFinished: '2024-11-18',
  },
  {
    id: '5',
    title: 'The Master and Margarita',
    author: 'Mikhail Bulgakov',
    genre: 'Satire',
    status: 'want-to-read',
    dateAdded: '2025-02-01',
  },
  {
    id: '6',
    title: 'Invisible Cities',
    author: 'Italo Calvino',
    genre: 'Literary Fiction',
    status: 'want-to-read',
    dateAdded: '2025-03-10',
  },
];

type Action =
  | { type: 'ADD_BOOK'; book: Book }
  | { type: 'UPDATE_BOOK'; book: Book }
  | { type: 'DELETE_BOOK'; id: string };

function reducer(state: Book[], action: Action): Book[] {
  switch (action.type) {
    case 'ADD_BOOK':
      return [action.book, ...state];
    case 'UPDATE_BOOK':
      return state.map((b) => (b.id === action.book.id ? action.book : b));
    case 'DELETE_BOOK':
      return state.filter((b) => b.id !== action.id);
    default:
      return state;
  }
}

interface BookContextValue {
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
}

const BookContext = createContext<BookContextValue | null>(null);

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, dispatch] = useReducer(reducer, SEED_BOOKS);

  return (
    <BookContext.Provider
      value={{
        books,
        addBook: (book) => dispatch({ type: 'ADD_BOOK', book }),
        updateBook: (book) => dispatch({ type: 'UPDATE_BOOK', book }),
        deleteBook: (id) => dispatch({ type: 'DELETE_BOOK', id }),
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error('useBooks must be used within BookProvider');
  return ctx;
}
