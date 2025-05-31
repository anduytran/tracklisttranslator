export async function fetchLyricsForSong(artist: string, title: string): Promise<string | null> {
    const encodedArtist = encodeURIComponent(artist.trim());
    const encodedTitle  = encodeURIComponent(title.trim());
    const url = `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`;
  try {
    const res = await fetch(url);
    // If we get 404, no lyrics found
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      console.error(`Failed to fetch lyrics: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = (await res.json()) as { lyrics?: string };
    return json.lyrics ?? null;
  } catch (err) {
    console.error('Error in fetchLyricsForSong:', (err as Error).message);
    return null;
  }
}