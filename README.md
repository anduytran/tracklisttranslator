# Spotify Playlist Meaning Decoder

A lightweight Next.js + Tailwind CSS app that lets you paste a public Spotify playlist URL and instantly decipher its themes and meaning by fetching track metadata, retrieving lyrics from Genius, and running it through artificial intelligence.

---

## Features

- **No account needed** — no user signup or OAuth UI  
- **Spotify API Integration** — fetch playlist tracks without user login  
- **Genius API integration** — pull lyrics for each track (with in‑memory caching)  
- **Basic analysis pipeline** — per‑track analysis
- **Responsive UI** — styled with Tailwind CSS  
- **Dockerized** — run the entire app in one container  

---

## Tech Stack

- **Framework**: Next.js (App + API Routes)  
- **Styling**: Tailwind CSS  
- **APIs**:  
  - Spotify Web API (Client Credentials grant)  
  - Genius API
  - TBD AI
- **Containerization**: Docker (multi‑stage Dockerfile)  

---

## Prerequisites

- Node.js ≥ 16.x & npm  
- Docker (optional, for containerized runs)  
- Spotify Developer account (Client ID & Secret)  
- Genius API access token  

---

## Getting Started

**Clone the repo**
```
git clone https://github.com/YOUR-USERNAME/tracklisttranslator
```

**Set up local environment keys**
```
create a .env.local file and add
SPOTIFY_CLIENT_ID = YOUR_ID
SPOTIFY_CLIENT_SECRET = YOUR_SECRET
GEMINI_API_KEY = YOUR_KEY
```

**Install Dependencies**

```
npm install next@latest react@latest react-dom@latest
```

**Run the development server**

    ```
    bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
