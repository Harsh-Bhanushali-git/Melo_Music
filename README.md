# 🎵 Sunoh Music — Music at Your Fingertips

A modern, YouTube-powered music streaming web app built with React, TypeScript, and Tailwind CSS. Sunoh lets you search, play, queue, and organize music — all from your browser.

---

## ✨ Features

- 🔍 **Search** — Find any song or artist via YouTube
- ▶️ **Full Player** — Play/pause, seek, next/prev, shuffle, repeat (off/all/one)
- 📋 **Smart Queue** — Playing a song auto-queues similar tracks so Next always works
- ❤️ **Liked Songs** — Heart any song to save it to your Liked Songs playlist
- 📂 **Custom Playlists** — Create, manage, and play playlists with full queue support
- 🔀 **Shuffle & Repeat** — Shuffle reshuffles the current queue; repeat cycles off → all → one
- 🌗 **Light & Dark Mode** — Toggle between themes; persists across sessions
- 🕐 **Recently Played** — Automatically tracks your last 50 songs
- 🎧 **Explore** — Browse by genre + curated playlists (Bollywood Trending, Lofi Beats, EDM, Classics, etc.)

---

## 🛠 Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Framework   | React 18 + TypeScript               |
| Build       | Vite                                |
| Styling     | Tailwind CSS + shadcn/ui            |
| Audio       | YouTube IFrame Player API (audio-only) |
| Data        | YouTube Data API v3                 |
| Storage     | localStorage (liked songs, playlists, recents, theme) |

---

## 📊 YouTube API Quota & Daily Limits

Sunoh uses the **YouTube Data API v3**, which has a daily quota of **10,000 units** per API key (resets at midnight Pacific Time).

| Action            | Cost per call | Typical usage                     |
|-------------------|---------------|-----------------------------------|
| Search            | 100 units     | Each search query or genre load   |
| Video details     | 1 unit        | Fetching video metadata           |
| Playback (IFrame) | **0 units**   | Streaming via IFrame is free      |

### How many songs can you play per day?

**Playback is unlimited** — the IFrame Player API doesn't consume quota. Only **search queries** cost quota.

**Estimated daily capacity:**
- ~100 search queries per day (10,000 ÷ 100)
- Each Explore page load uses ~9 searches (8 curated + 1 for categories)
- Normal browsing: **50–80 songs easily** with searches to spare
- If you mostly play from queue/playlists/liked: **hundreds of songs**

> 💡 **Tip:** Once songs are in your queue, liked songs, or playlists, playing them costs zero quota. Minimize redundant searches to stretch your daily limit.

### If you hit the quota limit:
- Search will return errors until the quota resets (midnight PT)
- Already-queued songs and playback will continue working fine
- Consider getting your own API key from [Google Cloud Console](https://console.cloud.google.com/) for higher limits

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd sunoh-music

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

## 📁 Project Structure

```
src/
├── assets/          # Logo and static assets
├── components/
│   ├── layout/      # Header, Sidebar, PlayerBar, MainLayout
│   ├── ui/          # shadcn/ui components
│   ├── SongCard.tsx # Reusable song display (card/row variants)
│   └── NavLink.tsx
├── contexts/
│   └── PlayerContext.tsx  # Global player state & YouTube integration
├── hooks/
│   ├── useTheme.ts       # Light/dark mode toggle
│   └── use-mobile.tsx
├── lib/
│   ├── storage.ts   # localStorage helpers (liked, playlists, recents)
│   ├── youtube.ts   # YouTube API client
│   └── utils.ts
├── pages/
│   ├── Home.tsx      # Recently played + trending
│   ├── Explore.tsx   # Genre tiles + curated playlists
│   ├── Search.tsx    # Search with queue-aware results
│   ├── Library.tsx   # Playlist management
│   ├── Playlist.tsx  # Individual playlist view
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

---

## 📝 License

This project is for personal/educational use. YouTube content is streamed via the official IFrame API and is subject to YouTube's Terms of Service.

---

Built with ❤️ using [Lovable](https://lovable.dev)
