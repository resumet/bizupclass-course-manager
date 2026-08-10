import { Badge } from "@/components/ui/badge";
import { COURSE_STATUS_CONFIG } from "@/lib/course-status";
import { cn } from "@/lib/utils";
import type { CourseStatus } from "@/types/database";

type Props = { status: CourseStatus; className?: string; iconOnly?: boolean };

export function CourseStatusBadge({ status, className, iconOnly = false }: Props) {
  const { Icon, label, badgeClassName } = COURSE_STATUS_CONFIG[status];

  if (iconOnly) {
    return (
      <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full border", badgeClassName, className)} title={label} aria-label={`상태: ${label}`}>
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
    );
  }

  return <Badge variant="outline" className={cn(badgeClassName, className)}><Icon />{label}</Badge>;
}
