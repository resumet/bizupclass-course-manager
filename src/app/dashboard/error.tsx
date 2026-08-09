"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <Card className="max-w-md">
        <CardHeader><AlertCircle className="size-6 text-destructive" /><CardTitle>데이터를 불러오지 못했습니다.</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground"><p>Supabase 연결과 데이터베이스 마이그레이션 상태를 확인해 주세요.</p><Button onClick={reset}>다시 시도</Button></CardContent>
      </Card>
    </main>
  );
}
