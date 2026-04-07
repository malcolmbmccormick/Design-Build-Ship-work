import { BookStatus } from '@/types/book';

const config: Record<BookStatus, { label: string; className: string }> = {
  reading: {
    label: 'Reading',
    className: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  },
  finished: {
    label: 'Finished',
    className: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  },
  'want-to-read': {
    label: 'Want to Read',
    className: 'bg-amber-100 text-amber-800 border border-amber-200',
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
