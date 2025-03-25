import { Skeleton } from './Skeleton';

export const LocationSearchSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Recent Searches */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 mb-3" /> {/* "Recent Searches" text */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton variant="circular" className="h-8 w-8" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Popular Cities */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 mb-3" /> {/* "Popular Cities" text */}
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <Skeleton variant="circular" className="h-6 w-6" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 