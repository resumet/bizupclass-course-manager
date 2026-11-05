"use client";

import { Clipboard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  previewTitle?: string;
};

export function RawContentEditor({
  id,
  value,
  onChange,
  label,
  placeholder,
  previewTitle = "미리보기",
}: Props) {
  const lineCount = value === "" ? 0 : value.split("\n").length;

  async function copyContent() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("원문을 그대로 복사했습니다.");
    } catch {
      toast.error("원문을 복사하지 못했습니다.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <Label htmlFor={id}>{label}</Label>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              붙여넣은 줄바꿈, 빈 줄, 연속 공백을 자동으로 정리하지 않고 저장합니다.
            </p>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {value.length.toLocaleString("ko-KR")}자 · {lineCount.toLocaleString("ko-KR")}줄
          </span>
        </div>
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[34rem] resize-y whitespace-pre-wrap font-mono text-sm leading-6"
          spellCheck={false}
        />
      </section>

      <section className="space-y-2">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{previewTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">저장될 줄바꿈과 공백을 그대로 표시합니다.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyContent()} disabled={!value}>
            <Clipboard />
            원문 복사
          </Button>
        </div>
        <div
          className="min-h-[34rem] overflow-auto rounded-lg border bg-muted/25 p-4 font-mono text-sm leading-6 break-words"
          style={{ whiteSpace: "break-spaces", tabSize: 4 }}
        >
          {value || <span className="text-muted-foreground">입력한 원문이 여기에 그대로 표시됩니다.</span>}
        </div>
      </section>
    </div>
  );
}
