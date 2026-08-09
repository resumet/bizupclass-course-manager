import { Suspense } from "react";
import { BookOpenCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/env";

export default function LoginPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BookOpenCheck className="size-5" /></div>
          <div>
            <CardTitle className="text-2xl">강의 운영 관리</CardTitle>
            <CardDescription className="mt-2">운영자 계정으로 로그인해 강의와 연결 자료를 관리하세요.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong className="block">Supabase 연결이 필요합니다.</strong>
              <code className="text-xs">.env.example</code>을 복사해 <code className="text-xs">.env.local</code>을 설정한 뒤 다시 실행해 주세요.
            </div>
          ) : (
            <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}><LoginForm /></Suspense>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
