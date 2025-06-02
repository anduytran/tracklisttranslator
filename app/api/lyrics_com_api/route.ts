import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

    if (!data || !data.lyrics) {
      return new Response(JSON.stringify({ error: 'Lyrics not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ lyrics: data.lyrics }), {
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