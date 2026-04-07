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
      <div className="border-b border-zinc-800 pb-8">
        <h1 className="font-playfair text-4xl font-bold text-stone-100 mb-2">My Shelf</h1>
        <p className="text-zinc-500">{books.length} books in your collection</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-indigo-500 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-indigo-500/50 hover:text-indigo-400'
            }`}
          >
            {label}
            <span className="ml-2 opacity-50">
              {value === 'all' ? books.length : books.filter((b) => b.status === value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="font-playfair text-xl mb-2">Nothing here yet</p>
          <p className="text-sm">Add a book to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
