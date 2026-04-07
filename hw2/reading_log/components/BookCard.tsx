import Link from 'next/link';
import { Book } from '@/types/book';
import StatusBadge from './StatusBadge';
import RatingDisplay from './RatingDisplay';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-500/50 transition-all duration-200">
        <div className="flex items-start justify-between gap-2 mb-3">
          <StatusBadge status={book.status} />
          <RatingDisplay rating={book.rating} />
        </div>
        <h3 className="font-playfair font-bold text-stone-100 text-lg leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-3">{book.author}</p>
        {book.genre && (
          <p className="text-xs text-zinc-600 uppercase tracking-wider">{book.genre}</p>
        )}
        {book.thoughts && (
          <p className="mt-3 text-zinc-400 text-sm line-clamp-2 italic border-t border-zinc-800 pt-3">
            {book.thoughts}
          </p>
        )}
      </div>
    </Link>
  );
}
