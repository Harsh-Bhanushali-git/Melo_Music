import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Loader2, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { searchYouTube, YouTubeVideo, YOUTUBE_API_KEY } from '@/lib/youtube';
import { createPlaylist, addSongToPlaylist } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ImportStatus {
  total: number;
  done: number;
  current: string;
  results: { name: string; found: boolean }[];
}

export default function ImportPlaylistPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const extractSpotifyPlaylistId = (url: string) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const extractYouTubePlaylistId = (url: string) => {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const importSpotifyPlaylist = async (playlistUrl: string) => {
    // Use Spotify's oEmbed endpoint (no API key needed) to get playlist name
    // Then scrape track names from the embed page
    const playlistId = extractSpotifyPlaylistId(playlistUrl);
    if (!playlistId) throw new Error('Invalid Spotify playlist URL');

    // Get playlist info via oEmbed
    const oembedRes = await fetch(
      `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`
    );
    if (!oembedRes.ok) throw new Error('Could not fetch playlist. Make sure it\'s public.');
    const oembedData = await oembedRes.json();
    const playlistName = oembedData.title || 'Spotify Import';

    // Use Spotify embed API to get tracks
    const embedRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.items(track(name,artists(name)))`,
      { headers: { 'Authorization': 'Bearer ' } }
    ).catch(() => null);

    // Fallback: parse track names from the oEmbed HTML or use title-based search
    // Since we can't access Spotify API without auth, we'll prompt user to paste track names
    // OR use the playlist name to search similar content
    
    // Alternative approach: use the embed page to extract track info
    let trackNames: string[] = [];
    
    try {
      // Try fetching the embed page for track names
      const embedPageRes = await fetch(
        `https://open.spotify.com/embed/playlist/${playlistId}`
      );
      if (embedPageRes.ok) {
        const html = await embedPageRes.text();
        // Extract track names from the embed HTML
        const trackMatches = html.match(/"name":"([^"]+)","artists":\[{"name":"([^"]+)"/g);
        if (trackMatches) {
          trackNames = trackMatches.map(m => {
            const nameMatch = m.match(/"name":"([^"]+)","artists":\[{"name":"([^"]+)"/);
            return nameMatch ? `${nameMatch[1]} ${nameMatch[2]}` : '';
          }).filter(Boolean);
        }
      }
    } catch {
      // Embed page blocked by CORS - expected
    }

    if (trackNames.length === 0) {
      // Fallback: ask user to paste track names manually
      throw new Error('NEED_TRACKS');
    }

    return { playlistName, trackNames };
  };

  const importYouTubePlaylist = async (playlistUrl: string) => {
    const playlistId = extractYouTubePlaylistId(playlistUrl);
    if (!playlistId) throw new Error('Invalid YouTube playlist URL');

    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: '50',
      playlistId,
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!res.ok) throw new Error('Could not fetch YouTube playlist. Make sure it\'s public.');
    const data = await res.json();

    const songs: YouTubeVideo[] = data.items
      .filter((item: any) => item.snippet.resourceId?.videoId)
      .map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle || item.snippet.videoOwnerChannelTitle || '',
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
      }));

    // Get playlist title
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    let playlistName = 'YouTube Import';
    if (plRes.ok) {
      const plData = await plRes.json();
      if (plData.items?.[0]) playlistName = plData.items[0].snippet.title;
    }

    return { playlistName, songs };
  };

  const searchAndAddTracks = async (trackNames: string[], playlistId: string) => {
    const results: { name: string; found: boolean }[] = [];

    for (let i = 0; i < trackNames.length; i++) {
      const name = trackNames[i];
      setStatus(prev => prev ? { ...prev, done: i, current: name } : null);

      try {
        const searchResult = await searchYouTube(name);
        if (searchResult.items.length > 0) {
          addSongToPlaylist(playlistId, searchResult.items[0]);
          results.push({ name, found: true });
        } else {
          results.push({ name, found: false });
        }
      } catch {
        results.push({ name, found: false });
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    return results;
  };

  const [manualTracks, setManualTracks] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleImport = async () => {
    if (!url.trim() && !showManualInput) return;

    setLoading(true);
    setStatus(null);

    try {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      const isSpotify = url.includes('spotify.com');

      if (isYouTube) {
        const { playlistName, songs } = await importYouTubePlaylist(url);
        const playlist = createPlaylist(playlistName);
        
        setStatus({ total: songs.length, done: 0, current: '', results: [] });
        
        for (const song of songs) {
          addSongToPlaylist(playlist.id, song);
        }

        setStatus({
          total: songs.length,
          done: songs.length,
          current: '',
          results: songs.map(s => ({ name: s.title, found: true })),
        });

        window.dispatchEvent(new Event('playlistsUpdated'));
        toast({ title: `Imported "${playlistName}" with ${songs.length} songs` });
      } else if (isSpotify || showManualInput) {
        let trackNames: string[] = [];
        let playlistName = 'Imported Playlist';

        if (showManualInput && manualTracks.trim()) {
          trackNames = manualTracks.split('\n').map(t => t.trim()).filter(Boolean);
          playlistName = 'Spotify Import';
        } else {
          try {
            const result = await importSpotifyPlaylist(url);
            trackNames = result.trackNames;
            playlistName = result.playlistName;
          } catch (e: any) {
            if (e.message === 'NEED_TRACKS') {
              setShowManualInput(true);
              setLoading(false);
              return;
            }
            throw e;
          }
        }

        const playlist = createPlaylist(playlistName);
        setStatus({ total: trackNames.length, done: 0, current: trackNames[0] || '', results: [] });

        const results = await searchAndAddTracks(trackNames, playlist.id);
        setStatus({ total: trackNames.length, done: trackNames.length, current: '', results });

        const found = results.filter(r => r.found).length;
        window.dispatchEvent(new Event('playlistsUpdated'));
        toast({ title: `Imported "${playlistName}" — ${found}/${trackNames.length} songs found` });
      } else {
        toast({ title: 'Please paste a valid Spotify or YouTube playlist URL', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: e.message || 'Import failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Import Playlist</h1>
          <p className="text-muted-foreground">
            Paste a Spotify or YouTube playlist URL to import songs
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://open.spotify.com/playlist/... or YouTube playlist URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
              disabled={loading}
            />
            <Button onClick={handleImport} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Import
            </Button>
          </div>

          {showManualInput && (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Spotify playlists need track names pasted manually. Copy your track list from Spotify and paste below (one song per line):
              </p>
              <textarea
                className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={"Kesariya - Arijit Singh\nDeva Deva - Arijit Singh\nRaataan Lambiyan - Jubin Nautiyal\n..."}
                value={manualTracks}
                onChange={(e) => setManualTracks(e.target.value)}
              />
              <Button onClick={handleImport} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
                Search & Import Songs
              </Button>
            </div>
          )}

          {/* Progress */}
          {status && (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              {status.done < status.total ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Searching: {status.current}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(status.done / status.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {status.done} / {status.total} songs
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Import complete!
                  </div>
                  <div className="max-h-60 space-y-1 overflow-y-auto">
                    {status.results.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {r.found ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
                        )}
                        <span className={r.found ? 'text-foreground' : 'text-muted-foreground line-through'}>
                          {r.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => navigate('/library')} className="mt-2">
                    Go to Library
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 font-semibold">How it works</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                <p><strong>YouTube playlists:</strong> Paste a YouTube playlist URL — songs are imported directly.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                <p><strong>Spotify playlists:</strong> Paste the URL, then copy-paste your track list. Each song is searched on YouTube and added.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                <p>Songs are saved to a new playlist in your library — playable anytime!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
