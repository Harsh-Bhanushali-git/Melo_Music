import { YouTubeVideo } from './youtube';

const LIKED_SONGS_KEY = 'sunoh_liked_songs';
const PLAYLISTS_KEY = 'sunoh_playlists';
const RECENT_KEY = 'sunoh_recent';

export interface Playlist {
  id: string;
  name: string;
  songs: YouTubeVideo[];
  createdAt: number;
}

// Liked Songs
export function getLikedSongs(): YouTubeVideo[] {
  const data = localStorage.getItem(LIKED_SONGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addLikedSong(song: YouTubeVideo): void {
  const songs = getLikedSongs();
  if (!songs.find(s => s.id === song.id)) {
    songs.unshift(song);
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(songs));
  }
}

export function removeLikedSong(songId: string): void {
  const songs = getLikedSongs().filter(s => s.id !== songId);
  localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(songs));
}

export function isLikedSong(songId: string): boolean {
  return getLikedSongs().some(s => s.id === songId);
}

// Playlists
export function getPlaylists(): Playlist[] {
  const data = localStorage.getItem(PLAYLISTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function createPlaylist(name: string): Playlist {
  const playlists = getPlaylists();
  const newPlaylist: Playlist = {
    id: Date.now().toString(),
    name,
    songs: [],
    createdAt: Date.now(),
  };
  playlists.push(newPlaylist);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  return newPlaylist;
}

export function deletePlaylist(playlistId: string): void {
  const playlists = getPlaylists().filter(p => p.id !== playlistId);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export function addSongToPlaylist(playlistId: string, song: YouTubeVideo): void {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist && !playlist.songs.find(s => s.id === song.id)) {
    playlist.songs.push(song);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }
}

export function removeSongFromPlaylist(playlistId: string, songId: string): void {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.songs = playlist.songs.filter(s => s.id !== songId);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }
}

// Recently Played
export function getRecentlyPlayed(): YouTubeVideo[] {
  const data = localStorage.getItem(RECENT_KEY);
  return data ? JSON.parse(data) : [];
}

export function addToRecentlyPlayed(song: YouTubeVideo): void {
  let recent = getRecentlyPlayed().filter(s => s.id !== song.id);
  recent.unshift(song);
  recent = recent.slice(0, 50); // Keep last 50
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}
