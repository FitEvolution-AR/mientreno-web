import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  AUDIENCES,
  BRAND_AUDIENCE,
  NEUTRAL_LOGIN,
  TRAINER_AUDIENCE,
  loginCopyFor,
} from "./audience"

describe("AUDIENCES", () => {
  it("resolves both ids", () => {
    expect(AUDIENCES.trainer).toBe(TRAINER_AUDIENCE)
    expect(AUDIENCES.brand).toBe(BRAND_AUDIENCE)
  })

  it("points each audience at its own endpoints and paths", () => {
    // Cruzarlos registraría un comercio como entrenador, que es un bug que sólo
    // se ve en producción y con una cuenta ya creada.
    expect(TRAINER_AUDIENCE.registerEndpoint).toBe("/auth/trainer/register")
    expect(BRAND_AUDIENCE.registerEndpoint).toBe("/auth/brand/register")
    expect(TRAINER_AUDIENCE.homePrefix).toBe("/dashboard")
    expect(BRAND_AUDIENCE.homePrefix).toBe("/comercio")
  })

  it("keeps every profile path inside its own home", () => {
    // Si no, el guard manda al onboarding de un panel al que la sesión no
    // pertenece y rebota para siempre.
    for (const audience of Object.values(AUDIENCES)) {
      expect(audience.profilePath.startsWith(audience.homePrefix)).toBe(true)
    }
  })
})

describe("la puerta neutra", () => {
  it("se queda fuera de AUDIENCES", () => {
    // `AUDIENCES` es lo que alimenta al formulario de registro, donde la
    // elección sí importa: una audiencia sin `registerEndpoint` ahí sería una
    // cuenta creada contra el endpoint equivocado, o contra ninguno.
    expect(Object.values(AUDIENCES)).not.toContain(NEUTRAL_LOGIN as never)
    expect(Object.keys(AUDIENCES)).toEqual(["trainer", "brand"])
  })

  it("no nombra a ninguno de los dos públicos", () => {
    // Si el título volviera a decir "tu panel" de entrenador, vuelve el bug que
    // esta pantalla existe para no tener.
    const text = `${NEUTRAL_LOGIN.title} ${NEUTRAL_LOGIN.description}`
    expect(text).not.toMatch(/entrenador(?!es)/i)
    expect(NEUTRAL_LOGIN.brand).not.toBe(TRAINER_AUDIENCE.brand)
    expect(NEUTRAL_LOGIN.brand).not.toBe(BRAND_AUDIENCE.brand)
  })
})

describe("loginCopyFor", () => {
  it("sin audiencia devuelve la copy neutra", () => {
    expect(loginCopyFor(null)).toBe(NEUTRAL_LOGIN)
  })

  it("con audiencia devuelve la de esa audiencia", () => {
    expect(loginCopyFor(BRAND_AUDIENCE)).toEqual({
      brand: BRAND_AUDIENCE.brand,
      title: BRAND_AUDIENCE.loginTitle,
      description: BRAND_AUDIENCE.loginDescription,
    })
  })
})

/**
 * Las páginas que renderizan los formularios de acceso son server components, y
 * `AudienceCopy` lleva íconos de Lucide, que son funciones. Pasar el objeto como
 * prop rompe el build con "Functions cannot be passed directly to Client
 * Components" — y lo rompe recién en `next build`, no en typecheck ni en los
 * tests, que es exactamente cómo se escapó a producción una vez.
 *
 * Esto lo convierte en algo que falla en la suite rápida: se lee el archivo y se
 * verifica que la prop siga siendo el id.
 */
describe("el límite servidor/cliente de las páginas de acceso", () => {
  const PAGES = [
    "app/login/page.tsx",
    "app/register/page.tsx",
    "app/comercio/login/page.tsx",
    "app/comercio/register/page.tsx",
  ]

  it.each(PAGES)("%s pasa la audiencia como id, no como objeto", (page) => {
    const source = readFileSync(page, "utf8")

    // Un `audience={ALGO}` en llaves es una referencia a un valor de módulo: el
    // objeto de copy con sus íconos. La forma segura es el literal `audience="…"`.
    expect(source).not.toMatch(/audience=\{/)
  })

  it.each(PAGES)("%s no importa el objeto de copy", (page) => {
    const source = readFileSync(page, "utf8")

    expect(source).not.toMatch(/\b(TRAINER_AUDIENCE|BRAND_AUDIENCE|AUDIENCES)\b/)
  })
})
