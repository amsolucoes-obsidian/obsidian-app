import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] p-8 space-y-4">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-12 w-48 rounded-lg bg-white/5" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl bg-white/5" />
          <Skeleton className="h-32 rounded-xl bg-white/5" />
          <Skeleton className="h-32 rounded-xl bg-white/5" />
          <Skeleton className="h-32 rounded-xl bg-white/5" />
        </div>
        <Skeleton className="h-64 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}