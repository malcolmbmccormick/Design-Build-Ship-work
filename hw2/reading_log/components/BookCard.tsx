import Link from 'next/link';
import { Book } from '@/types/book';
import StatusBadge from './StatusBadge';
import RatingDisplay from './RatingDisplay';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
        <div className="flex items-start justify-between gap-2 mb-3">
          <StatusBadge status={book.status} />
          <RatingDisplay rating={book.rating} />
        </div>
        <h3 className="font-playfair font-bold text-stone-900 text-lg leading-tight mb-1 group-hover:text-indigo-700 transition-colors">
          {book.title}
        </h3>
        <p className="text-stone-500 text-sm mb-3">{book.author}</p>
        {book.genre && (
          <p className="text-xs text-stone-400 uppercase tracking-wider">{book.genre}</p>
        )}
        {book.thoughts && (
          <p className="mt-3 text-stone-600 text-sm line-clamp-2 italic border-t border-stone-100 pt-3">
            {book.thoughts}
          </p>
        )}
      </div>
    </Link>
  );
}
