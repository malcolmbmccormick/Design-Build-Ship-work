'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks } from '@/context/BookContext';
import { Book, BookStatus } from '@/types/book';
import { nanoid } from 'nanoid';

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
];

const inputClass =
  'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-stone-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition';

export default function AddBookPage() {
  const { addBook } = useBooks();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    status: 'want-to-read' as BookStatus,
    rating: '',
    quotes: '',
    thoughts: '',
    dateStarted: '',
    dateFinished: '',
  });

  const [submitted, setSubmitted] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const book: Book = {
      id: nanoid(),
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim() || undefined,
      status: form.status,
      rating: form.rating ? Number(form.rating) : undefined,
      quotes: form.quotes.trim() || undefined,
      thoughts: form.thoughts.trim() || undefined,
      dateAdded: new Date().toISOString().split('T')[0],
      dateStarted: form.dateStarted || undefined,
      dateFinished: form.dateFinished || undefined,
    };

    addBook(book);
    setSubmitted(true);
    setTimeout(() => router.push('/shelf'), 1000);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center text-3xl text-indigo-400">
          ✓
        </div>
        <p className="font-playfair text-2xl font-bold text-stone-100">Book added!</p>
        <p className="text-zinc-500 text-sm">Redirecting to your shelf…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="border-b border-zinc-800 pb-8">
        <h1 className="font-playfair text-4xl font-bold text-stone-100 mb-2">Add a Book</h1>
        <p className="text-zinc-500">Log a new title to your reading journal.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title + Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Dune"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="e.g. Frank Herbert"
              className={inputClass}
            />
          </div>
        </div>

        {/* Genre + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Genre</label>
            <input
              type="text"
              value={form.genre}
              onChange={(e) => set('genre', e.target.value)}
              placeholder="e.g. Science Fiction"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className={inputClass}
            >
              {statusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Rating (1–10)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={form.rating || 5}
              onChange={(e) => set('rating', e.target.value)}
              className="flex-1 accent-indigo-500"
            />
            <span className="w-12 text-center font-playfair font-bold text-indigo-400 text-lg">
              {form.rating || '—'}
            </span>
            {form.rating && (
              <button
                type="button"
                onClick={() => set('rating', '')}
                className="text-zinc-600 hover:text-zinc-400 text-xs"
              >
                Clear
              </button>
            )}
          </div>
          {!form.rating && (
            <button
              type="button"
              onClick={() => set('rating', '5')}
              className="mt-1 text-xs text-indigo-400 hover:underline"
            >
              + Add rating
            </button>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Date Started</label>
            <input
              type="date"
              value={form.dateStarted}
              onChange={(e) => set('dateStarted', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Date Finished</label>
            <input
              type="date"
              value={form.dateFinished}
              onChange={(e) => set('dateFinished', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Quotes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Favourite Quotes
          </label>
          <textarea
            value={form.quotes}
            onChange={(e) => set('quotes', e.target.value)}
            rows={3}
            placeholder='"The mystery of life is not a problem to solve..."'
            className={inputClass + ' resize-none'}
          />
        </div>

        {/* Thoughts */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Personal Thoughts
          </label>
          <textarea
            value={form.thoughts}
            onChange={(e) => set('thoughts', e.target.value)}
            rows={4}
            placeholder="What did this book make you feel or think?"
            className={inputClass + ' resize-none'}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-500 active:scale-[0.99] transition-all"
        >
          Add to Shelf
        </button>
      </form>
    </div>
  );
}
