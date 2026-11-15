# Achievement certificates

The gallery now includes these uploaded certificates, with full-page PNG previews
rendered from the original PDFs:

- `ClassOf2026__issued (1).pdf`: Introduction to AI Literacy and Responsible Use
  micro-credentials course, issued September 15, 2026. Preview:
  `ai-literacy-responsible-use.png`.
- `Charles Arone_Participation.pdf`: ASU University Design Institute, AI Evaluations
  in Education, October 28, 2026. Preview: `ai-evaluations-education.png`.
- `CHARLES ARONE R. ALCEBAR_signed.pdf`: DICT Region XI, four-hour Data Privacy
  Awareness webinar, October 7, 2026. Preview: `data-privacy-awareness.png`.

Both the homepage gallery and the achievements archive link to the original PDFs.
Other milestone entries retain their existing visuals.

In `src/data/achievements.ts`, add either or both optional fields to an entry:

```ts
certificateImage: '/certificates/google-ai.png', // Actual certificate image (PNG/JPEG/WebP).
certificateUrl: '/certificates/google-ai.pdf', // Actual file or public verification URL.
```

Use the actual filenames you add. These are example paths, not bundled assets.
`certificateImage` replaces the milestone visual and uses `object-contain` so the
whole certificate stays visible. `certificateUrl` adds an explicit link in the
detail dialog and can point to a PDF, image, or HTTPS verification page. A URL alone
keeps the original milestone visual and its caption. Public paths are resolved
with the existing Vite base-path helper by the Achievements section.
