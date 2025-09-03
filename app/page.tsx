'use client'

import UrlForm from '@components/UrlForm';
import type { ParsedTrack } from '@/services/spotifyParser';
import React, { useRef, useEffect, useState } from 'react';

function ThreeDots() {
  const dotBase =
    'w-2 h-2 bg-gray-500 rounded-full animate-bounce inline-block';
  return (
    <div className="flex space-x-1">
      <span className={dotBase} style={{ animationDelay: '0ms' }} />
      <span className={dotBase} style={{ animationDelay: '200ms' }} />
      <span className={dotBase} style={{ animationDelay: '400ms' }} />
    </div>
  );
}

export default function Home() {
  const [tracks, setTracks] = useState<ParsedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastLink, loading, tracks, interpretation]);

  const handleAnalyze = async (playlistUrl: string) => {
    setLastLink(playlistUrl);
    setLoading(true);
    setError(null);
    setTracks([]);
    setInterpretation(null);

    console.log('Trying API route:', playlistUrl);
    try {
      console.log('Spotify fetch URL:', playlistUrl);
      const response = await fetch(`/api/?url=${encodeURIComponent(playlistUrl)}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch playlist');
      }

      console.log('API returned this object:', json);
      setTracks(json.tracks);
      setInterpretation(json.interpretation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 px-100">
      {/* ─── iOS-style header ─── */}
      <div className="bg-gray-100 border-b flex items-center justify-between px-4 py-3">
        {/* ← back button */}
        <button className="text-blue-600 text-xl">←</button>

        {/* img + name */}
        <div className="flex flex-col items-center">
          <img
            src="placeholder"
            alt="Playlist Analyzer"
            className="w-8 h-8 rounded-full mb-1"
          />
          <div className="flex items-center space-x-1">
            <span className="text-base font-semibold">Playlist Analyzer</span>
            <span className="text-gray-400 text-sm">&gt;</span>
          </div>
        </div>

        {/* spacer */}
        <span className="text-blue-600 text-xl" />
      </div>

      {/* ── Message area */}
      <div
        id="messages"
        className="flex-1 overflow-y-auto py-4 space-y-4"
      >
        <div className="flex justify-end mx-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-xs break-words">
            Hey, my crush just made me a playlist... They totally like me right?
          </div>
        </div>

        <div className="flex justify-start mx-4">
          <div className="bg-gray-200 px-4 py-2 rounded-2xl max-w-xs">
            You're so delulu... I'll take a lookie
          </div>
        </div>

        <div className="flex justify-end mx-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-xs break-words">
            OKAY ILL SEND IT RQ
          </div>
        </div>
        {/* • User’s input bubble (right-aligned) */}
        {lastLink && (
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-xs break-words">
              {lastLink}
            </div>
          </div>
        )}


        {/* • Loading “…” bubble (left-aligned) */}
        {loading && (
          <div className="flex justify-start mx-4">
            <div className="bg-gray-200 px-4 py-2 rounded-2xl inline-flex">
              <ThreeDots />
            </div>
          </div>
        )}

        {/* • Gemini interpretation bubble (left-aligned) */}
        {!loading && interpretation && (
          <div className="flex justify-start mx-4">
            <div className="bg-gray-200 px-4 py-2 rounded-2xl max-w-xs whitespace-pre-wrap">
              <p>{interpretation}</p>
            </div>
          </div>
        )}

        {/* • Result bubbles (track list) */}
        {!loading &&
          tracks.map((track) => (
            <div key={track.id} className="flex justify-start mx-4">
              <div className="bg-gray-200 px-4 py-2 rounded-2xl max-w-xs">
                <p className="font-semibold">{track.name}</p>
                <p className="text-sm text-gray-600">{track.artist}</p>
              </div>
            </div>
          ))}

        {/* Anchor to scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar fixed at bottom ──── */}
      <div className="border-t px-4 py-3 bg-white">
        <UrlForm onSubmit={handleAnalyze} />
        {error && (
          <p className="mt-2 text-red-600 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
}