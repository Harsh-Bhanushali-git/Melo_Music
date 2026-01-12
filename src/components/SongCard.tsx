import { Play, MoreVertical, Heart, ListPlus, Radio } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: YouTubeVideo;
  showArtist?: boolean;
  variant?: 'card' | 'row';
}

export function SongCard({ song, showArtist = true, variant = 'card' }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [isLiked, setIsLiked] = useState(isLikedSong(song.id));
  const isCurrentSong = currentSong?.id === song.id;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeLikedSong(song.id);
    } else {
      addLikedSong(song);
    }
    setIsLiked(!isLiked);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
  };

  const playlists = getPlaylists();

  if (variant === 'row') {
    return (
      <div
        className={cn(
          'group flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-accent cursor-pointer',
          isCurrentSong && 'bg-accent'
        )}
        onClick={() => playSong(song)}
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="h-full w-full object-cover"
          />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <DropdownMenuItem
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        {playlist.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No playlists</DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>
                <Radio className="mr-2 h-4 w-4" />
                Start Radio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer rounded-lg bg-card p-3 transition-colors hover:bg-accent"
      onClick={() => playSong(song)}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              playSong(song);
            }}
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
      <p className={cn('truncate text-sm font-medium', isCurrentSong && 'text-primary')}>
        {song.title}
      </p>
      {showArtist && (
        <p className="truncate text-xs text-muted-foreground">{song.channelTitle}</p>
      )}
    </div>
  );
}
