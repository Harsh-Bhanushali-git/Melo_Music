// YouTube API configuration
export const YOUTUBE_API_KEY = 'AIzaSyBQiAZk3C1oAAOttuOcBqs8Hk1fg7wpOso';

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

// Search YouTube videos
export async function searchYouTube(
  query: string,
  pageToken?: string
): Promise<YouTubeSearchResult> {
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

  return {
    items: data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    })),
    nextPageToken: data.nextPageToken,
  };
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
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    duration: item.contentDetails?.duration,
  };
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
