"use client";

import { cloneElement, isValidElement, useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChartNoAxesColumnIncreasing, Check, Clipboard, ExternalLink, FileText, Globe2, LoaderCircle, Pencil, Plus, Save, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { LandingPageTrafficDialog } from "@/components/courses/landing-page-traffic-dialog";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatKoreanDate, isoToKstDate, isoToKstDateTime, isHttpUrl, kstDateTimeToIso, kstDateToIso, nullable, requestJson } from "@/lib/client-api";
import { COURSE_STATUSES, COURSE_STATUS_CONFIG } from "@/lib/course-status";
import { DEFAULT_SHARED_RESOURCE_URL } from "@/lib/shared-resource-defaults";
import type { Course, CourseBundle, CourseStatus, LandingPage, SharedResource, YoutubeAppearance } from "@/types/database";

type TabKey = "basic" | "youtube" | "landing" | "resources";
type SaveHandler = () => Promise<boolean>;
type SharedTabProps = {
  onDirtyChange: (dirty: boolean) => void;
  registerSave: (handler: SaveHandler) => void;
  onDataSaved: () => void;
};
type Props = Pick<SharedTabProps, "onDirtyChange" | "registerSave"> & {
  bundle: CourseBundle | null;
  guardNavigation: (action: () => void) => void;
  onCourseUpdated: (course: Course) => void;
};

const noopSubscribe = () => () => undefined;
const courseTabTriggerClassName = "min-h-9 flex-none px-3 py-2 hover:bg-background/70 data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm data-active:hover:bg-primary data-active:hover:text-primary-foreground dark:data-active:border-primary dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:hover:text-primary-foreground sm:px-4";

function SaveBar({ dirty, pending, onSave }: { dirty: boolean; pending: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t bg-card/95 py-4 backdrop-blur">
      {dirty ? <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700"><span className="size-1.5 rounded-full bg-amber-500" />변경사항 있음</span> : <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="size-3.5" />저장됨</span>}
      <Button onClick={onSave} disabled={!dirty || pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
        {pending ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}

export function CourseWorkspace({ bundle, onDirtyChange, registerSave, guardNavigation, onCourseUpdated }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const onDataSaved = useCallback(() => router.refresh(), [router]);

  if (!bundle) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center">
        <Card className="w-full border-dashed text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted"><BookOpen className="size-5 text-muted-foreground" /></div>
            <CardTitle>관리할 강의를 선택하세요</CardTitle>
            <CardDescription>왼쪽 목록에서 강의를 선택하거나 새 강의를 추가하면 상세 정보를 관리할 수 있습니다.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tabProps = { onDirtyChange, registerSave, onDataSaved };
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{bundle.course.title}</h1><CourseStatusBadge status={bundle.course.status} /></div>
        <p className="mt-1 text-sm text-muted-foreground">{bundle.course.instructor_name || "강사 미정"} · 웨비나 {formatKoreanDate(bundle.course.webinar_at, true)}</p>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => guardNavigation(() => setActiveTab(value as TabKey))}>
        <TabsList className="mb-5 h-auto w-full justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-xl border bg-muted/60 p-1 shadow-inner">
          <TabsTrigger className={courseTabTriggerClassName} value="basic"><BookOpen />기본 정보</TabsTrigger>
          <TabsTrigger className={courseTabTriggerClassName} value="youtube"><Video />유튜브 출연</TabsTrigger>
          <TabsTrigger className={courseTabTriggerClassName} value="landing"><Globe2 />랜딩페이지</TabsTrigger>
          <TabsTrigger className={courseTabTriggerClassName} value="resources"><FileText />자료 공유</TabsTrigger>
        </TabsList>
      </Tabs>
      {activeTab === "basic" ? <BasicInfoTab course={bundle.course} onCourseUpdated={onCourseUpdated} {...tabProps} /> : null}
      {activeTab === "youtube" ? <YoutubeTab courseId={bundle.course.id} initialItems={bundle.youtube} {...tabProps} /> : null}
      {activeTab === "landing" ? <LandingTab courseId={bundle.course.id} initialItems={bundle.landingPages} {...tabProps} /> : null}
      {activeTab === "resources" ? <ResourcesTab courseId={bundle.course.id} initialItems={bundle.resources} {...tabProps} /> : null}
    </div>
  );
}

function BasicInfoTab({ course, onCourseUpdated, onDirtyChange, registerSave, onDataSaved }: SharedTabProps & { course: Course; onCourseUpdated: (course: Course) => void }) {
  const initial = useCallback(() => ({ title: course.title, instructor: course.instructor_name ?? "", webinar: isoToKstDateTime(course.webinar_at), opening: isoToKstDate(course.opening_at), status: course.status }), [course]);
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, setPending] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    if (!form.title.trim()) { toast.error("강의명을 입력해 주세요."); return false; }
    setPending(true);
    try {
      const updated = await requestJson<Course>(`/api/courses/${course.id}`, { method: "PATCH", body: JSON.stringify({ title: form.title, instructor_name: nullable(form.instructor), webinar_at: kstDateTimeToIso(form.webinar), opening_at: kstDateToIso(form.opening), status: form.status }) });
      setSaved(form);
      onCourseUpdated(updated);
      onDataSaved();
      toast.success("기본 정보가 저장되었습니다.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장하지 못했습니다.");
      return false;
    } finally { setPending(false); }
  }, [course.id, form, onCourseUpdated, onDataSaved]);

  useEffect(() => registerSave(save), [registerSave, save]);

  return (
    <Card>
      <CardHeader><CardTitle>기본 정보</CardTitle><CardDescription>강의명과 주요 일정을 관리합니다. 시간은 한국 표준시(KST) 기준입니다.</CardDescription></CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><Label htmlFor="course-title">강의명 <span className="text-destructive">*</span></Label><Input id="course-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="course-instructor">강사명</Label><Input id="course-instructor" value={form.instructor} onChange={(event) => setForm({ ...form, instructor: event.target.value })} /></div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="course-status">강의 상태</Label>
            <Select value={form.status} onValueChange={(status) => setForm({ ...form, status: status as CourseStatus })}>
              <SelectTrigger id="course-status" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COURSE_STATUSES.map((status) => {
                  const { Icon, label } = COURSE_STATUS_CONFIG[status];
                  return <SelectItem key={status} value={status}><Icon />{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="course-webinar">웨비나 날짜</Label><Input id="course-webinar" type="datetime-local" value={form.webinar} onChange={(event) => setForm({ ...form, webinar: event.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="course-opening">개강 날짜</Label><Input id="course-opening" type="date" value={form.opening} onChange={(event) => setForm({ ...form, opening: event.target.value })} /></div>
        </div>
        <SaveBar dirty={dirty} pending={pending} onSave={() => void save()} />
      </CardContent>
    </Card>
  );
}

type YoutubeDraft = YoutubeAppearance & { isNew?: boolean };
const emptyYoutube = (courseId: string, order: number): YoutubeDraft => ({ id: `new-${crypto.randomUUID()}`, course_id: courseId, channel_name: "", appearance_fee: 0, revenue_share: null, contact_name: null, contact_phone: null, filming_at: null, youtube_url: null, sort_order: order, created_at: "", updated_at: "", isNew: true });

function YoutubeTab({ courseId, initialItems, onDirtyChange, registerSave, onDataSaved }: SharedTabProps & { courseId: string; initialItems: YoutubeAppearance[] }) {
  const [items, setItems] = useState<YoutubeDraft[]>(initialItems);
  const [saved, setSaved] = useState<YoutubeDraft[]>(initialItems);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [editing, setEditing] = useState<YoutubeDraft | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = deleted.length > 0 || JSON.stringify(items) !== JSON.stringify(saved);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    setPending(true);
    try {
      const savedRows: YoutubeAppearance[] = [];
      for (const [index, item] of items.entries()) {
        const payload = { channel_name: item.channel_name, appearance_fee: item.appearance_fee, revenue_share: item.revenue_share, contact_name: item.contact_name, contact_phone: item.contact_phone, filming_at: item.filming_at, youtube_url: item.youtube_url, sort_order: index };
        const row = await requestJson<YoutubeAppearance>(item.isNew ? `/api/courses/${courseId}/youtube` : `/api/youtube/${item.id}`, { method: item.isNew ? "POST" : "PATCH", body: JSON.stringify(payload) });
        savedRows.push(row);
      }
      for (const id of deleted) await requestJson<void>(`/api/youtube/${id}`, { method: "DELETE" });
      setItems(savedRows); setSaved(savedRows); setDeleted([]);
      onDataSaved();
      toast.success("유튜브 출연 정보가 저장되었습니다.");
      return true;
    } catch (error) { toast.error(error instanceof Error ? error.message : "저장하지 못했습니다."); return false; }
    finally { setPending(false); }
  }, [courseId, deleted, items, onDataSaved]);
  useEffect(() => registerSave(save), [registerSave, save]);

  function applyDraft(draft: YoutubeDraft) {
    if (!draft.channel_name.trim()) return toast.error("채널 이름을 입력해 주세요.");
    if (draft.revenue_share !== null && (draft.revenue_share < 0 || draft.revenue_share > 100)) return toast.error("RS는 0~100 사이여야 합니다.");
    setItems((current) => current.some((item) => item.id === draft.id) ? current.map((item) => item.id === draft.id ? draft : item) : [...current, draft]);
    setEditing(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>유튜브 출연</CardTitle><CardDescription className="mt-1.5">채널별 출연 조건과 촬영 일정을 관리합니다.</CardDescription></div><Button onClick={() => setEditing(emptyYoutube(courseId, items.length))}><Plus />출연 추가</Button></CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table><TableHeader><TableRow><TableHead>채널</TableHead><TableHead className="text-right">출연료</TableHead><TableHead className="text-right">RS</TableHead><TableHead>담당자</TableHead><TableHead>촬영일</TableHead><TableHead>YouTube</TableHead><TableHead className="w-24">관리</TableHead></TableRow></TableHeader>
            <TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">등록된 유튜브 출연 정보가 없습니다.</TableCell></TableRow> : items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.channel_name}</TableCell><TableCell className="text-right tabular-nums">{item.appearance_fee.toLocaleString("ko-KR")}원</TableCell><TableCell className="text-right">{item.revenue_share ?? 0}%</TableCell><TableCell><span className="block">{item.contact_name || "—"}</span><span className="text-xs text-muted-foreground">{item.contact_phone}</span></TableCell><TableCell>{formatKoreanDate(item.filming_at, true)}</TableCell><TableCell>{item.youtube_url ? <Button asChild variant="ghost" size="sm"><a href={item.youtube_url} target="_blank" rel="noreferrer"><ExternalLink />링크</a></Button> : "—"}</TableCell><TableCell><div className="flex"><Button variant="ghost" size="icon-sm" onClick={() => setEditing(item)} aria-label="수정"><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => { setItems((current) => current.filter((row) => row.id !== item.id)); if (!item.isNew) setDeleted((current) => [...current, item.id]); }} aria-label="삭제"><Trash2 /></Button></div></TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
        <SaveBar dirty={dirty} pending={pending} onSave={() => void save()} />
      </CardContent>
      {editing ? <YoutubeDialog key={editing.id} item={editing} onOpenChange={(open) => { if (!open) setEditing(null); }} onApply={applyDraft} /> : null}
    </Card>
  );
}

function YoutubeDialog({ item, onOpenChange, onApply }: { item: YoutubeDraft; onOpenChange: (open: boolean) => void; onApply: (item: YoutubeDraft) => void }) {
  const [draft, setDraft] = useState<YoutubeDraft>(item);
  return <Dialog open={Boolean(item)} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{draft.isNew ? "유튜브 출연 추가" : "유튜브 출연 수정"}</DialogTitle><DialogDescription>내용을 적용한 뒤 탭 하단의 저장 버튼을 눌러야 DB에 반영됩니다.</DialogDescription></DialogHeader><div className="grid gap-4 py-4 sm:grid-cols-2">
    <Field label="채널 이름" required><Input value={draft.channel_name} onChange={(e) => setDraft({ ...draft, channel_name: e.target.value })} /></Field>
    <Field label="출연료"><Input type="number" min="0" value={draft.appearance_fee} onChange={(e) => setDraft({ ...draft, appearance_fee: Number(e.target.value) })} /></Field>
    <Field label="RS (%)"><Input type="number" min="0" max="100" step="0.01" value={draft.revenue_share ?? ""} onChange={(e) => setDraft({ ...draft, revenue_share: e.target.value ? Number(e.target.value) : null })} /></Field>
    <Field label="촬영 날짜"><Input type="datetime-local" value={isoToKstDateTime(draft.filming_at)} onChange={(e) => setDraft({ ...draft, filming_at: kstDateTimeToIso(e.target.value) })} /></Field>
    <Field label="담당자 이름"><Input value={draft.contact_name ?? ""} onChange={(e) => setDraft({ ...draft, contact_name: nullable(e.target.value) })} /></Field>
    <Field label="담당자 전화번호"><Input type="tel" placeholder="010-1234-5678" value={draft.contact_phone ?? ""} onChange={(e) => setDraft({ ...draft, contact_phone: nullable(e.target.value) })} /></Field>
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="youtube-url">유튜브 주소</Label><Input id="youtube-url" type="url" placeholder="https://youtube.com/watch?v=..." value={draft.youtube_url ?? ""} onChange={(e) => setDraft({ ...draft, youtube_url: nullable(e.target.value) })} /></div>
  </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button><Button onClick={() => onApply(draft)}>목록에 적용</Button></DialogFooter></DialogContent></Dialog>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  const id = useId();
  const field = isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children;
  return <div className="space-y-2"><Label htmlFor={id}>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>{field}</div>;
}

type LandingDraft = LandingPage & { isNew?: boolean };
const emptyLanding = (courseId: string, order: number): LandingDraft => ({ id: `new-${crypto.randomUUID()}`, course_id: courseId, name: "", original_url: "", short_code: "", sort_order: order, created_at: "", updated_at: "", isNew: true });

function ShortUrl({ code }: { code: string }) {
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");
  if (!code) return <span className="text-xs text-muted-foreground">저장 시 생성</span>;
  const shortUrl = `${origin}/s/${code}`;
  return <div className="flex min-w-60 items-center gap-1"><code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{origin ? shortUrl : `/s/${code}`}</code><Button variant="ghost" size="icon-sm" aria-label="짧은 주소 복사" onClick={async () => { await navigator.clipboard.writeText(shortUrl); toast.success("짧은 주소가 복사되었습니다."); }}><Clipboard /></Button></div>;
}

function LandingTab({ courseId, initialItems, onDirtyChange, registerSave, onDataSaved }: SharedTabProps & { courseId: string; initialItems: LandingPage[] }) {
  const [items, setItems] = useState<LandingDraft[]>(initialItems);
  const [saved, setSaved] = useState<LandingDraft[]>(initialItems);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [editing, setEditing] = useState<LandingDraft | null>(null);
  const [trafficTarget, setTrafficTarget] = useState<LandingPage | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = deleted.length > 0 || JSON.stringify(items) !== JSON.stringify(saved);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    setPending(true);
    try {
      const savedRows: LandingPage[] = [];
      for (const [index, item] of items.entries()) {
        const payload = { name: item.name, original_url: item.original_url, sort_order: index };
        const row = await requestJson<LandingPage>(item.isNew ? `/api/courses/${courseId}/landing-pages` : `/api/landing-pages/${item.id}`, { method: item.isNew ? "POST" : "PATCH", body: JSON.stringify(payload) });
        savedRows.push(row);
      }
      for (const id of deleted) await requestJson<void>(`/api/landing-pages/${id}`, { method: "DELETE" });
      setItems(savedRows); setSaved(savedRows); setDeleted([]);
      onDataSaved();
      toast.success("랜딩페이지가 저장되었습니다.");
      return true;
    } catch (error) { toast.error(error instanceof Error ? error.message : "저장하지 못했습니다."); return false; }
    finally { setPending(false); }
  }, [courseId, deleted, items, onDataSaved]);
  useEffect(() => registerSave(save), [registerSave, save]);

  function applyDraft(draft: LandingDraft) {
    if (!draft.name.trim()) return toast.error("랜딩페이지 이름을 입력해 주세요.");
    if (!isHttpUrl(draft.original_url)) return toast.error("올바른 HTTP 또는 HTTPS 원본 URL을 입력해 주세요.");
    setItems((current) => current.some((item) => item.id === draft.id) ? current.map((item) => item.id === draft.id ? draft : item) : [...current, draft]);
    setEditing(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>랜딩페이지 관리</CardTitle><CardDescription className="mt-1.5">저장할 때 서버에서 6자리 Short Code가 자동 생성됩니다.</CardDescription></div><Button onClick={() => setEditing(emptyLanding(courseId, items.length))}><Plus />랜딩페이지 추가</Button></CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>이름</TableHead><TableHead>원본 URL</TableHead><TableHead>짧은 URL</TableHead><TableHead className="w-28">관리</TableHead></TableRow></TableHeader><TableBody>
          {items.length === 0 ? <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">등록된 랜딩페이지가 없습니다.</TableCell></TableRow> : items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.name}</TableCell><TableCell><Button asChild variant="ghost" size="sm"><a className="max-w-72" href={item.original_url} target="_blank" rel="noreferrer"><ExternalLink /><span className="truncate">{item.original_url}</span></a></Button></TableCell><TableCell><ShortUrl code={item.short_code} /></TableCell><TableCell><div className="flex"><Button variant="ghost" size="icon-sm" onClick={() => setTrafficTarget(item)} disabled={Boolean(item.isNew)} aria-label="유입 통계"><ChartNoAxesColumnIncreasing /></Button><Button variant="ghost" size="icon-sm" onClick={() => setEditing(item)} aria-label="수정"><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => { setItems((current) => current.filter((row) => row.id !== item.id)); if (!item.isNew) setDeleted((current) => [...current, item.id]); }} aria-label="삭제"><Trash2 /></Button></div></TableCell></TableRow>)}
        </TableBody></Table></div>
        <div className="mt-4 rounded-lg bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">운영 안내</strong> · Preview 환경의 주소는 테스트용입니다. 외부 공유용 짧은 주소는 Vercel Production 배포 화면에서 복사하세요.</div>
        <SaveBar dirty={dirty} pending={pending} onSave={() => void save()} />
      </CardContent>
      {editing ? <LandingDialog key={editing.id} item={editing} onOpenChange={(open) => { if (!open) setEditing(null); }} onApply={applyDraft} /> : null}
      {trafficTarget ? <LandingPageTrafficDialog key={trafficTarget.id} landingPage={trafficTarget} onOpenChange={(open) => { if (!open) setTrafficTarget(null); }} /> : null}
    </Card>
  );
}

function LandingDialog({ item, onOpenChange, onApply }: { item: LandingDraft; onOpenChange: (open: boolean) => void; onApply: (item: LandingDraft) => void }) {
  const [draft, setDraft] = useState<LandingDraft>(item);
  return <Dialog open={Boolean(item)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{draft.isNew ? "랜딩페이지 추가" : "랜딩페이지 수정"}</DialogTitle><DialogDescription>원본 주소는 나중에 바꿔도 동일한 Short Code를 유지합니다.</DialogDescription></DialogHeader><div className="space-y-4 py-4"><Field label="이름" required><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field><Field label="원본 랜딩페이지 주소" required><Input type="url" placeholder="https://example.com/webinar" value={draft.original_url} onChange={(e) => setDraft({ ...draft, original_url: e.target.value })} /></Field>{draft.short_code ? <Field label="Short Code"><Input value={draft.short_code} readOnly disabled /></Field> : null}</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button><Button onClick={() => onApply(draft)}>목록에 적용</Button></DialogFooter></DialogContent></Dialog>;
}

type ResourceDraft = SharedResource & { isNew?: boolean };
const emptyResource = (courseId: string, order: number): ResourceDraft => ({ id: `new-${crypto.randomUUID()}`, course_id: courseId, name: "", resource_type: "기타", url: DEFAULT_SHARED_RESOURCE_URL, sort_order: order, created_at: "", updated_at: "", isNew: true });
const resourceTypes = ["Google Drive", "Google Docs", "Google Sheets", "Google Slides", "Notion", "Figma", "Dropbox", "기타"];

function ResourcesTab({ courseId, initialItems, onDirtyChange, registerSave, onDataSaved }: SharedTabProps & { courseId: string; initialItems: SharedResource[] }) {
  const [items, setItems] = useState<ResourceDraft[]>(initialItems);
  const [saved, setSaved] = useState<ResourceDraft[]>(initialItems);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [editing, setEditing] = useState<ResourceDraft | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = deleted.length > 0 || JSON.stringify(items) !== JSON.stringify(saved);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    setPending(true);
    try {
      const savedRows: SharedResource[] = [];
      for (const [index, item] of items.entries()) {
        const payload = { name: item.name, resource_type: item.resource_type, url: item.url, sort_order: index };
        const row = await requestJson<SharedResource>(item.isNew ? `/api/courses/${courseId}/resources` : `/api/resources/${item.id}`, { method: item.isNew ? "POST" : "PATCH", body: JSON.stringify(payload) });
        savedRows.push(row);
      }
      for (const id of deleted) await requestJson<void>(`/api/resources/${id}`, { method: "DELETE" });
      setItems(savedRows); setSaved(savedRows); setDeleted([]);
      onDataSaved();
      toast.success("자료 공유 정보가 저장되었습니다.");
      return true;
    } catch (error) { toast.error(error instanceof Error ? error.message : "저장하지 못했습니다."); return false; }
    finally { setPending(false); }
  }, [courseId, deleted, items, onDataSaved]);
  useEffect(() => registerSave(save), [registerSave, save]);

  function applyDraft(draft: ResourceDraft) {
    if (!draft.name.trim()) return toast.error("자료명을 입력해 주세요.");
    if (!isHttpUrl(draft.url)) return toast.error("올바른 HTTP 또는 HTTPS URL을 입력해 주세요.");
    setItems((current) => current.some((item) => item.id === draft.id) ? current.map((item) => item.id === draft.id ? draft : item) : [...current, draft]);
    setEditing(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>자료 공유</CardTitle><CardDescription className="mt-1.5">Google Drive, Notion 등 강의 운영 자료를 모아둡니다.</CardDescription></div><Button onClick={() => setEditing(emptyResource(courseId, items.length))}><Plus />자료 추가</Button></CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>자료명</TableHead><TableHead>유형</TableHead><TableHead>링크</TableHead><TableHead className="w-24">관리</TableHead></TableRow></TableHeader><TableBody>
          {items.length === 0 ? <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">등록된 공유 자료가 없습니다.</TableCell></TableRow> : items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.name}</TableCell><TableCell><Badge variant="outline">{item.resource_type || "기타"}</Badge></TableCell><TableCell><Button asChild variant="ghost" size="sm"><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink />새 탭에서 열기</a></Button></TableCell><TableCell><div className="flex"><Button variant="ghost" size="icon-sm" onClick={() => setEditing(item)} aria-label="수정"><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => { setItems((current) => current.filter((row) => row.id !== item.id)); if (!item.isNew) setDeleted((current) => [...current, item.id]); }} aria-label="삭제"><Trash2 /></Button></div></TableCell></TableRow>)}
        </TableBody></Table></div>
        <SaveBar dirty={dirty} pending={pending} onSave={() => void save()} />
      </CardContent>
      {editing ? <ResourceDialog key={editing.id} item={editing} onOpenChange={(open) => { if (!open) setEditing(null); }} onApply={applyDraft} /> : null}
    </Card>
  );
}

function ResourceDialog({ item, onOpenChange, onApply }: { item: ResourceDraft; onOpenChange: (open: boolean) => void; onApply: (item: ResourceDraft) => void }) {
  const [draft, setDraft] = useState<ResourceDraft>(item);
  return <Dialog open={Boolean(item)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{draft.isNew ? "공유 자료 추가" : "공유 자료 수정"}</DialogTitle><DialogDescription>외부 자료는 새 탭에서 열립니다.</DialogDescription></DialogHeader><div className="space-y-4 py-4"><Field label="자료명" required><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field><Field label="자료 유형"><Select value={draft.resource_type ?? "기타"} onValueChange={(value) => setDraft({ ...draft, resource_type: value })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{resourceTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></Field><Field label="URL" required><Input type="url" placeholder="https://..." value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></Field></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button><Button onClick={() => onApply(draft)}>목록에 적용</Button></DialogFooter></DialogContent></Dialog>;
}
