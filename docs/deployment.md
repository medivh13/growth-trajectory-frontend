# Frontend Vercel Deployment

## Local Development

Create `.env.local` from `.env.example`:

```bash
VITE_API_URL=http://localhost:8080/api
```

Install dependencies and run Vite:

```bash
npm install
npm run dev
```

## Production Build

The Vite project provides:

```bash
npm run build
npm run preview
```

The production output directory is `dist`.

## Vercel

Import this frontend directory as its own Vercel project and set:

```bash
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

The checked-in `vercel.json` runs `npm run build`, publishes `dist`, and
rewrites browser routes to `/index.html` so React Router pages continue working
after refresh.

After Vercel assigns the frontend domain, include it in the backend
`CORS_ALLOWED_ORIGINS` environment variable.
