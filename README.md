# 🎵 Melo — Music at Your Fingertips

A modern, YouTube-powered music streaming web app. Search, play, queue, and organize music — all from your browser with a beautiful, responsive interface.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Search** | Find any song or artist instantly via YouTube |
| ▶️ **Full Player** | Play/pause, seek, next/prev, shuffle, repeat (off/all/one) |
| 📋 **Smart Queue** | Playing a song auto-queues related tracks so Next always works |
| ❤️ **Liked Songs** | Heart any song to save it to your personal collection |
| 📂 **Custom Playlists** | Create, manage, and play playlists with full queue support |
| 📥 **Playlist Import** | Import playlists from YouTube with duplicate detection |
| 🔀 **Shuffle & Repeat** | Shuffle reshuffles the queue; repeat cycles off → all → one |
| 🌗 **Light & Dark Mode** | Toggle themes with persistence across sessions |
| 🕐 **Recently Played** | Automatically tracks your last 50 songs |
| 🎧 **Explore** | Browse by genre + curated playlists (Bollywood, Lofi, EDM, Classics, etc.) |
| 🔒 **PIN Lock** | Optional PIN protection for privacy |
| 📱 **Fully Responsive** | Optimized for desktop, tablet, and mobile with bottom navigation |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Audio | YouTube IFrame Player API (audio-only) |
| Data | YouTube Data API v3 |
| Storage | localStorage (liked songs, playlists, recents, theme, cache) |
| Routing | React Router v6 |
| Scaffolded with | [Lovable](https://lovable.dev) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or bun)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/melo-music.git
cd melo-music

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`.

### YouTube API Key

The app comes with a pre-configured API key. To use your own:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **YouTube Data API v3**
3. Create an API key under **Credentials**
4. Replace the key in `src/lib/youtube.ts`

---

## 📊 YouTube API Quota & Limits

Melo uses the **YouTube Data API v3** with a daily quota of **10,000 units** per key (resets at midnight PT).

| Action | Cost | Notes |
|--------|------|-------|
| Search | 100 units | Each search query or genre load |
| Video details | 1 unit | Fetching metadata |
| Playback (IFrame) | **0 units** | Streaming is free |

**Melo optimizes quota usage with:**
- 24-hour caching for Home & Explore sections
- 2-hour cache for search results
- Cached content loads instantly on repeat visits
- Queue/playlist/liked playback costs zero quota

**Estimated daily capacity:** ~100 searches, unlimited playback from cache/queue/playlists.

> 💡 **Tip:** Once songs are in your queue, liked songs, or playlists, playing them costs zero quota.

---

## 📁 Project Structure

```
src/
├── assets/           # Logo and static assets
├── components/
│   ├── layout/       # Header, Sidebar, PlayerBar, MainLayout, MobileNav
│   ├── ui/           # shadcn/ui components
│   ├── SongCard.tsx  # Reusable song display (card/row variants)
│   ├── PinLock.tsx   # Optional PIN lock screen
│   ├── QueueDrawer.tsx
│   └── CreatePlaylistDialog.tsx
├── contexts/
│   └── PlayerContext.tsx  # Global player state & YouTube integration
├── hooks/
│   ├── useTheme.ts       # Light/dark mode toggle
│   └── use-mobile.tsx    # Mobile detection
├── lib/
│   ├── storage.ts   # localStorage helpers (liked, playlists, recents, cache)
│   ├── youtube.ts   # YouTube API client with caching
│   └── utils.ts
├── pages/
│   ├── Home.tsx          # Recently played + cached trending
│   ├── Explore.tsx       # Genre tiles + curated playlists
│   ├── Search.tsx        # Search with queue-aware results
│   ├── Library.tsx       # Playlist management
│   ├── Playlist.tsx      # Individual playlist view
│   ├── ImportPlaylist.tsx # YouTube playlist importer
│   ├── LikedSongs.tsx
│   └── NotFound.tsx
└── index.css         # Design system tokens (light/dark)
```

---

## 🎨 Design System

- **Primary:** Red (`hsl(0, 100%, 50%)`) — inspired by YouTube Music
- **Tokens:** All colors defined as HSL CSS variables in `index.css`
- **Dark mode:** Full dark theme with optimized contrast
- **Components:** Built on [shadcn/ui](https://ui.shadcn.com/) with custom variants
- **Responsive:** Mobile-first with bottom navigation and expandable player

---

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Set framework preset to **Vite**
3. Deploy — that's it!

### Other Platforms

Works with any static hosting (Netlify, Cloudflare Pages, GitHub Pages):

```bash
npm run build
# Deploy the `dist/` folder
```

---

## 📝 License

This project is for personal and educational use. YouTube content is streamed via the official IFrame API and is subject to YouTube's Terms of Service.

---

Built with ❤️ using [Lovable](https://lovable.dev)
