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
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#111111]" />
      <div className="absolute left-1.5 top-4 bottom-0 w-px bg-zinc-800 last:hidden" />
      <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-medium text-stone-100">{date}</p>
      {note && <p className="text-sm text-zinc-500 mt-0.5">{note}</p>}
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
        <p className="font-playfair text-2xl text-zinc-500 mb-4">Book not found</p>
        <Link href="/shelf" className="text-indigo-400 hover:underline text-sm">
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
      {/* Back */}
      <Link href="/shelf" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-indigo-400 transition-colors">
        ← Back to shelf
      </Link>

      {/* Header */}
      <div className="border-b border-zinc-800 pb-8 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={book.status} />
          {book.genre && (
            <span className="text-xs text-zinc-600 uppercase tracking-wider">{book.genre}</span>
          )}
        </div>
        <h1 className="font-playfair text-4xl font-bold text-stone-100 leading-tight">
          {book.title}
        </h1>
        <p className="text-zinc-400 text-xl">{book.author}</p>
        <div className="flex items-center gap-2">
          <RatingDisplay rating={book.rating} />
          {daysReading && (
            <span className="text-zinc-600 text-sm">· read in {daysReading} days</span>
          )}
        </div>
      </div>

      {/* Reading Timeline */}
      <section>
        <h2 className="font-playfair text-xl font-bold text-stone-100 mb-6">Reading Timeline</h2>
        <div className="space-y-6">
          <TimelineEvent
            date={book.dateAdded}
            label="Added to shelf"
            note="Book was added to the reading log"
          />
          <TimelineEvent
            date={book.dateStarted}
            label="Started reading"
            note={book.status === 'reading' ? 'Currently in progress' : undefined}
          />
          <TimelineEvent
            date={book.dateFinished}
            label="Finished"
            note={daysReading ? `Completed in ${daysReading} days` : undefined}
          />
          {!book.dateStarted && !book.dateFinished && (
            <p className="text-zinc-600 text-sm italic pl-1">No reading dates logged yet.</p>
          )}
        </div>
      </section>

      {/* Quotes */}
      {book.quotes && (
        <section>
          <h2 className="font-playfair text-xl font-bold text-stone-100 mb-4">Favourite Quotes</h2>
          <blockquote className="border-l-4 border-indigo-500/50 pl-5 italic text-zinc-400 leading-relaxed whitespace-pre-wrap">
            {book.quotes}
          </blockquote>
        </section>
      )}

      {/* Thoughts */}
      {book.thoughts && (
        <section>
          <h2 className="font-playfair text-xl font-bold text-stone-100 mb-4">Personal Thoughts</h2>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{book.thoughts}</p>
        </section>
      )}

      {/* Delete */}
      <div className="border-t border-zinc-800 pt-8">
        <button
          onClick={handleDelete}
          className="text-sm text-zinc-700 hover:text-red-400 transition-colors"
        >
          Remove from shelf
        </button>
      </div>
    </div>
  );
}
