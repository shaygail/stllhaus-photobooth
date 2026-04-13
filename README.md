# STLL HAUS Photobooth

Tablet-first photobooth built with Next.js 16 for in-person events.

Core flow:
- `GET /booth` guest flow: welcome -> camera -> preview -> receipt -> print -> done
- `GET /digital/[token]` guest keepsake page (view / download JPEG from QR)
- `GET /receipt-preview` thermal layout playground

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4

## Quick Start

1. Install deps:

```bash
npm install
```

2. Copy env file and edit:

```bash
cp .env.example .env.local
```

3. Set at least:
- `BOOTH_PASSWORD` (required for staff login and booth access)
- `NEXT_PUBLIC_BOOTH_PUBLIC_URL` (required for phone QR links in local/LAN testing)

4. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## LAN / iPad Usage

For iPad camera and QR-on-phone testing on local network:

```bash
npm run dev:lan
```

Then:
- open the printed `https://...` URL on booth tablet/phone
- trust the local certificate once in Safari (`Advanced -> Continue`)
- ensure phone and Mac are on the same Wi-Fi

## Authentication Model

- `/booth` is protected by staff login (`/login`)
- login sets a signed httpOnly cookie
- booth-only API actions (creating slips, saving email) require authenticated session
- guest keepsake links `/digital/[token]` remain public

### Required env vars

| Variable | Required | Purpose |
|---|---|---|
| `BOOTH_PASSWORD` | Yes | Staff password for `/login` |
| `BOOTH_SESSION_SECRET` | Optional | Cookie signing secret (recommended in production) |
| `NEXT_PUBLIC_BOOTH_PUBLIC_URL` | Yes for LAN/QR | Public base URL used for QR destination |

## Commands

- `npm run dev` - local HTTP development
- `npm run dev:lan` - LAN HTTPS development (recommended for iPad/Safari)
- `npm run lint` - ESLint
- `npm run build` - production build
- `npm run start` - run production server

## Deploy Notes

This project currently stores digital slips in an in-memory map.

Implications:
- works well on one always-on Node process (booth machine)
- not durable across restarts
- not suitable for serverless multi-instance persistence without moving to DB/KV + object storage

If deploying publicly (e.g. Vercel), keep `BOOTH_PASSWORD` configured and plan persistence changes for long-lived digital links.

## Troubleshooting

### QR opens but page is blank
- verify protocol matches running server:
  - `npm run dev` -> use `http://...`
  - `npm run dev:lan` -> use `https://...`
- open exact token URL: `/digital/<token>`
- hard refresh on phone after updates

### Download does not save on iPhone
- use `Download JPEG` first
- fallback: `Open full image` -> long press image -> `Save to Photos`

### "Not found" for a valid-looking token
- token may have been created on a different server/process
- app may have restarted (in-memory slips cleared)
- ensure QR host points to the same machine currently running Next.js
