// YouTube API configuration
export const YOUTUBE_API_KEY = 'AIzaSyBQiAZk3C1oAAOttuOcBqs8Hk1fg7wpOso';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration?: string;
}

export interface YouTubeSearchResult {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

// --- Cache helpers ---
interface CacheEntry {
  data: YouTubeSearchResult;
  timestamp: number;
}

function getCacheKey(query: string, pageToken?: string): string {
  return `yt_cache_${query}_${pageToken || ''}`;
}

function getFromCache(key: string): YouTubeSearchResult | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: YouTubeSearchResult) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage full — clear old cache entries
    clearOldCache();
  }
}

function clearOldCache() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('yt_cache_'));
  keys.forEach(k => localStorage.removeItem(k));
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Search YouTube videos (with cache)
export async function searchYouTube(
  query: string,
  pageToken?: string
): Promise<YouTubeSearchResult> {
  const cacheKey = getCacheKey(query, pageToken);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    part: 'snippet',
    maxResults: '20',
    q: `${query} music`,
    type: 'video',
    videoCategoryId: '10', // Music category
    key: YOUTUBE_API_KEY,
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to search YouTube');
  }

  const data = await response.json();

  const result: YouTubeSearchResult = {
    items: data.items.map((item: any) => ({
      id: item.id.videoId,
      title: decodeHtmlEntities(item.snippet.title),
      channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    })),
    nextPageToken: data.nextPageToken,
  };

  setCache(cacheKey, result);
  return result;
}

// Get video details
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: videoId,
    key: YOUTUBE_API_KEY,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.items?.length) return null;

  const item = data.items[0];
  return {
    id: item.id,
    title: decodeHtmlEntities(item.snippet.title),
    channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    duration: item.contentDetails?.duration,
  };
}

// Decode HTML entities from YouTube API responses
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Format ISO 8601 duration to readable format
export function formatDuration(isoDuration?: string): string {
  if (!isoDuration) return '0:00';
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format seconds to mm:ss
export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
