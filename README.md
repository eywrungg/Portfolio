# Charles Arone Alcebar Portfolio

A personal portfolio website for showcasing my development projects, technical skills, achievements, creative work, and contact links. It is built as a modern React app with interactive sections, project previews, and supporting pages for archives, achievements, blog posts, and a guestbook.

Live site:

```txt
https://eywrungg.github.io/probable-waffle/
```

## Features

- Responsive portfolio homepage
- Bento-style profile and project sections
- Featured projects and full project archive
- Achievements page
- Blog page
- Guestbook page with Supabase support
- Animated transitions and hover interactions
- Deployment support for GitHub Pages and Vercel

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Supabase

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The project can be deployed to Vercel with the normal Vite build command:

```bash
npm run build
```

GitHub Pages deployment is handled by GitHub Actions. The workflow builds the app with the `/probable-waffle/` base path and publishes the generated `dist` folder.

## Supabase security

- Keep `.env.local` private; it is ignored by Git. Copy `.env.example` to create a local configuration.
- Only `VITE_SUPABASE_PUBLISHABLE_KEY` belongs in this frontend. Never add a Supabase secret or legacy `service_role` key to a `VITE_` variable.
- Apply every migration in `supabase/migrations` before enabling the guestbook. They enable RLS and restrict the guestbook to public reads and validated inserts only.
- In the Supabase Dashboard, add your production and local URLs under **Authentication → URL Configuration**, enable CAPTCHA for Auth, set conservative Auth rate limits, and resolve any Security Advisor findings before launch.

## Author

Charles Arone Alcebar

- GitHub: [eywrungg](https://github.com/eywrungg)
- LinkedIn: [charles0202](https://www.linkedin.com/in/charles0202/)
