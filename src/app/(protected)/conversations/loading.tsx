export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-stone-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-stone-800 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-stone-700 rounded animate-pulse" />
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-stone-800 p-4 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-64 bg-stone-700 rounded" />
                <div className="h-3 w-32 bg-stone-700 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center space-y-1">
                  <div className="h-3 w-12 bg-stone-700 rounded" />
                  <div className="h-4 w-6 bg-stone-600 rounded" />
                </div>
                <div className="text-center space-y-1">
                  <div className="h-3 w-12 bg-stone-700 rounded" />
                  <div className="h-4 w-6 bg-stone-600 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}