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

type SortOption = 'added-desc' | 'added-asc' | 'title-asc' | 'title-desc' | 'rating-desc' | 'rating-asc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'added-desc', label: 'Recently Added' },
  { value: 'added-asc', label: 'Oldest Added' },
  { value: 'title-asc', label: 'Title A→Z' },
  { value: 'title-desc', label: 'Title Z→A' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
];

export default function ShelfPage() {
  const { books } = useBooks();
  const [filter, setFilter] = useState<'all' | BookStatus>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('added-desc');

  const query = search.trim().toLowerCase();

  const displayed = books
    .filter((b) => filter === 'all' || b.status === filter)
    .filter((b) =>
      !query ||
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      (b.genre ?? '').toLowerCase().includes(query)
    )
    .sort((a, b) => {
      switch (sort) {
        case 'added-asc':  return a.dateAdded.localeCompare(b.dateAdded);
        case 'added-desc': return b.dateAdded.localeCompare(a.dateAdded);
        case 'title-asc':  return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'rating-desc': return (b.rating ?? 0) - (a.rating ?? 0);
        case 'rating-asc':  return (a.rating ?? 0) - (b.rating ?? 0);
      }
    });

  return (
    <div className="space-y-8">
      <div className="border-b border-stone-200 pb-8">
        <h1 className="font-playfair text-4xl font-bold text-stone-900 mb-2">My Shelf</h1>
        <p className="text-stone-500">{books.length} books in your collection</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or genre…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Status filters */}
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
          <p className="font-playfair text-xl mb-2">{query ? 'No results found' : 'Nothing here yet'}</p>
          <p className="text-sm">{query ? `No books match "${search}".` : 'Add a book to get started.'}</p>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-sm text-stone-500">{displayed.length} result{displayed.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
