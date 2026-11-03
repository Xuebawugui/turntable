# 11.11 Lucky Wheel

Mobile-first spin wheel in **English** for **France (+33)**. **One spin per phone number**, built for [Vercel](https://vercel.com) + GitHub.

## Does Vercel support storage / Redis?

Vercel serverless functions are **stateless** — they do not keep data on the server disk. You still add persistence through **integrations**:

| Option | Use case |
|--------|----------|
| **[Upstash Redis](https://upstash.com)** | Fast key/value (this project — who already spun) |
| Vercel Postgres / Neon | Relational data |
| Supabase, PlanetScale, etc. | Same idea, connect via env vars |

In the Vercel dashboard: **Project → Storage → Connect Upstash Redis**. Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.

Live **remaining stock** (coupons + physical prizes) is read from Redis on each page load and after each spin — this works on Vercel as long as Redis is connected.

## Deploy (GitHub → Vercel)

1. Push this folder to a GitHub repository.
2. [vercel.com/new](https://vercel.com/new) → Import the repo → Deploy (defaults work for Next.js).
3. Add **Upstash Redis** from the Storage tab (required for production one-spin enforcement).
4. Redeploy if env vars were added after the first deploy.
5. Share your `*.vercel.app` URL (or add a custom domain in Vercel settings).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Redis, local dev still spins; **production returns 503** until Redis is configured.

Optional `.env.local`:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Customize prizes

Edit `lib/prizes.ts` — labels, descriptions, colors, and `weight` (higher = more likely).

Campaign limits:

- `lib/campaign.ts` — `CAMPAIGN_MAX_SPINS = 1000`
- `lib/prizes.ts` — `stockCap` on every prize (discount coupons + Brazil jacket ×3 + Nike mesh ×2). Edit counts to match your inventory; UI shows **X left** at the top.

## Stack

Next.js 14 · Tailwind · Geist font · Upstash Redis
