import Image from "next/image"
import Link from "next/link"

import { SiteFooter } from "@/components/marketing/site-footer"

/**
 * La sección de documentos legales es pública a propósito.
 *
 * No aparece en el matcher de `proxy.ts`, así que el guard no la toca: hay que
 * poder leer los términos *antes* de crear la cuenta, y una tienda de
 * aplicaciones o un revisor legal tiene que poder abrir la URL sin sesión.
 *
 * El pie es el mismo de la portada, que es desde donde se entra: quien terminó
 * de leer un documento vuelve a tener a mano los dos accesos y los otros dos
 * documentos.
 */
export const metadata = {
  title: { default: "Documentos", template: "%s — Mi Entreno" },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-brand-navy px-5 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" aria-label="Ir a la portada de Mi Entreno">
            <Image
              src="/logo-light.png"
              alt="Mi Entreno"
              width={410}
              height={241}
              className="h-9 w-auto"
            />
          </Link>
          <Link
            href="/documentos"
            className="text-body text-white/70 transition-colors hover:text-white"
          >
            Documentos
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  )
}
