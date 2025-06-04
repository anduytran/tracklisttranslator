import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log("🎯 lyrics_com_api route hit");
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');

  if (!title || !artist) {
    return new Response(
        JSON.stringify({ error: 'Missing title or artist' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const uid = process.env.STANDS4_UID || '';
  const tokenid = process.env.STANDS4_TOKENID || '';

  const query = new URLSearchParams({uid, tokenid, term: title, format: 'json'});

  if (artist) {
    query.append('artist', artist);
  }

  const url = `https://www.stands4.com/services/v2/lyrics.php?${query.toString()}`;

  try {
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    console.log("Raw STANDS4 response:", JSON.stringify(data, null, 2));
    const results = data.result;
    if (!Array.isArray(results) || results.length === 0) {
      return new Response(JSON.stringify({ error: 'No results found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const result = results.find((entry: { artist: string; }) =>
        entry.artist?.toLowerCase() === artist.toLowerCase()) || results[0];
    const songLink = result["song-link"];

    if(!songLink){
      return new Response(JSON.stringify({ error: 'Lyrics not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({url:songLink }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  catch (err) {
    console.error('Lyrics API error:', err);
    return new Response(JSON.stringify({ error: 'Lyrics API call failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}