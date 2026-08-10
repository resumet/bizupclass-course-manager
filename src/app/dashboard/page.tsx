import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { isoToKstDate } from "@/lib/client-api";

export default function DashboardPage() {
  return <DashboardHome todayKst={isoToKstDate(new Date().toISOString())} />;
}
