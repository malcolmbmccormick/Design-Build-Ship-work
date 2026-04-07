import { BookStatus } from '@/types/book';

const config: Record<BookStatus, { label: string; className: string }> = {
  reading: {
    label: 'Reading',
    className: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
  },
  finished: {
    label: 'Finished',
    className: 'bg-indigo-900/50 text-indigo-400 border border-indigo-800',
  },
  'want-to-read': {
    label: 'Want to Read',
    className: 'bg-amber-900/50 text-amber-400 border border-amber-800',
  },
};

export default function StatusBadge({ status }: { status: BookStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
