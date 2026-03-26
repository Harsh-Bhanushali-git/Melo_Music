import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { PinLock } from "@/components/PinLock";
import HomePage from "./pages/Home";
import SearchPage from "./pages/Search";
import LibraryPage from "./pages/Library";
import LikedSongsPage from "./pages/LikedSongs";
import PlaylistPage from "./pages/Playlist";
import ExplorePage from "./pages/Explore";
import ImportPlaylistPage from "./pages/ImportPlaylist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlayerProvider>
        <PinLock>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/liked" element={<LikedSongsPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/import" element={<ImportPlaylistPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PinLock>
      </PlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
