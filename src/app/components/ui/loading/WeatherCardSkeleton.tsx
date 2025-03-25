import { Skeleton } from './Skeleton';

export const WeatherCardSkeleton = () => {
  return (
    <div className="w-full p-6 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl">
      {/* Location and Time */}
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Temperature and Weather Icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start">
          <Skeleton className="h-16 w-24" /> {/* Temperature */}
          <Skeleton className="h-4 w-8 mt-2 ml-1" /> {/* Unit */}
        </div>
        <Skeleton variant="circular" className="h-16 w-16" /> {/* Weather Icon */}
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circular" className="h-8 w-8" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 