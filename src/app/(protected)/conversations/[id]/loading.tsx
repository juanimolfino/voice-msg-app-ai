export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-stone-700 rounded animate-pulse" />
          <div className="h-4 w-48 bg-stone-800 rounded animate-pulse" />
        </div>
        <div className="h-4 w-32 bg-stone-700 rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-stone-800 p-4 rounded-lg space-y-2">
            <div className="h-4 w-20 bg-stone-700 rounded animate-pulse" />
            <div className="h-8 w-12 bg-stone-600 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-stone-700 rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-stone-800 p-4 rounded-lg space-y-3">
            <div className="h-4 w-16 bg-stone-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-stone-700 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-stone-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}