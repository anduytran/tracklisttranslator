export async function fetchLyricsForSong(artist: string, title: string): Promise<string | null> {
  const encodedArtist = encodeURIComponent(artist.trim());
  const encodedTitle  = encodeURIComponent(title.trim());
  const url = `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`;
  const endpoints = [
  `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`,
  `https://lyrics.lewdhutao.my.eu.org/musixmatch/lyrics-search?title=${encodedTitle}&artist=${encodedArtist}`
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      // If we get 404, no lyrics found
      if (res.status === 404) {
        console.warn(`No lyrics at ${url}`);
        continue;
      }
      if (!res.ok) {
        console.error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
        continue;
      }

      const json = (await res.json()) as { lyrics?: string };
      if(json.lyrics){
        return json.lyrics;
      }
    } catch (err) {
      console.error('Error in fetchLyricsForSong:', (err as Error).message);
    }
  }
  return null;
}