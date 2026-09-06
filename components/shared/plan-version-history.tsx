"use client"

import { History, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

/** The subset both `TrainingPlan` and `NutritionPlan` already satisfy. */
export interface PlanVersionSummary {
  id: number
  version: number
  title: string
  createdAt: string
  current: boolean
}

interface PlanVersionHistoryProps<T extends PlanVersionSummary> {
  versions: T[]
  activeId: number | null
  onSelect: (id: number) => void
  /**
   * Handed back the caller's own type, not the shared subset: both tabs put
   * the selected plan straight into their delete confirmation, and narrowing
   * it here would push a cast onto every call site.
   */
  onDelete: (version: T) => void
  /** "plan" or "plan nutricional" — used in the explanatory line. */
  noun: string
}

/**
 * The version strip under a plan's header.
 *
 * Shared because the training and nutrition tabs render the identical control
 * over the identical shape; only the noun in the explanation differs.
 *
 * ## Why each chip carries a date
 *
 * It used to be a row of bare `v1 v2 v3` buttons. Choosing which one to look at
 * then meant remembering what was in each — the one thing the screen could have
 * told the reader and did not. The date is what a trainer actually reasons
 * about ("la de antes de las vacaciones"), and the title lands in the tooltip
 * for the case where two versions share a week.
 *
 * The line above them exists because nothing else in the app ever defines what
 * a version *is*: publishing makes one, editing in place does not, and the
 * strip is meaningless until that is said once.
 */
export function PlanVersionHistory<T extends PlanVersionSummary>({
  versions,
  activeId,
  onSelect,
  onDelete,
  noun,
}: PlanVersionHistoryProps<T>) {
  if (versions.length <= 1) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <History className="size-3.5" />
        Historial de versiones
      </p>

      <p className="max-w-prose text-caption text-muted-foreground text-pretty">
        Cada vez que publicás se guarda una versión nueva del {noun} y la anterior queda acá. El
        alumno siempre ve la actual; guardar cambios sobre una versión abierta no crea ninguna.
      </p>

      <ul className="flex flex-wrap gap-2">
        {versions.map((plan) => {
          const active = plan.id === activeId

          return (
            <li key={plan.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(plan.id)}
                aria-pressed={active}
                title={plan.title}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-3 py-1.5 text-left transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-border-dark",
                )}
              >
                <span className="text-body font-medium">
                  v{plan.version}
                  {plan.current && " · actual"}
                </span>
                <span className="text-caption text-muted-foreground">
                  {formatDate(plan.createdAt)}
                </span>
              </button>

              <Button
                variant="ghost"
                size="sm"
                aria-label={`Eliminar versión ${plan.version}`}
                className="text-error-text focus-visible:text-error-text"
                onClick={() => onDelete(plan)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
