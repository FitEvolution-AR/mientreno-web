import { legalDocument } from "@/components/legal/documents"
import { LegalDocumentPage } from "@/components/legal/legal-document-page"
import { TermsOfService } from "@/components/legal/terms-of-service"

const DOCUMENT = legalDocument("terminos")

export const metadata = { title: DOCUMENT.title, description: DOCUMENT.description }

export default function TermsDocumentPage() {
  return (
    <LegalDocumentPage document={DOCUMENT}>
      <TermsOfService />
    </LegalDocumentPage>
  )
}
