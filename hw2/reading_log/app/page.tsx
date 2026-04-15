import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';
import { Book } from '@/types/book';
import Link from 'next/link';
import BookCard from '@/components/BookCard';

export default async function HomePage() {
  const { userId } = await auth();
  const supabase = getSupabase();

  const { data } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId!)
    .order('created_at', { ascending: false });

  const books: Book[] = data ?? [];

  const finished = books.filter((b) => b.status === 'finished');
  const reading = books.filter((b) => b.status === 'reading');
  const wantToRead = books.filter((b) => b.status === 'want-to-read');
  const recent = books.slice(0, 3);

  const ratedFinished = finished.filter((b) => b.rating);
  const avgRating =
    ratedFinished.length > 0
      ? (ratedFinished.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedFinished.length).toFixed(1)
      : null;

  return (
    <div className="space-y-12">
      <div className="border-b border-stone-200 pb-10">
        <h1 className="font-playfair text-5xl font-bold text-stone-900 mb-3">
          My Reading Journal
        </h1>
        <p className="text-stone-500 text-lg max-w-xl">
          A quiet corner to track what I&apos;ve read, what I&apos;m reading, and what&apos;s next on the shelf.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Books Read', value: finished.length, color: 'text-indigo-700' },
          { label: 'Reading Now', value: reading.length, color: 'text-emerald-700' },
          { label: 'Want to Read', value: wantToRead.length, color: 'text-amber-700' },
          { label: 'Avg Rating', value: avgRating ? `${avgRating}/10` : '—', color: 'text-indigo-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <p className={`font-playfair text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-stone-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {reading.length > 0 && (
        <section>
          <h2 className="font-playfair text-2xl font-bold text-stone-900 mb-5">Currently Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reading.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-playfair text-2xl font-bold text-stone-900">Recently Added</h2>
            <Link href="/shelf" className="text-sm text-indigo-700 font-medium hover:underline underline-offset-2">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {books.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="font-playfair text-xl mb-2">Your shelf is empty</p>
          <p className="text-sm">Add your first book to get started.</p>
        </div>
      )}

      <div className="bg-indigo-700 rounded-2xl p-8 flex items-center justify-between">
        <div>
          <h3 className="font-playfair text-2xl font-bold text-white mb-1">Log a new book</h3>
          <p className="text-indigo-200 text-sm">Add a title to your shelf in under a minute.</p>
        </div>
        <Link
          href="/add"
          className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full text-sm hover:bg-indigo-50 transition-colors shrink-0"
        >
          + Add Book
        </Link>
      </div>
    </div>
  );
}
