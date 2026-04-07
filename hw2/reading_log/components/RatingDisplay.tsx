export default function RatingDisplay({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-zinc-600 text-sm">Not rated</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-indigo-400 font-bold text-sm">{rating}</span>
      <span className="text-zinc-600 text-sm">/ 10</span>
    </span>
  );
}
