import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@/types/book';
import StatusBadge from './StatusBadge';

export default function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  return (
    <Link
      href={`/book/${book.id}`}
      className="group block"
      style={{
        animation: 'fadeUp 1.6s ease both',
        animationDelay: `${index * 150}ms`,
      }}
    >
      <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex gap-3">
        {book.cover_url && (
          <div className="shrink-0">
            <Image
              src={book.cover_url}
              alt={book.title}
              width={40}
              height={60}
              className="rounded object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="font-playfair font-bold text-stone-900 text-lg leading-tight group-hover:text-indigo-700 transition-colors">
              {book.title}
            </h3>
            {book.genre && (
              <span className="text-xs text-stone-400 uppercase tracking-wider shrink-0 mt-1">
                {book.genre}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-stone-500 text-sm">{book.author}</p>
            {book.rating ? (
              <span className="text-sm shrink-0">
                <span className="font-bold text-indigo-700">{book.rating}</span>
                <span className="text-stone-400"> / 10</span>
              </span>
            ) : (
              <span className="text-stone-300 text-sm shrink-0">—</span>
            )}
          </div>

          <div className="border-t border-stone-100 pt-3">
            <StatusBadge status={book.status} />
          </div>
        </div>
      </div>
    </Link>
  );
}
