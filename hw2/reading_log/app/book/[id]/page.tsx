'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBooks } from '@/context/BookContext';
import StatusBadge from '@/components/StatusBadge';
import RatingDisplay from '@/components/RatingDisplay';
import Link from 'next/link';

function TimelineEvent({ date, label, note }: { date?: string; label: string; note?: string }) {
  if (!date) return null;
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-indigo-700 border-2 border-amber-50" />
      <div className="absolute left-1.5 top-4 bottom-0 w-px bg-stone-200 last:hidden" />
      <p className="text-xs text-stone-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-medium text-stone-800">{date}</p>
      {note && <p className="text-sm text-stone-500 mt-0.5">{note}</p>}
    </div>
  );
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { books, deleteBook } = useBooks();
  const router = useRouter();

  const book = books.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="text-center py-24">
        <p className="font-playfair text-2xl text-stone-600 mb-4">Book not found</p>
        <Link href="/shelf" className="text-indigo-700 hover:underline text-sm">
          ← Back to shelf
        </Link>
      </div>
    );
  }

  const daysReading =
    book.dateStarted && book.dateFinished
      ? Math.ceil(
          (new Date(book.dateFinished).getTime() - new Date(book.dateStarted).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  function handleDelete() {
    if (confirm(`Remove "${book!.title}" from your shelf?`)) {
      deleteBook(book!.id);
      router.push('/shelf');
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      <Link href="/shelf" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-indigo-700 transition-colors">
        ← Back to shelf
      </Link>

      <div className="border-b border-stone-200 pb-8 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={book.status} />
          {book.genre && (
            <span className="text-xs text-stone-400 uppercase tracking-wider">{book.genre}</span>
          )}
        </div>
        <h1 className="font-playfair text-4xl font-bold text-stone-900 leading-tight">{book.title}</h1>
        <p className="text-stone-500 text-xl">{book.author}</p>
        <div className="flex items-center gap-2">
          <RatingDisplay rating={book.rating} />
          {daysReading && (
            <span className="text-stone-400 text-sm">· read in {daysReading} days</span>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-playfair text-xl font-bold text-stone-900 mb-6">Reading Timeline</h2>
        <div className="space-y-6">
          <TimelineEvent date={book.dateAdded} label="Added to shelf" note="Book was added to the reading log" />
          <TimelineEvent date={book.dateStarted} label="Started reading" note={book.status === 'reading' ? 'Currently in progress' : undefined} />
          <TimelineEvent date={book.dateFinished} label="Finished" note={daysReading ? `Completed in ${daysReading} days` : undefined} />
          {!book.dateStarted && !book.dateFinished && (
            <p className="text-stone-400 text-sm italic pl-1">No reading dates logged yet.</p>
          )}
        </div>
      </section>

      {book.quotes && (
        <section>
          <h2 className="font-playfair text-xl font-bold text-stone-900 mb-4">Favourite Quotes</h2>
          <blockquote className="border-l-4 border-indigo-300 pl-5 italic text-stone-600 leading-relaxed whitespace-pre-wrap">
            {book.quotes}
          </blockquote>
        </section>
      )}

      {book.thoughts && (
        <section>
          <h2 className="font-playfair text-xl font-bold text-stone-900 mb-4">Personal Thoughts</h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{book.thoughts}</p>
        </section>
      )}

      <div className="border-t border-stone-200 pt-8">
        <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-600 transition-colors">
          Remove from shelf
        </button>
      </div>
    </div>
  );
}
