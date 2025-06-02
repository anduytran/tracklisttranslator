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

  const query = `${title} ${artist}`;
  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;

  try {
    const geniusResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
      },
    });

    const data = await geniusResponse.json();
    const firstMatch = data.response.hits[0]?.result;

    if (firstMatch) {
      console.log('Query:', query);
      console.log('Genius API response:', data);
      return new Response(JSON.stringify({ url: firstMatch.url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } 
    else {
      return new Response(JSON.stringify({ error: 'Song could not be found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } 
  catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Could not reach Genius API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
