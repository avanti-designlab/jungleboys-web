import { getStory } from '@/lib/storyblok'
import { renderRichText } from '@storyblok/react/rsc'

// Editable FAQ from Storyblok: a `faq` story whose body is a list of `faq_item`
// bloks (question + richtext answer). Fallback-safe: empty list if not present.
export type FaqEntry = { question: string; answerHtml: string; answerText: string }

type Blok = Record<string, unknown> & { component?: string }

export async function getFaqItems(): Promise<FaqEntry[]> {
  const story = await getStory('faq', 'published')
  const body = (story?.content as { body?: unknown } | undefined)?.body
  if (!Array.isArray(body)) return []
  return (body as Blok[])
    .filter((b) => b.component === 'faq_item')
    .map((b) => {
      const answerHtml = b.answer ? renderRichText(b.answer as never) : ''
      return {
        question: (b.question as string) || '',
        answerHtml,
        answerText: answerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      }
    })
    .filter((f) => f.question)
}
