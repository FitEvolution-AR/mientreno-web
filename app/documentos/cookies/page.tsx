import { CookiePolicy } from "@/components/legal/cookie-policy"
import { legalDocument } from "@/components/legal/documents"
import { LegalDocumentPage } from "@/components/legal/legal-document-page"

const DOCUMENT = legalDocument("cookies")

export const metadata = { title: DOCUMENT.title, description: DOCUMENT.description }

export default function CookiesDocumentPage() {
  return (
    <LegalDocumentPage document={DOCUMENT}>
      <CookiePolicy />
    </LegalDocumentPage>
  )
}
