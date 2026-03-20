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
    if (songs && songs.length > 0 && index !== undefined) {
      playQueue(songs, index);
    } else {
      playSong(song);
    }
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
          'group flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-accent cursor-pointer',
          isCurrentSong && 'bg-accent'
        )}
        onClick={handlePlay}
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
          <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-5 w-5 text-white" fill="white" />
          </div>
          {isCurrentSong && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex gap-0.5">
                <span className="h-3 w-0.5 animate-pulse bg-primary" />
                <span className="h-3 w-0.5 animate-pulse bg-primary delay-75" />
                <span className="h-3 w-0.5 animate-pulse bg-primary delay-150" />
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium', isCurrentSong && 'text-primary')}>
            {song.title}
          </p>
          {showArtist && (
            <p className="truncate text-xs text-muted-foreground">{song.channelTitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLike}>
            <Heart className={cn('h-4 w-4', isLiked && 'fill-primary text-primary')} />
          </Button>
          {contextMenu}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer rounded-lg bg-card p-3 transition-colors hover:bg-accent"
      onClick={handlePlay}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
        <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
          >
            <Play className="h-6 w-6" fill="currentColor" />
          </Button>
        </div>
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2 left-2 flex gap-0.5">
            <span className="h-3 w-0.5 animate-pulse bg-primary" />
            <span className="h-3 w-0.5 animate-pulse bg-primary delay-75" />
            <span className="h-3 w-0.5 animate-pulse bg-primary delay-150" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium', isCurrentSong && 'text-primary')}>
            {song.title}
          </p>
          {showArtist && (
            <p className="truncate text-xs text-muted-foreground">{song.channelTitle}</p>
          )}
        </div>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          {contextMenu}
        </div>
      </div>
    </div>
  );
}
