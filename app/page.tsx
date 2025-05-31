"use client"

import UrlForm from '@components/UrlForm';
import type { ParsedTrack } from '@/services/spotifyParser';
import { useState } from 'react'; // used to store user input

export default function Home() {
    const [tracks, setTracks] = useState<ParsedTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (playlistUrl: string) => {setLoading(true); setError(null); setTracks([]); // gets playlist url
    console.log('Trying API route:', playlistUrl);
    try {
        console.log('Spotify fetch URL:', playlistUrl);
        const response = await fetch(`/api/?url=${playlistUrl}`) // reroutes to /api/route.tsx
        const json = await response.json()
        if (!response.ok) {
            throw new Error(json.error || 'Failed to fetch playlist');
        }
      setTracks(json.tracks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
    

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Spotify Playlist Meaning Analyzer
        </h1>
        <UrlForm onSubmit={handleAnalyze} />
        {loading && (
        <p className="mt-4 text-center text-gray-600">
          Fetching playlist data…
        </p>)}
        {error && (
          <p className="mt-4 text-center text-red-600">Error: {error}</p>
        )}
        {!loading && !error && tracks.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map(track => (
              <div
                key={track.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                {/* Album art */}
                <img
                  src={track.albumImageUrl}
                  alt={track.albumName}
                  className="w-full h-48 object-cover rounded"
                />

                {/* Song title & artist */}
                <h2 className="mt-3 text-lg font-semibold">{track.name}</h2>
                <p className="text-gray-600">{track.artist}</p>

                {/* Link back to Spotify */}
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-blue-600 hover:underline"
                >
                  Open in Spotify
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
