"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requestJson } from "@/lib/client-api";
import type { LandingPage, LandingPageTraffic, ShortUrlClick } from "@/types/database";

type Props = {
  landingPage: LandingPage;
  onOpenChange: (open: boolean) => void;
};

const clickDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function referrerLabel(referrer: string | null) {
  if (!referrer) return "직접 유입";
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

function locationLabel(click: ShortUrlClick) {
  return [click.city, click.region, click.country_code].filter(Boolean).join(", ") || "—";
}

export function LandingPageTrafficDialog({ landingPage, onOpenChange }: Props) {
  const [traffic, setTraffic] = useState<LandingPageTraffic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTraffic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTraffic(await requestJson<LandingPageTraffic>(`/api/landing-pages/${landingPage.id}/traffic`));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "유입 통계를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [landingPage]);

  useEffect(() => {
    let cancelled = false;
    requestJson<LandingPageTraffic>(`/api/landing-pages/${landingPage.id}/traffic`)
      .then((data) => {
        if (!cancelled) setTraffic(data);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "유입 통계를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [landingPage.id]);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{landingPage.name} 유입 통계</DialogTitle>
          <DialogDescription>짧은 링크를 통해 유입된 클릭과 최근 방문 정보를 확인합니다. 시간은 한국 표준시(KST)입니다.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
          {loading && !traffic ? <TrafficLoading /> : null}

          {error ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center" role="alert">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void loadTraffic()} disabled={loading}>
                <RefreshCw className={loading ? "animate-spin" : ""} />다시 시도
              </Button>
            </div>
          ) : null}

          {traffic ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <TrafficMetric label="총 클릭" value={traffic.total} />
                <TrafficMetric label="오늘" value={traffic.today} />
                <TrafficMetric label="이번 주" value={traffic.thisWeek} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-medium">최근 유입</h3>
                  <span className="text-xs text-muted-foreground">최대 100건</span>
                </div>
                <div className="max-h-[45vh] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-44">방문 시각</TableHead>
                        <TableHead className="min-w-36">유입 경로</TableHead>
                        <TableHead className="min-w-40">지역</TableHead>
                        <TableHead className="min-w-72">사용자 에이전트</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {traffic.recent.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-28 text-center text-muted-foreground">아직 기록된 유입이 없습니다.</TableCell></TableRow>
                      ) : traffic.recent.map((click) => (
                        <TableRow key={click.id}>
                          <TableCell className="whitespace-nowrap tabular-nums">{clickDateFormatter.format(new Date(click.clicked_at))}</TableCell>
                          <TableCell className="max-w-52 truncate" title={click.referrer ?? "직접 유입"}>{referrerLabel(click.referrer)}</TableCell>
                          <TableCell>{locationLabel(click)}</TableCell>
                          <TableCell className="max-w-96 truncate text-xs text-muted-foreground" title={click.user_agent ?? "정보 없음"}>{click.user_agent || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrafficMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString("ko-KR")}</p>
    </div>
  );
}

function TrafficLoading() {
  return (
    <div className="space-y-5" aria-label="유입 통계를 불러오는 중">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-20" />)}
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}
