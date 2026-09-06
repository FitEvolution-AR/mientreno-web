import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MarketingHero } from "./hero"

/**
 * Los cuatro accesos de la portada, y a dónde tiene derecho a mandar cada uno.
 *
 * La distinción no es cosmética. Ingresar es el mismo `POST /auth/login` para
 * entrenadores y comercios, y el panel de destino sale del JWT: apuntar a
 * `/login` es correcto para los dos. Registrarse no — `/auth/trainer/register`
 * y `/auth/brand/register` crean cuentas con roles distintos, así que un enlace
 * directo a `/register` registraba como entrenador a cualquiera que hubiera
 * llegado buscando la puerta de comercios. Eso sólo se descubre con la cuenta ya
 * creada y el rol equivocado, que es exactamente la clase de bug que conviene
 * que falle en la suite.
 */
describe("los accesos de la portada", () => {
  function linkTo(name: RegExp) {
    return screen.getByRole("link", { name }).getAttribute("href")
  }

  it("manda a elegir público antes de registrarse", () => {
    render(<MarketingHero />)

    expect(linkTo(/crear cuenta/i)).toBe("#accesos")
    expect(linkTo(/empezar ahora/i)).toBe("#accesos")
  })

  it("deja entrar por la puerta neutra sin preguntar quién sos", () => {
    render(<MarketingHero />)

    expect(linkTo(/ingresar/i)).toBe("/login")
    expect(linkTo(/ya tengo cuenta/i)).toBe("/login")
  })

  it("no ofrece ningún atajo al registro de un público concreto", () => {
    const { container } = render(<MarketingHero />)

    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"))
    expect(hrefs).not.toContain("/register")
    expect(hrefs).not.toContain("/comercio/register")
  })
})
