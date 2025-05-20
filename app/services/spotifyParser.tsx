export interface ParsedTrack {
  id: string
  name: string
  artist: string
  spotifyUrl: string
  albumName: string
  albumImageUrl: string
  durationMs: number
  popularity: number
  previewUrl: string | null
  // optional fields
  addedAt?: string
  addedById?: string
  explicit?: boolean
}

interface RawImage {
  url: string
  height: number
  width: number
}

interface RawAlbum {
  name: string
  images: RawImage[]
}

interface RawArtist {
  name: string
}

interface RawTrackObject {
  id: string
  name: string
  artists: RawArtist[]
  external_urls: { spotify: string }
  album: RawAlbum
  duration_ms: number
  popularity: number
  preview_url: string | null
  explicit: boolean
}

export interface RawItem {
  added_at?: string
  added_by?: { id: string }
  track: RawTrackObject
  is_local: boolean
}

interface RawPaging {
  items: RawItem[]
}

function getClosestImageUrl(images: RawImage[], targetWidth = 300): string {
  if (images.length === 0) {
    return ''
  }
  return images.reduce((best, img) => {
    const bestDiff = Math.abs(best.width - targetWidth)
    const imgDiff  = Math.abs(img.width  - targetWidth)
    return imgDiff < bestDiff ? img : best
  }).url
}

export function parsePlaylistTracks(raw: RawPaging): ParsedTrack[] {
  return raw.items.map(item => {
  const t = item.track
  return {
      id:            t.id,
      name:          t.name,
      artist:        t.artists[0]?.name ?? '',
      spotifyUrl:    t.external_urls.spotify,
      albumName:     t.album.name,
      albumImageUrl: getClosestImageUrl(t.album.images, 300), // to get all the same image size
      durationMs:    t.duration_ms,
      popularity:    t.popularity,
      previewUrl:    t.preview_url,
      // optional metadata
      addedAt:       item.added_at,
      addedById:     item.added_by?.id,
      explicit:      t.explicit,
    }
  })
}