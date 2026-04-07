'use client';

import { useState } from 'react';
import { useBooks } from '@/context/BookContext';
import BookCard from '@/components/BookCard';
import { BookStatus } from '@/types/book';

const FILTERS: { value: 'all' | BookStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'want-to-read', label: 'Want to Read' },
];

export default function ShelfPage() {
  const { books } = useBooks();
  const [filter, setFilter] = useState<'all' | BookStatus>('all');

  const displayed = filter === 'all' ? books : books.filter((b) => b.status === filter);

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-8">
        <h1 className="font-playfair text-4xl font-bold text-stone-900 mb-2">My Shelf</h1>
        <p className="text-stone-500">{books.length} books in your collection</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-indigo-700 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            {label}
            <span className="ml-2 opacity-60">
              {value === 'all' ? books.length : books.filter((b) => b.status === value).length}
            </span>
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="font-playfair text-xl mb-2">Nothing here yet</p>
          <p className="text-sm">Add a book to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
