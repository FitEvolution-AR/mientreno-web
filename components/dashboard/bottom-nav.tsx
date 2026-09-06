"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mobileNavItems } from "./nav-items"

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname.startsWith(href)
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    /*
     * El padding inferior es el home indicator de iOS: la barra está anclada a
     * `bottom-0`, así que sin él las etiquetas de 12px quedan justo debajo de
     * la barrita del gesto. `env()` vale 0 donde no existe.
     */
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {mobileNavItems.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-caption font-medium transition-colors",
              // El anillo global es navy y esta barra también: acá manda el verde.
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring",
              // `text-muted-foreground` está calibrado contra las superficies
              // claras; sobre el navy de `sidebar` se quedaba en 3.46:1. El
              // inactivo del sidebar de escritorio ya resuelve este mismo
              // problema sobre el mismo fondo, y da 6.56:1.
              active ? "text-primary" : "text-sidebar-foreground/60",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
