import { Skeleton } from "@/components/ui/skeleton";

interface VideoSkeletonProps {
  count?: number;
}

export const VideoSkeleton = ({ count = 1 }: VideoSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full h-dvh bg-background">
          {/* Video area skeleton */}
          <div className="absolute inset-0">
            <Skeleton className="w-full h-full bg-muted" />
          </div>
          
          {/* Overlay skeleton */}
          <div className="absolute bottom-20 left-4 right-20 space-y-2">
            <Skeleton className="h-6 w-3/4 bg-muted/80" />
            <Skeleton className="h-4 w-1/2 bg-muted/80" />
          </div>
          
          {/* Sidebar skeleton */}
          <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-muted/80" />
            <Skeleton className="w-10 h-10 rounded-full bg-muted/80" />
            <Skeleton className="w-10 h-10 rounded-full bg-muted/80" />
            <Skeleton className="w-10 h-10 rounded-full bg-muted/80" />
          </div>
          
          {/* Sound toggle skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="w-12 h-12 rounded-full bg-muted/80" />
          </div>
          
          {/* Progress bar skeleton */}
          <div className="absolute bottom-14 left-0 right-0 h-[3px] bg-muted/20">
            <Skeleton className="h-full w-1/3 bg-muted/80" />
          </div>
        </div>
      ))}
    </>
  );
};

export const FeedSkeleton = () => {
  return (
    <div className="w-full h-dvh max-w-lg mx-auto bg-background">
      {/* Header skeleton */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm p-4">
        <div className="flex justify-center gap-8">
          <Skeleton className="h-6 w-16 bg-muted" />
          <Skeleton className="h-6 w-16 bg-muted" />
        </div>
      </div>
      
      <VideoSkeleton count={3} />
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-dvh bg-background pb-16">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <Skeleton className="w-8 h-8 bg-muted" />
        <Skeleton className="h-6 w-32 bg-muted" />
        <Skeleton className="w-8 h-8 bg-muted" />
      </div>
      
      {/* Profile info skeleton */}
      <div className="flex flex-col items-center py-3 space-y-3">
        <Skeleton className="w-24 h-24 rounded-full bg-muted" />
        <Skeleton className="h-4 w-24 bg-muted" />
        <div className="flex gap-6">
          <Skeleton className="h-8 w-16 bg-muted" />
          <Skeleton className="h-8 w-16 bg-muted" />
          <Skeleton className="h-8 w-16 bg-muted" />
        </div>
        <Skeleton className="h-10 w-32 bg-muted" />
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex border-b border-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-12 flex items-center justify-center">
            <Skeleton className="w-6 h-6 bg-muted" />
          </div>
        ))}
      </div>
      
      {/* Video grid skeleton */}
      <div className="grid grid-cols-3 gap-px">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] bg-muted" />
        ))}
      </div>
    </div>
  );
};
