import { legalDocument } from "@/components/legal/documents"
import { LegalDocumentPage } from "@/components/legal/legal-document-page"
import { PrivacyPolicy } from "@/components/legal/privacy-policy"

const DOCUMENT = legalDocument("privacidad")

export const metadata = { title: DOCUMENT.title, description: DOCUMENT.description }

export default function PrivacyDocumentPage() {
  return (
    <LegalDocumentPage document={DOCUMENT}>
      <PrivacyPolicy />
    </LegalDocumentPage>
  )
}
