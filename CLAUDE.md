@AGENTS.md

# Ben's Denver Guide

Personal recommendations site for Denver. Live at denver-guide.vercel.app. Code at github.com/benjaminpeskoe/denver-guide.

## Adding a place

Places live in `data/places.txt`. To add a place, append a block in this format:

```
Place Name
category, Neighborhood
tag1, tag2
My notes about the place.
```

**Categories:** `restaurant` `coffeeshop` `bar` `park` `attraction` `hike` `skiing` `shopping`

**Tags:** `kid-friendly` `pet-friendly` `open-early` `open-late` `free` `date-night` `outdoor-seating` `friend-rec`

- Tags line is optional — skip it if none apply
- Notes line is optional
- Use `friend-rec` tag for places Ben hasn't been yet (shows a yellow "on my list" badge)
- Blank line between each place block

After editing `places.txt`, commit and push to `main`. Vercel rebuilds automatically (~2 min).

## Workflow when Ben says "add [place]"

1. Read `data/places.txt` to see current content
2. Infer category, neighborhood, and any obvious tags from what Ben says
3. Ask about anything unclear (neighborhood? tags? notes?)
4. Append the new block to `places.txt`
5. Commit with message like `Add [Place Name]` and push to main

## Tech stack (for code changes)

- Next.js 16.2 App Router, `app/` at root (no `src/`)
- Tailwind v4 — config via `@theme` in `app/globals.css`, no tailwind.config.js
- Next.js 16: `params` is a Promise, must `await params` in page components
- Server data loading: `app/lib/data.ts` (uses `fs`) — never import in client components
- Pure utils: `app/lib/places.ts` — safe anywhere
- Google Places photos served via `/api/photo?ref=...` proxy route
- Build scripts: `npm run parse` and `npm run enrich` (or `npm run build` runs both via prebuild)
