"use client"

import { useState } from 'react'; // used to store user input

interface urlFormProp {
  onSubmit: (url: string) => void; // function that takes the string, returns nothing
}

export default function UrlForm({ onSubmit }: urlFormProp) { // function receives the "prop"
  const [url, setUrl] = useState(''); // holds what the user inputted
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // no page reload
    if (!url.trim()) return; // no blank submissions w/ trimmed whitespace
    // will add further spotify link verification here
    onSubmit(url.trim());
  };

  
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full"
    >
      {/* pill-shaped background + transparent input */}
      <div className="relative flex-1">
        <div className="absolute inset-0 bg-gray-100 rounded-full pointer-events-none" />
        <input
          type="text"
          placeholder="Paste Spotify playlist URL…"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="relative w-full bg-transparent px-4 py-2 rounded-full focus:outline-none placeholder-gray-500"
        />
      </div>

      {/* Analyze “send” bubble */}
      <button
        type="submit"
        disabled={!url.trim()}
        className="ml-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow disabled:opacity-50"
      >
        Analyze
      </button>
    </form>
  )
}