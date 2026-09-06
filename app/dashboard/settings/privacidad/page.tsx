import { legalDocument } from "@/components/legal/documents"
import { LegalDraftNotice, LegalUpdatedAt } from "@/components/legal/legal-prose"
import { PrivacyPolicy } from "@/components/legal/privacy-policy"
import { SettingsPageShell } from "@/features/account/components/settings-page-shell"

const DOCUMENT = legalDocument("privacidad")

export const metadata = { title: "Política de privacidad — Mi Entreno" }

/**
 * La misma política que `/documentos/privacidad`, dentro del panel.
 *
 * El texto ya no vive acá: lo renderiza `<PrivacyPolicy />`, que comparte con
 * la página pública. Se mantienen las dos rutas porque sirven a dos momentos
 * distintos —la pública se lee antes de registrarse, ésta sin salir del panel—
 * pero un documento legal con dos redacciones que se contradicen es peor que
 * cualquier duplicación de chrome, así que el contenido es uno solo.
 */
export default function PrivacyPage() {
  return (
    <SettingsPageShell title={DOCUMENT.title} description={DOCUMENT.description}>
      <LegalDraftNotice />
      <PrivacyPolicy />
      <LegalUpdatedAt />
    </SettingsPageShell>
  )
}
