const lyricsCache = new Map<string, string>();

export async function fetchLyricsForSong(artist: string, title: string): Promise<string | null> {
  const key = `${artist.trim()}||${title.trim()}`;
  if (lyricsCache.has(key)) {
    return lyricsCache.get(key)!;
  }
  const encodedArtist = encodeURIComponent(artist.trim());
  const encodedTitle  = encodeURIComponent(title.trim());
  const endpoints = [
  `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`,
  `https://lyrics.lewdhutao.my.eu.org/musixmatch/lyrics-search?title=${encodedTitle}&artist=${encodedArtist}`
  ];

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    const isFallback = i === endpoints.length - 1;

    // for fallback endpoint, allow retries on server error 500
    const maxRetries = isFallback ? 3 : 1;
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`Trying ${url}`);
        const res = await fetch(url);
        // If we get 404, no lyrics found
        if (res.status === 404) {
          break;
          // console.warn(`No lyrics at ${url}`);
          // continue;
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`Client error ${res.status} at ${url}`);
          break;
        }
        if (res.status >= 500) {
          console.warn(`Server error ${res.status} at ${url}`);
          if (attempt < maxRetries) {
            // exponential back-off: 500ms, 1000ms, 2000ms…
            await wait(250 * Math.pow(2, attempt - 1));
            continue;
          } else {
            break;
          }
        }
        // if (!res.ok) {
        //   console.error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
        //   continue;
        // }

        const { lyrics } = (await res.json()) as { lyrics?: string };
        if (lyrics?.trim()) {
          lyricsCache.set(key, lyrics);
          return lyrics;
        }
        break;

      } catch (err) {
        console.error(`Fetch error on attempt ${attempt} for ${url}:`, err);
        if (attempt < maxRetries) {
          await wait(500 * Math.pow(2, attempt - 1));
          continue;
        }
        break;
        //console.error('Error in fetchLyricsForSong:', (err as Error).message);
      }
    }
  }
  return null;
}