import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <div className="flex min-h-screen"><Skeleton className="hidden w-72 rounded-none md:block" /><div className="flex-1 space-y-6 p-8"><Skeleton className="h-10 w-64" /><Skeleton className="h-12 w-full" /><Skeleton className="h-80 w-full" /></div></div>;
}
