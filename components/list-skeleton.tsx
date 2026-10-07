export function ListSkeleton() {
  return (
    <div className="space-y-3 pt-1">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-2xl bg-black/5" />
      ))}
    </div>
  );
}
