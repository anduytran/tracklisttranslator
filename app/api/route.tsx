import { NextResponse } from 'next/server'
import { getPlaylistID, getPlaylistTracks } from '@/services/spotify'
import { parsePlaylistTracks } from '@/services/spotifyParser'
import type { RawItem } from '@/services/spotifyParser'

export async function GET(request: Request) {
    console.log('Request:', request);
    const url = new URL(request.url).searchParams.get('url')
    if (!url) {
        return NextResponse.json(
            { error: 'Missing "url" parameter' },
            { status: 400 }
        )
    }

    const playlistId = await getPlaylistID(url)
    if (!playlistId) {
        return NextResponse.json(
            { error: 'Invalid Spotify playlist URL' },
            { status: 400 }
        )
    }

  try {
    // 1. Fetch raw items from Spotify
    const items: SpotifyApi.PlaylistTrackObject[] = await getPlaylistTracks(playlistId)

    // 2. Drop any null‐track entries
    const nonNullItems = items.filter(
      (
        item
      ): item is SpotifyApi.PlaylistTrackObject & {
        track: SpotifyApi.TrackObjectFull
      } => item.track !== null
    )

    // 3. Map into your RawItem shape so parsePlaylistTracks can consume it
    const rawItems: RawItem[] = nonNullItems.map(item => ({
      added_at: item.added_at ?? undefined,
      added_by: item.added_by ? { id: item.added_by.id } : undefined,
      is_local: item.is_local,

      track: {
        id:            item.track.id,
        name:          item.track.name,
        artists:       item.track.artists.map(a => ({ name: a.name })),
        external_urls: { spotify: item.track.external_urls.spotify },
        album: {
          name: item.track.album.name,
          images: item.track.album.images
            // ensure height & width are defined before mapping
            .filter(
              (img): img is SpotifyApi.ImageObject & {
                height: number
                width: number
              } =>
                typeof img.height === 'number' &&
                typeof img.width === 'number'
            )
            .map(img => ({
              url:    img.url,
              height: img.height,
              width:  img.width,
            })),
        },

        duration_ms: item.track.duration_ms,
        popularity:  item.track.popularity,
        preview_url: item.track.preview_url,
        explicit:    item.track.explicit,
      },
    }))

    // 4. Parse into your front-end shape
    const tracks = parsePlaylistTracks({ items: rawItems })

    return NextResponse.json({ tracks })
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}