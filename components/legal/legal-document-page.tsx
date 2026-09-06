import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

import { LEGAL_DOCUMENTS, type LegalDocument } from "@/components/legal/documents"
import { LegalDraftNotice, LegalUpdatedAt } from "@/components/legal/legal-prose"

/**
 * El chrome compartido de los tres documentos públicos.
 *
 * Cada documento es su propia ruta —al pie de la portada se entra directo a la
 * que corresponde, sin pasar por el índice— y esto es lo único que los tres
 * comparten: la vuelta al índice, el encabezado, el aviso de borrador, la fecha
 * y el pase a los otros dos.
 */
export function LegalDocumentPage({
  document,
  children,
}: {
  document: LegalDocument
  children: React.ReactNode
}) {
  const others = LEGAL_DOCUMENTS.filter((other) => other.slug !== document.slug)

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-6 px-5 py-12 sm:px-8 lg:py-16">
      <Link
        href="/documentos"
        className="flex w-fit items-center gap-1.5 text-body text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Todos los documentos
      </Link>

      <div>
        <h1 className="font-heading text-headline font-semibold tracking-tight uppercase text-balance">
          {document.title}
        </h1>
        <p className="mt-2 text-body-lg text-muted-foreground text-pretty">
          {document.description}
        </p>
      </div>

      <LegalDraftNotice />

      {children}

      <LegalUpdatedAt />

      <nav className="flex flex-col gap-2" aria-label="Otros documentos">
        <p className="text-caption text-muted-foreground">Seguí leyendo</p>
        {others.map((other) => (
          <Link
            key={other.slug}
            href={other.href}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-body font-medium transition-colors hover:bg-muted"
          >
            {other.title}
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </nav>
    </div>
  )
}
