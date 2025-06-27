'use client'

import UrlForm from '@components/UrlForm'
import type {ParsedTrack} from '@/services/spotifyParser'
import {useState} from 'react'

export default function Home() {
    const [tracks, setTracks] = useState<ParsedTrack[]>([])
    const [interpretation, setInterpretation] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async (playlistUrl: string) => {
        setLoading(true)
        setError(null)
        setTracks([])
        setInterpretation(null)

        try {
            const response = await fetch(`/api/?url=${encodeURIComponent(playlistUrl)}`)
            const json = await response.json()

            if (!response.ok) {
                throw new Error(json.error || 'Failed to fetch playlist')
            }

            console.log('API returned this object:', json)
            setTracks(json.tracks)                     // array of { id, name, artist, lyrics, … }
            setInterpretation(json.interpretation)      // the “meaning” string from Gemini
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-screen max-w-xxl">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Spotify Playlist Meaning Analyzer
                </h1>

                <UrlForm onSubmit={handleAnalyze}/>

                {/* Show loading / error */}
                {loading && (
                    <p className="mt-4 text-center text-gray-600">
                        Fetching playlist data…
                    </p>
                )}
                {error && (
                    <p className="mt-4 text-center text-red-600">Error: {error}</p>
                )}

                {/* Show “interpretation” once it’s available */}
                {!loading && !error && interpretation && (
                    <div className="mt-6 p-4 bg-white rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">
                            Playlist Meaning
                        </h2>
                        <p className="text-gray-800">{interpretation}</p>
                    </div>
                )}

                {/* Once tracks are present, render them */}
                {!loading && !error && tracks.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tracks.map((track) => (
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
                                <h2 className="mt-3 text-lg font-semibold">
                                    {track.name}
                                </h2>
                                <p className="text-gray-600">{track.artist}</p>

                                {/* Lyrics snippet */}
                                {track.lyrics ? (
                                    <pre className="max-h-48 overflow-y-auto text-sm whitespace-pre-wrap mb-2">
                    {track.lyrics.substring(0, 150).trim()}…{' '}
                                        <span
                                            className="text-blue-600 cursor-pointer"
                                            title="Show full lyrics"
                                        >
                      (more)
                    </span>
                  </pre>
                                ) : (
                                    <p className="text-xs italic text-gray-500 mb-2">
                                        No lyrics found.
                                    </p>
                                )}

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
    )
}
