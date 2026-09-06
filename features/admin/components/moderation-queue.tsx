"use client"

import { Check, Gift, Loader2, ShieldCheck, Store, X } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProductApprovalStatus } from "@/features/brand/dto/brand.dto"
import { APPROVAL_LABELS, APPROVAL_TONES } from "@/features/brand/model/brand.model"
import { StatusPill } from "@/features/brand/components/status-pill"

import { useBulkApproveProducts, useModerateProduct, usePendingProducts } from "../hooks/use-admin"
import { maxExposure, REVIEW_CHECKLIST, type AdminProduct } from "../model/admin.model"

const FILTERS: { label: string; value: ProductApprovalStatus }[] = [
  { label: "En revisión", value: "PENDING_APPROVAL" },
  { label: "Publicados", value: "APPROVED" },
  { label: "Rechazados", value: "REJECTED" },
]

/**
 * La cola de revisión.
 *
 * Lo que se decide acá no es "¿el producto está bien?" sino "¿el precio está
 * bien?": un premio a una repe vacía la economía en una tarde. Por eso el
 * costo y la exposición máxima se muestran arriba de todo y el checklist
 * arranca por ahí.
 *
 * Y por eso mismo aprobar pide confirmación y rechazar también: aprobar es la
 * acción que publica a todo el catálogo, y durante un tiempo fue la única de
 * las dos que se disparaba con un solo click.
 */
export function ModerationQueue() {
  const [filter, setFilter] = useState<ProductApprovalStatus>("PENDING_APPROVAL")
  const [rejecting, setRejecting] = useState<AdminProduct | null>(null)
  const [approving, setApproving] = useState<AdminProduct | null>(null)
  /*
   * La selección viaja con el filtro en el que se hizo, y se deriva contra la
   * lista en pantalla en vez de sincronizarse con efectos: cambiar de filtro o
   * aprobar en lote deja ids que ya no están, y podarlos en un `useEffect`
   * encadena un render de más por cada recarga de la cola.
   */
  const [selection, setSelection] = useState<{
    filter: ProductApprovalStatus
    ids: number[]
  }>({ filter: "PENDING_APPROVAL", ids: [] })
  const [confirmingBulk, setConfirmingBulk] = useState(false)

  const query = usePendingProducts(filter)
  const moderate = useModerateProduct()
  const bulkApprove = useBulkApproveProducts()

  const items = useMemo(() => query.data?.items ?? [], [query.data])

  const selected = useMemo(
    () =>
      selection.filter === filter
        ? selection.ids.filter((id) => items.some((item) => item.id === id))
        : [],
    [selection, filter, items],
  )

  const selectable = filter === "PENDING_APPROVAL" && items.length > 0
  const allSelected = selectable && selected.length === items.length && items.length > 0
  const someSelected = selected.length > 0 && !allSelected

  function setSelected(ids: number[]) {
    setSelection({ filter, ids })
  }

  function toggle(productId: number, checked: boolean) {
    setSelected(checked ? [...selected, productId] : selected.filter((id) => id !== productId))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {filter === "PENDING_APPROVAL" && items.length > 0 && (
        <section className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="flex items-center gap-2 font-heading text-body font-semibold uppercase">
            <ShieldCheck className="size-4 text-primary" />
            Antes de aprobar
          </p>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-body text-muted-foreground">
            {REVIEW_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/*
        La barra de selección.

        Revisar quince productos de un mismo comercio con el mismo criterio y
        aprobarlos de a uno es el trabajo repetido que esta zona genera de
        entrada. El checklist de arriba sigue siendo el que decide; esto sólo
        evita quince clicks y quince confirmaciones idénticas.
      */}
      {selectable && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Label className="flex items-center gap-2.5 font-normal">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={(checked: boolean) =>
                setSelected(checked ? items.map((item) => item.id) : [])
              }
            />
            {selected.length === 0
              ? "Seleccionar todos"
              : `${selected.length} de ${items.length} seleccionados`}
          </Label>

          {selected.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                Limpiar
              </Button>
              <Button
                size="sm"
                disabled={bulkApprove.isPending}
                onClick={() => setConfirmingBulk(true)}
              >
                {bulkApprove.isPending ? <Loader2 className="animate-spin" /> : <Check />}
                Aprobar seleccionados
              </Button>
            </div>
          )}
        </div>
      )}

      {query.isError ? (
        <ErrorState error={query.error} context="load" onRetry={() => query.refetch()} />
      ) : query.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={filter === "PENDING_APPROVAL" ? "No hay nada esperando" : "No hay productos acá"}
          description={
            filter === "PENDING_APPROVAL"
              ? "Cuando un comercio envíe un producto a revisión, va a aparecer en esta lista."
              : "Cambiá el filtro para ver los productos en otro estado."
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((product) => (
            <ProductReviewCard
              key={product.id}
              product={product}
              /*
               * Por fila y no por pantalla: `moderate.isPending` es un único
               * flag compartido, así que aprobar uno dejaba toda la cola muerta
               * sin decir cuál estaba trabajando.
               */
              pending={
                (moderate.isPending && moderate.variables?.productId === product.id) ||
                (bulkApprove.isPending && selected.includes(product.id))
              }
              selectable={selectable}
              selected={selected.includes(product.id)}
              onSelectedChange={(checked) => toggle(product.id, checked)}
              onApprove={() => setApproving(product)}
              onReject={() => setRejecting(product)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={approving !== null}
        onOpenChange={(open) => !open && setApproving(null)}
        title={`¿Publicar "${approving?.name ?? ""}"?`}
        description={
          approving
            ? `Queda visible en el catálogo de todos los alumnos y se puede canjear a ${approving.costReps} ${approving.costReps === 1 ? "repe" : "repes"}. Si se agota el stock, salen ${maxExposure(approving)} de circulación.`
            : ""
        }
        confirmLabel="Aprobar y publicar"
        loading={moderate.isPending}
        onConfirm={() => {
          if (!approving) return
          moderate.mutate(
            { productId: approving.id, status: "APPROVED" },
            { onSettled: () => setApproving(null) },
          )
        }}
      />

      <ConfirmDialog
        open={confirmingBulk}
        onOpenChange={setConfirmingBulk}
        title={`¿Publicar ${selected.length} ${selected.length === 1 ? "producto" : "productos"}?`}
        description={`Quedan visibles en el catálogo de todos los alumnos. Si se agotan, salen ${items
          .filter((item) => selected.includes(item.id))
          .reduce((total, item) => total + maxExposure(item), 0)} repes de circulación.`}
        confirmLabel="Aprobar y publicar"
        loading={bulkApprove.isPending}
        onConfirm={() =>
          bulkApprove.mutate(selected, { onSettled: () => setConfirmingBulk(false) })
        }
      />

      <RejectDialog product={rejecting} onClose={() => setRejecting(null)} />
    </div>
  )
}

function ProductReviewCard({
  product,
  pending,
  selectable,
  selected,
  onSelectedChange,
  onApprove,
  onReject,
}: {
  product: AdminProduct
  pending: boolean
  selectable: boolean
  selected: boolean
  onSelectedChange: (checked: boolean) => void
  onApprove: () => void
  onReject: () => void
}) {
  const exposure = maxExposure(product)

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
      {selectable && (
        <span className="flex items-start pt-1">
          <Checkbox
            checked={selected}
            disabled={pending}
            aria-label={`Seleccionar ${product.name}`}
            onCheckedChange={(checked: boolean) => onSelectedChange(checked)}
          />
        </span>
      )}

      <span className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted sm:size-32">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            width={128}
            height={128}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <Gift className="size-6 text-muted-foreground" />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-subtitle font-semibold tracking-tight">{product.name}</p>
            <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <Store className="size-3.5" />
              {/* Sin comercio es un producto que cargó la plataforma. */}
              {product.brandName ?? "Cargado por la plataforma"}
            </p>
          </div>
          <StatusPill tone={APPROVAL_TONES[product.approvalStatus]}>
            {APPROVAL_LABELS[product.approvalStatus]}
          </StatusPill>
        </div>

        {product.description && (
          <p className="text-body text-muted-foreground text-pretty">{product.description}</p>
        )}

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-body">
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Costo</dt>
            <dd className="font-semibold tabular-nums">
              {product.costReps} {product.costReps === 1 ? "repe" : "repes"}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Stock</dt>
            <dd className="tabular-nums">{product.stock}</dd>
          </div>
          <div className="flex gap-1.5">
            {/* El número que nadie calcula hasta que el inventario se agotó. */}
            <dt className="text-muted-foreground">Si se agota</dt>
            <dd className="tabular-nums">
              −{exposure} {exposure === 1 ? "repe" : "repes"} en circulación
            </dd>
          </div>
        </dl>

        {product.rejectionReason && (
          <p className="text-caption text-error-text">
            Rechazado antes: {product.rejectionReason}
          </p>
        )}

        {product.approvalStatus === "PENDING_APPROVAL" && (
          <div className="mt-1 flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={onApprove}>
              {pending ? <Loader2 className="animate-spin" /> : <Check />}
              Aprobar y publicar
            </Button>
            <Button variant="outline" size="sm" disabled={pending} onClick={onReject}>
              <X />
              Rechazar
            </Button>
          </div>
        )}

        {product.approvalStatus === "APPROVED" && (
          <div className="mt-1">
            <Button variant="outline" size="sm" disabled={pending} onClick={onReject}>
              <X />
              Bajar del catálogo
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}

/**
 * Rechazo.
 *
 * El motivo es obligatorio acá y en el backend: el comercio lo recibe por
 * notificación y es lo único accionable del mensaje. Un rechazo sin explicación
 * garantiza que lo reenvíen igual.
 */
function RejectDialog({ product, onClose }: { product: AdminProduct | null; onClose: () => void }) {
  const [reason, setReason] = useState("")
  const moderate = useModerateProduct()

  const isTakedown = product?.approvalStatus === "APPROVED"

  function confirm() {
    if (!product || !reason.trim()) return
    moderate
      .mutateAsync({ productId: product.id, status: "REJECTED", reason: reason.trim() })
      .then(() => {
        setReason("")
        onClose()
      })
      .catch(() => {
        // El hook ya mostró el toast; el diálogo queda abierto para corregir.
      })
  }

  return (
    <Dialog open={product !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isTakedown ? "Bajar del catálogo" : "Rechazar producto"}</DialogTitle>
          <DialogDescription>
            {isTakedown
              ? "El producto deja de aparecer en el catálogo. Los canjes ya hechos siguen en pie: alguien pagó por ellos."
              : "El comercio recibe el motivo y puede corregir y volver a enviarlo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reject-reason">Motivo</Label>
          <Input
            id="reject-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="El costo es muy bajo para lo que se entrega"
            maxLength={REASON_MAX_LENGTH}
          />
          <p className="text-caption text-muted-foreground">
            {reason.length}/{REASON_MAX_LENGTH}
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={moderate.isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={moderate.isPending || !reason.trim()}
          >
            {moderate.isPending && <Loader2 className="size-4 animate-spin" />}
            {isTakedown ? "Bajar" : "Rechazar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Igual que el `@Size` del backend, para que el corte no llegue como un 400. */
const REASON_MAX_LENGTH = 200
