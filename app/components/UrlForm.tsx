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
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4"> {/* calls handleSubmit when the submit for the form is used */}
      <input
        type="text"
        placeholder="Paste Spotify playlist URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        disabled={!url.trim()}
      >
        Analyze
      </button>
    </form>
  );
}