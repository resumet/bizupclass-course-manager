"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";

import { RawContentEditor } from "@/components/content/raw-content-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestJson } from "@/lib/client-api";
import type { CourseContentDocument, CourseContentType } from "@/types/database";

type Props = {
  courseId: string;
  documentType: CourseContentType;
  initialDocument: CourseContentDocument | null;
  title: string;
  description: string;
  editorLabel: string;
  placeholder: string;
  onDirtyChange: (dirty: boolean) => void;
  registerSave: (handler: () => Promise<boolean>) => void;
  onDataSaved: () => void;
};

export function CourseContentEditorTab({
  courseId,
  documentType,
  initialDocument,
  title,
  description,
  editorLabel,
  placeholder,
  onDirtyChange,
  registerSave,
  onDataSaved,
}: Props) {
  const [content, setContent] = useState(initialDocument?.content ?? "");
  const [savedContent, setSavedContent] = useState(initialDocument?.content ?? "");
  const [pending, setPending] = useState(false);
  const dirty = content !== savedContent;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    setPending(true);
    try {
      const saved = await requestJson<CourseContentDocument>(
        `/api/courses/${courseId}/content-documents/${documentType}`,
        { method: "PUT", body: JSON.stringify({ content }) },
      );
      setContent(saved.content);
      setSavedContent(saved.content);
      onDataSaved();
      toast.success(documentType === "contract_template" ? "계약서 템플릿을 저장했습니다." : "인스타그램 DM 콘텐츠를 저장했습니다.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "원문을 저장하지 못했습니다.");
      return false;
    } finally {
      setPending(false);
    }
  }, [content, courseId, documentType, onDataSaved]);

  useEffect(() => registerSave(save), [registerSave, save]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <RawContentEditor
          id={`${documentType}-content`}
          value={content}
          onChange={setContent}
          label={editorLabel}
          placeholder={placeholder}
          previewTitle={documentType === "contract_template" ? "계약서 원문 미리보기" : "DM 원문 미리보기"}
        />
        <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t bg-card/95 py-4 backdrop-blur">
          {dirty ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <span className="size-1.5 rounded-full bg-amber-500" />변경사항 있음
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="size-3.5" />저장됨</span>
          )}
          <Button onClick={() => void save()} disabled={!dirty || pending}>
            {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
            {pending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
