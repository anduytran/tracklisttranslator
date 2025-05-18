"use client"

import UrlForm from '@components/UrlForm';

export default function Home() {
    const handleAnalyze = async (playlistUrl: string) => {
    // e.g. fetch(`/api/analyze?url=${encodeURIComponent(playlistUrl)}`)
    console.log('Analyzing:', playlistUrl);
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Spotify Playlist Meaning Analyzer
        </h1>
        <UrlForm onSubmit={handleAnalyze} />
      </div>
    </div>
  );
}
