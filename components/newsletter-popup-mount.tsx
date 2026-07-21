import { readFile } from 'node:fs/promises'
import path from 'node:path'
import NewsletterPopup from '@/components/newsletter-popup'

// Server wrapper: reads the canonical TCPA consent text and hands it to the
// client popup so the exact copy is shown at point of capture.
export default async function NewsletterPopupMount() {
  const consentText = (
    await readFile(path.join(process.cwd(), 'content/legal/tcpa-consent.txt'), 'utf-8')
  ).trim()
  return <NewsletterPopup consentText={consentText} />
}
