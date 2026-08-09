import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CourseNotFound() {
  return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-sm font-medium text-muted-foreground">404</p><h1 className="mt-2 text-2xl font-semibold">강의를 찾을 수 없습니다.</h1><Button asChild className="mt-6"><Link href="/dashboard"><ArrowLeft />대시보드로 돌아가기</Link></Button></div></main>;
}
