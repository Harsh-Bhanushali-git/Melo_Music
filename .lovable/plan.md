# Melo — Plan: Rename + Security touchpoints

## Phase A — Name cleanup (do first, on your go)
- `src/lib/storage.ts`: `sunoh_liked_songs`, `sunoh_playlists`, `sunoh_recent` → `melo_*`
- `src/components/PinLock.tsx`: `sunoh_pin`, `sunoh_unlocked` → `melo_pin`, `melo_unlocked`
- Add one-time migration so existing users keep their liked songs / playlists / history / PIN.
- `rg sunoh` in repo to confirm zero leftovers (README, docs, comments).

## Phase B — Security: where changes are needed (your call next)
1. `src/lib/youtube.ts` line 2 — YouTube API key hardcoded in source → move to `import.meta.env.VITE_YT_API_KEY`; you rotate the key in Google Cloud Console (old key is burned, it's public on GitHub) and add the new one in Vercel env vars.
2. `.gitignore` — currently missing `.env` → add it so the new key never lands in the repo.
3. `src/components/PinLock.tsx` — PIN stored as plain text in localStorage → store a SHA-256 hash instead (no new libraries).
4. `public/favicon.png` — 1.4 MB, slows every page load → replace with an optimized ~10 KB version (same logo).

## Phase C onward (later phases, unchanged from the audit)
Bug fixes (Start Radio, queue context, search debounce, Explore quota, player cleanup, one toast system) → performance (code splitting, lazy images, error boundary, OG image) → features (Media Session, theme toggle, share, sleep timer, lyrics) → Last.fm recommendations.

## GitHub
- Each phase = one commit; releases/tags only when you say so. Nothing pushed until you approve.
