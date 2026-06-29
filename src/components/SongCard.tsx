import { Play, MoreVertical, Heart, ListPlus, Radio, ListEnd, Plus } from 'lucide-react';
import { YouTubeVideo } from '@/lib/youtube';
import { usePlayer } from '@/contexts/PlayerContext';
import { isLikedSong, addLikedSong, removeLikedSong, getPlaylists, addSongToPlaylist } from '@/lib/storage';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CreatePlaylistDialog } from '@/components/CreatePlaylistDialog';
import { toast } from 'sonner';

interface SongCardProps {
  song: YouTubeVideo;
  showArtist?: boolean;
  variant?: 'card' | 'row';
  songs?: YouTubeVideo[];
  index?: number;
}

export function SongCard({ song, showArtist = true, variant = 'card', songs, index }: SongCardProps) {
  const { playSong, playQueue, addToQueue, currentSong, isPlaying } = usePlayer();
  const [isLiked, setIsLiked] = useState(isLikedSong(song.id));
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    // Always use playSong so auto-fetch kicks in for related/similar songs
    playSong(song);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeLikedSong(song.id);
    } else {
      addLikedSong(song);
    }
    setIsLiked(!isLiked);
    window.dispatchEvent(new Event('likedSongsUpdated'));
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
    toast.success(`Added "${song.title}" to queue`);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
    toast.success('Added to playlist');
  };

  const playlists = getPlaylists();

  const contextMenu = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleAddToQueue}>
            <ListEnd className="mr-2 h-4 w-4" />
            Add to Queue
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLike}>
            <Heart className={cn('mr-2 h-4 w-4', isLiked && 'fill-primary text-primary')} />
            {isLiked ? 'Remove from Liked' : 'Add to Liked'}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListPlus className="mr-2 h-4 w-4" />
              Add to Playlist
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowCreatePlaylist(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Playlist
              </DropdownMenuItem>
              {playlists.length > 0 && <DropdownMenuSeparator />}
              {playlists.map((playlist) => (
                <DropdownMenuItem
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  {playlist.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Radio className="mr-2 h-4 w-4" />
            Start Radio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePlaylistDialog
        open={showCreatePlaylist}
        onOpenChange={setShowCreatePlaylist}
      />
    </>
  );

  if (variant === 'row') {
    return (
      <div
        className={cn(
          'group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl p-2 transition-all duration-200',
          isCurrentSong
            ? 'glass-card-active'
            : 'hover:bg-white/[0.06] border border-transparent'
        )}
        onClick={handlePlay}
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
          <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-5 w-5 text-white" fill="white" />
          </div>
          {isCurrentSong && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <div className="flex h-5 items-end">
                <span className="eq-bar" style={{ background: '#FF2D2D' }} />
                <span className="eq-bar" style={{ background: '#FF2D2D' }} />
                <span className="eq-bar" style={{ background: '#FF2D2D' }} />
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium tracking-tight', isCurrentSong && 'text-[#FF2D2D]')}>
            {song.title}
          </p>
          {showArtist && (
            <p className="truncate text-xs text-white/50">{song.channelTitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={handleLike}>
            <Heart className={cn('h-4 w-4', isLiked && 'fill-[#FF2D2D] text-[#FF2D2D]')} />
          </Button>
          {contextMenu}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group song-card-lift relative min-w-0 cursor-pointer overflow-hidden rounded-2xl p-3',
        isCurrentSong ? 'glass-card-active' : 'glass-card'
      )}
      onClick={handlePlay}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl ring-1 ring-white/10">
        <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="btn-play-red flex h-12 w-12 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            aria-label="Play"
          >
            <Play className="h-5 w-5 pl-0.5" fill="currentColor" />
          </button>
        </div>
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2 left-2 flex h-5 items-end rounded-md bg-black/55 px-1.5 backdrop-blur">
            <span className="eq-bar" style={{ background: '#FF2D2D' }} />
            <span className="eq-bar" style={{ background: '#FF2D2D' }} />
            <span className="eq-bar" style={{ background: '#FF2D2D' }} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-semibold tracking-tight', isCurrentSong && 'text-[#FF2D2D]')}>
            {song.title}
          </p>
          {showArtist && (
            <p className="truncate text-xs text-white/50">{song.channelTitle}</p>
          )}
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          {contextMenu}
        </div>
      </div>
    </div>
  );
}

