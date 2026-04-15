'use client';

import { useRouter } from 'next/navigation';
import { deleteBook } from '@/app/actions/books';

export default function DeleteBookButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Remove "${bookTitle}" from your shelf?`)) return;
    await deleteBook(bookId);
    router.push('/shelf');
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-400 hover:text-red-600 transition-colors"
    >
      Remove from shelf
    </button>
  );
}
