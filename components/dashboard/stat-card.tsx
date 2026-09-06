import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: "primary" | "warning" | "muted"
  loading?: boolean
  /**
   * Qualifies the number when it does not mean quite what it looks like.
   *
   * Reserved for the caveat that changes how the figure should be read — not
   * for a subtitle. A stat card states a fact; when the fact has an asterisk,
   * the asterisk belongs next to it and not in a tooltip.
   */
  hint?: string
}

const accents = {
  primary: "bg-success-surface text-success-text",
  warning: "bg-warning-surface text-warning-text",
  muted: "bg-secondary text-foreground",
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "muted",
  loading,
  hint,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        {/*
          The icon centres against the label and the value, never against the
          hint. When the hint took part, a card carrying one dropped its icon
          ~11px and the three-up row stopped aligning. Hanging the hint below
          the row also gives it the full card width instead of breaking it
          into two lines against the edge.
        */}
        <div className="flex items-center gap-4">
          <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", accents[accent])}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-body text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-12" />
            ) : (
              <p className="font-heading text-headline font-bold tracking-tight">{value}</p>
            )}
          </div>
        </div>
        {hint && <p className="text-caption text-muted-foreground text-pretty">{hint}</p>}
      </CardContent>
    </Card>
  )
}
