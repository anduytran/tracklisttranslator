const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

let _cachedToken: {token: string; expiresAt: number} | null = null; // Store token in memory

async function getAccessToken(): Promise<string> {
    // Check if Token is expired
    const now = Date.now();
    if (_cachedToken && _cachedToken.expiresAt > now) {
        return _cachedToken.token;
    }

    const creds = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'); // encode client credentials
    const response = await fetch(TOKEN_URL, {method: 'POST', headers: { Authorization: `Basic ${creds}`,'Content-Type':  'application/x-www-form-urlencoded',}, 
    body: new URLSearchParams({grant_type: 'client_credentials'}),
  });

    if (!response.ok) {
        throw new Error(`Spotify token error: ${response.status} ${await response.text()}`);
    }

    const { access_token, expires_in } = await response.json();
    _cachedToken = {
        token: access_token, expiresAt: now + expires_in * 1000 - 60_000, // expire 1 minute early
  };
  return access_token;
}

export async function getPlaylistID(urlStr: string): Promise<string | null> {
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split('/');
    const i = parts.indexOf('playlist');
    if (i !== -1 && parts.length > i + 1) {
      return parts[i + 1];
    }
  } catch {

  }
  // use regex
  const match = urlStr.match(/playlist\/([^?\/]+)/);
  return match ? match[1] : null;
}

async function fetchPlaylistPage(playlistId: string, offset = 0, limit  = 100) {
    const token = await getAccessToken();
    const url = `${API_BASE}/playlists/${playlistId}/tracks`;
    const response = await fetch(url, {headers: {Authorization: `Bearer ${token}` },});
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${await response.text()}`);
    }
    return response.json() as Promise<SpotifyApi.PlaylistTrackResponse>;
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyApi.PlaylistTrackResponse['items']> {
    const first = await fetchPlaylistPage(playlistId, 0);
    const pages = Math.ceil(first.total / first.limit);
    let items   = first.items;

    for (let i = 1; i < pages; i++) {
        const page = await fetchPlaylistPage(playlistId, i * first.limit, first.limit);
        items = items.concat(page.items);
    }
    return items;
}
