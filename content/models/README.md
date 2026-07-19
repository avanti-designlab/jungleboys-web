# Storyblok Content Models (Phase 0 definitions)

These JSON files define the Storyblok content-type schemas for the data-model
freeze. They are the contract between templates and the CMS. Push to Storyblok
via the Management API or recreate in the UI (Block Library) before Phase 1
content entry begins.

Every page-level content type embeds the shared `seo` block — that is how the
team controls per-page SEO/AEO fields (03 §8) without touching code.

| File | Content type | Used by |
|---|---|---|
| `seo.json` | Shared SEO fields block | every page type |
| `page.json` | Generic marketing page | About, Phenos, Wholesale, Careers, Contact, Media |
| `blog-post.json` | Blog / content hub post | `/blog/[slug]` (AEO engine) |
| `faq-item.json` | Single Q&A entry | FAQ page + FAQ blocks (FAQ schema) |
