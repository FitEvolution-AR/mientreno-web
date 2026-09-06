import { cn } from "@/lib/utils"

/**
 * El fondo de las pantallas sin sesión: portada, login, registro, recuperación.
 *
 * Reemplaza a `public/auth-hero.webp`, una foto de stock con dos defectos que
 * no se arreglaban recortando. La barra de dominadas le cruzaba el rodete a la
 * modelo justo a la altura de la cabeza —el encuadre que la sacaba de ahí
 * agrandaba el otro problema—, y el top llevaba el logo de VIRUS centrado en la
 * imagen: una marca ajena, bien legible, en la primera pantalla del producto.
 *
 * Lo que la reemplaza no es otra foto sino el mark del logo a escala de
 * portada. Las barras inclinadas son la única forma no tipográfica de la
 * identidad —las mismas que `SpeedBars` repite en chico—, así que agrandarlas
 * es lo que hace que el fondo sea de Mi Entreno y no de cualquier gimnasio.
 *
 * Consecuencias de que sea vectorial y no un WebP:
 *
 * <ul>
 *   <li>No hay request ni `blurDataURL`: el primer pintado ya es el fondo
 *       definitivo, así que desaparece el salto de rectángulo navy a foto que
 *       obligaba a inlinear un placeholder en dos archivos.</li>
 *   <li>Es nítido en cualquier densidad y en cualquier relación de aspecto, del
 *       panel alto de `lg` a la banda corta del teléfono.</li>
 *   <li>Los colores salen de los tokens, así que el fondo sigue a la paleta en
 *       lugar de ser un gris-y-piel al que había que taparle el color con tres
 *       capas de degradado encima.</li>
 * </ul>
 */
export function BrandBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-brand-navy",
        className,
      )}
    >
      {/* Textura, no degradado: los cortes son duros, así que lo que hace es
          darle grano al navy para que no lea como un rectángulo muerto. El
          ángulo (102°) es el complemento del `-skew-x-12` del logo, de manera
          que las líneas finas y las barras grandes caen paralelas. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(102deg,
            transparent 0 22px,
            rgba(255,255,255,0.05) 22px 26px,
            transparent 26px 38px,
            rgba(255,255,255,0.03) 38px 40px,
            transparent 40px 64px)`,
        }}
      />

      {/*
        El elemento grande de la composición: las tres barras del logo —tres, no
        cuatro ni una trama, porque tres es el mark— saliendo del borde derecho.

        Van en CSS y no en un `<svg>` con `preserveAspectRatio` a propósito. La
        primera versión era un SVG con `slice`, y en el panel alto de `lg` eso
        escala por altura: las barras crecían hasta ocupar el panel entero y la
        más opaca terminaba detrás del titular. Dimensionadas en `vw` con
        `clamp` el grupo ocupa siempre alrededor de un tercio del ancho, que es
        la mitad donde no vive ningún texto en ninguna de las dos pantallas.

        La opacidad crece hacia el borde —al revés que en `SpeedBars`— para que
        el peso se vaya hacia afuera y el ojo se quede en la columna de texto.
      */}
      <div className="absolute -inset-y-[15%] right-[-8%] flex items-stretch gap-[clamp(0.5rem,1.8vw,2rem)]">
        <div className="w-[clamp(1.25rem,5vw,4.5rem)] -skew-x-12 bg-brand-green/6" />
        <div className="w-[clamp(1.25rem,5vw,4.5rem)] -skew-x-12 bg-brand-green/10" />
        <div className="w-[clamp(1.25rem,5vw,4.5rem)] -skew-x-12 bg-brand-green/16" />
      </div>
    </div>
  )
}
