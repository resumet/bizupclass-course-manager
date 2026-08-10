import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-12 w-full" /><Skeleton className="h-80 w-full" /></div>;
}
