import { NextRequest } from 'next/server';
import { stringify } from 'querystring';

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

  const cleanTitle = encodeURIComponent(title.trim());
  const cleanArtist = encodeURIComponent(artist.trim());


  const url = `https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}`;
  console.log('Title:', title);
  console.log('Artist:', artist);
  console.log('API URL:', url);


  try{
    const lyricsResponse = await fetch(url)
    const data = await lyricsResponse.json()

    if(data.lyrics){
      return new Response(
        JSON.stringify({lyrics: data.lyrics}),
        {status : 200, headers: {'Content-Type': 'application/json'}}
      );
    }
    else{
      return new Response(
        JSON.stringify({error: 'Lyrics not found'}),
        {status : 404, headers: {'Content-Type' : 'application/json'}}
      );
    }
  }
  catch(err){
    console.error(err);
    return new Response(
      JSON.stringify({error: 'Failed to reach lyrics.ovh API'}),
      {status : 500, headers: {'Content-Type' : 'application/json'}}
    );
  }
}