'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addBook } from '@/app/actions/books';
import { BookStatus } from '@/types/book';

interface SearchResult {
  key: string;
  title: string;
  author: string;
  cover_url: string | null;
  year: number | null;
  page_count: number | null;
}

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
];

const inputClass =
  'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-stone-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition';

export default function AddBookPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    cover_url: '',
    page_count: '',
    open_library_key: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch {
        // silent fail
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectResult(result: SearchResult) {
    setForm((prev) => ({
      ...prev,
      title: result.title,
      author: result.author,
      cover_url: result.cover_url ?? '',
      page_count: result.page_count ? String(result.page_count) : '',
      open_library_key: result.key ?? '',
    }));
    setSearchQuery('');
    setShowDropdown(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addBook({
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre.trim() || undefined,
        status: form.status,
        rating: form.rating ? Number(form.rating) : undefined,
        quotes: form.quotes.trim() || undefined,
        thoughts: form.thoughts.trim() || undefined,
        cover_url: form.cover_url || undefined,
        page_count: form.page_count ? Number(form.page_count) : undefined,
        open_library_key: form.open_library_key || undefined,
        date_started: form.dateStarted || undefined,
        date_finished: form.dateFinished || undefined,
      });
      setSubmitted(true);
      setTimeout(() => router.push('/shelf'), 1000);
    } finally {
      setSubmitting(false);
    }
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

      {/* Book search */}
      <div ref={searchRef} className="relative">
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Search Open Library
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author to auto-fill…"
            className="w-full pl-9 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-stone-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm"
          />
          {searchLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">searching…</span>
          )}
        </div>

        {showDropdown && searchResults.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
            {searchResults.map((result) => (
              <li key={result.key}>
                <button
                  type="button"
                  onClick={() => selectResult(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                >
                  {result.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={result.cover_url} alt="" width={28} height={40} className="rounded shrink-0 object-cover" />
                  ) : (
                    <div className="w-7 h-10 bg-zinc-800 rounded shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-stone-100 text-sm font-medium truncate">{result.title}</p>
                    <p className="text-zinc-500 text-xs truncate">
                      {result.author}{result.year ? ` · ${result.year}` : ''}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {showDropdown && searchResults.length === 0 && !searchLoading && (
          <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 text-sm">
            No results found.
          </div>
        )}
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
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Rating (1–10)</label>
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
              <button type="button" onClick={() => set('rating', '')} className="text-zinc-600 hover:text-zinc-400 text-xs">
                Clear
              </button>
            )}
          </div>
          {!form.rating && (
            <button type="button" onClick={() => set('rating', '5')} className="mt-1 text-xs text-indigo-400 hover:underline">
              + Add rating
            </button>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Date Started</label>
            <input type="date" value={form.dateStarted} onChange={(e) => set('dateStarted', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Date Finished</label>
            <input type="date" value={form.dateFinished} onChange={(e) => set('dateFinished', e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Quotes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Favourite Quotes</label>
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
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Personal Thoughts</label>
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
          disabled={submitting}
          className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-500 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : 'Add to Shelf'}
        </button>
      </form>
    </div>
  );
}
