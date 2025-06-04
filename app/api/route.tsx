import { NextResponse } from 'next/server'
import { getPlaylistID, getPlaylistTracks } from '@/services/spotify'
import { parsePlaylistTracks } from '@/services/spotifyParser'
import { fetchLyricsForSong } from '@/services/lyrics'
import type { RawItem } from '@/services/spotifyParser'
import { GoogleGenAI } from '@google/genai'

export const revalidate = 0

const gemini_key = process.env.GEMINI_API_KEY || '';
if (!gemini_key) throw new Error("GEMINI_API_KEY not found in environment variables")
const ai = new GoogleGenAI({apiKey: gemini_key})

export async function GET(request: Request) {
    try {
        const playlistUrl = new URL(request.url).searchParams.get('url')
        if(!playlistUrl) {
            return NextResponse.json(
                { error: 'Missing URL' },
                { status: 400 }
            )
        }

        const playlistID = await getPlaylistID(playlistUrl)
        if (!playlistID) {
            return NextResponse.json(
                { error: 'Invalid Spotify playlist ID' },
                { status: 400 }
            )
        }
        // 1. Fetch raw items from Spotify
        const items = await getPlaylistTracks(playlistID)
        // 2. Drop any null‐track entries
        const nonNullItems = items.filter(
            (
                item
            ): item is SpotifyApi.PlaylistTrackObject & {
                track: SpotifyApi.TrackObjectFull
            } => item.track !== null
        )
        // 3. Map into your RawItem shape so parsePlaylistTracks can consume it
        const rawItems: RawItem[] = nonNullItems.map((item) => ({
            added_at: item.added_at ?? undefined,
            added_by: item.added_by ? { id: item.added_by.id } : undefined,
            is_local: item.is_local,
            track: {
                id: item.track.id,
                name: item.track.name,
                artists: item.track.artists.map((a) => ({ name: a.name })),
                external_urls: { spotify: item.track.external_urls.spotify },
                album: {
                    name: item.track.album.name,
                    images: item.track.album.images
                        .filter(
                            (img): img is SpotifyApi.ImageObject & {
                                height: number
                                width: number
                            } =>
                                typeof img.height === 'number' &&
                                typeof img.width === 'number'
                        )
                        .map((img) => ({
                            url: img.url,
                            height: img.height,
                            width: img.width,
                        })),
                },
                duration_ms: item.track.duration_ms,
                popularity: item.track.popularity,
                preview_url: item.track.preview_url,
                explicit: item.track.explicit,
            },
        }))
        // 4. Parse into your front-end shape
        const tracks = parsePlaylistTracks({ items: rawItems})
        const withLyrics = await Promise.all(
            tracks.map(async (trackObj) => {
                // trackObj.artist & trackObj.name came from parsePlaylistTracks
                const lyricsText = await fetchLyricsForSong(
                    trackObj.artist,
                    trackObj.name
                )
                return {
                    ...trackObj,
                    lyrics: lyricsText ?? 'No lyrics found'
                }
            })
        )


        const lyricsSnippets = withLyrics
            .map((t) => {
                const snippet =
                    t.lyrics.length > 1000 ? t.lyrics.slice(0, 1000) + '...': t.lyrics
                return `Song: "${t.name}" by ${t.artist}\n Lyrics snippet: "${snippet}"\n`
            })
            .join('\n')

        const systemInstruction = `
            You are given a list of songs (each with artist, title, and a snippet of its lyrics).  Your job is to interpret
            the overall meaning or theme of this playlist (e.g. what emotional arc, story, or message the curator is
            trying to convey).  Summarize in one concise paragraph without quoting full lyrics. If there are missing lyrics,
            do NOT use the song, including it's name and artist in the analysis.
        `
        const userContent = `Here are the playlist’s tracks and short lyric snippets:\\n${lyricsSnippets}`
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: userContent,
            config: {
                systemInstruction: systemInstruction.trim(),
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 500
            },
        })
        return NextResponse.json({
            tracks: withLyrics,
            interpretation: geminiResponse.text,
        })
    } catch(err: unknown) {
        console.error(err)
        const message =
            err instanceof Error
                ? err.message
                : 'Unknown error.'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}