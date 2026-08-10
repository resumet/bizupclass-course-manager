"use client";

import { useState } from "react";
import { ExternalLink, Link2, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { isHttpUrl, nullable, requestJson } from "@/lib/client-api";
import type { GlobalCourseLink } from "@/types/database";

type Props = { initialLinks: GlobalCourseLink[] };
type EditingTarget = GlobalCourseLink | "new" | null;

export function CourseLinksManager({ initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [editing, setEditing] = useState<EditingTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<GlobalCourseLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteLink() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await requestJson<void>(`/api/course-links/${deleteTarget.id}`, { method: "DELETE" });
      setLinks((current) => current.filter((link) => link.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("강의용 링크를 삭제했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "링크를 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">글로벌 메뉴</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">강의용 링크</h1>
          <p className="mt-1 text-sm text-muted-foreground">모든 강의에서 공통으로 사용하는 링크를 저장하고 관리합니다.</p>
        </div>
        <Button onClick={() => setEditing("new")}><Plus />링크 추가</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>저장된 링크</CardTitle>
          <CardDescription>링크 이름을 눌러 새 창에서 열거나 관리 버튼으로 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead>링크 이름</TableHead><TableHead>URL</TableHead><TableHead>메모</TableHead><TableHead className="w-28 text-right">관리</TableHead></TableRow></TableHeader>
              <TableBody>
                {links.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-40 text-center"><div className="flex flex-col items-center gap-2 text-muted-foreground"><Link2 className="size-7" /><span>저장된 강의용 링크가 없습니다.</span><Button size="sm" variant="outline" onClick={() => setEditing("new")}><Plus />첫 링크 추가</Button></div></TableCell></TableRow>
                ) : links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium"><a className="inline-flex items-center gap-1.5 hover:underline" href={link.url} target="_blank" rel="noreferrer">{link.title}<ExternalLink className="size-3.5 text-muted-foreground" /></a></TableCell>
                    <TableCell><span className="block max-w-72 truncate text-xs text-muted-foreground" title={link.url}>{link.url}</span></TableCell>
                    <TableCell><span className="block max-w-80 truncate text-sm text-muted-foreground" title={link.description ?? undefined}>{link.description || "—"}</span></TableCell>
                    <TableCell><div className="flex justify-end"><Button variant="ghost" size="icon-sm" onClick={() => setEditing(link)} aria-label={`${link.title} 수정`}><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(link)} aria-label={`${link.title} 삭제`}><Trash2 /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing ? <CourseLinkDialog key={editing === "new" ? "new" : editing.id} link={editing === "new" ? null : editing} nextOrder={links.length} onOpenChange={(open) => { if (!open) setEditing(null); }} onSaved={(saved) => { setLinks((current) => current.some((link) => link.id === saved.id) ? current.map((link) => link.id === saved.id ? saved : link) : [...current, saved]); setEditing(null); }} /> : null}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>이 링크를 삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>{deleteTarget?.title} 링크가 목록에서 영구 삭제됩니다.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={deleting} onClick={(event) => { event.preventDefault(); void deleteLink(); }}>{deleting ? "삭제 중..." : "삭제"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CourseLinkDialog({ link, nextOrder, onOpenChange, onSaved }: { link: GlobalCourseLink | null; nextOrder: number; onOpenChange: (open: boolean) => void; onSaved: (link: GlobalCourseLink) => void }) {
  const [form, setForm] = useState({ title: link?.title ?? "", url: link?.url ?? "", description: link?.description ?? "" });
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("링크 이름을 입력해 주세요.");
    if (!isHttpUrl(form.url)) return toast.error("올바른 HTTP 또는 HTTPS URL을 입력해 주세요.");
    setPending(true);
    try {
      const saved = await requestJson<GlobalCourseLink>(link ? `/api/course-links/${link.id}` : "/api/course-links", {
        method: link ? "PATCH" : "POST",
        body: JSON.stringify({ title: form.title, url: form.url, description: nullable(form.description), sort_order: link?.sort_order ?? nextOrder }),
      });
      toast.success(link ? "강의용 링크를 수정했습니다." : "강의용 링크를 추가했습니다.");
      onSaved(saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "링크를 저장하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader><DialogTitle>{link ? "강의용 링크 수정" : "강의용 링크 추가"}</DialogTitle><DialogDescription>강의 운영에 자주 사용하는 링크와 간단한 설명을 저장합니다.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2"><Label htmlFor="global-link-title">링크 이름 <span className="text-destructive">*</span></Label><Input id="global-link-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="예: 강의 신청 페이지" autoFocus required /></div>
            <div className="space-y-2"><Label htmlFor="global-link-url">URL <span className="text-destructive">*</span></Label><Input id="global-link-url" type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://bizupclass.com" required /></div>
            <div className="space-y-2"><Label htmlFor="global-link-description">메모</Label><Textarea id="global-link-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="링크의 용도나 참고사항을 입력하세요." /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>취소</Button><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Link2 />}{pending ? "저장 중..." : "저장"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
