import { Skeleton } from './Skeleton';

export const ForecastSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700"
          >
            {/* Date */}
            <Skeleton className="h-4 w-24 mb-3" />

            {/* Weather Icon */}
            <div className="flex justify-center mb-3">
              <Skeleton variant="circular" className="h-12 w-12" />
            </div>

            {/* Temperature Range */}
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>

            {/* Weather Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="h-6 w-6" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="h-6 w-6" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 