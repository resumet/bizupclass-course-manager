"use client";

import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kstDateTimeToIso, kstDateToIso, nullable, requestJson } from "@/lib/client-api";
import type { Course } from "@/types/database";

type Props = { onCreated: (course: Course) => void };

export function CourseCreateDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ title: "", instructor: "", webinar: "", opening: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const course = await requestJson<Course>("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          instructor_name: nullable(form.instructor),
          webinar_at: kstDateTimeToIso(form.webinar),
          opening_at: kstDateToIso(form.opening),
        }),
      });
      toast.success("강의가 추가되었습니다.");
      setOpen(false);
      setForm({ title: "", instructor: "", webinar: "", opening: "" });
      onCreated(course);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "강의를 추가하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start"><Plus />새 강의 추가</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 강의 추가</DialogTitle>
            <DialogDescription>운영에 필요한 기본 일정을 먼저 등록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-title">강의명 <span className="text-destructive">*</span></Label>
              <Input id="new-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required autoFocus />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-instructor">강사명</Label>
              <Input id="new-instructor" value={form.instructor} onChange={(event) => setForm({ ...form, instructor: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-webinar">웨비나 날짜</Label>
              <Input id="new-webinar" type="datetime-local" value={form.webinar} onChange={(event) => setForm({ ...form, webinar: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-opening">개강 날짜</Label>
              <Input id="new-opening" type="date" value={form.opening} onChange={(event) => setForm({ ...form, opening: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>취소</Button>
            <Button type="submit" disabled={pending || !form.title.trim()}>
              {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
              {pending ? "추가 중..." : "강의 추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
