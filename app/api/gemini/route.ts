import { NextResponse} from "next/server";
import {GoogleGenAI} from "@google/genai";

// Disable caching for fresh responses each time
export const revalidate = 0;

const gemini_key = process.env.GEMINI_API_KEY || '';
if (!gemini_key) throw new Error(
    "GEMINI_API_KEY not found in environment variables"
)
const ai = new GoogleGenAI({apiKey: gemini_key})

export async function GET() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            // add prompt here later
            contents: "Temporary prompt.",
            config: {
                // temp instruction
                systemInstruction: "You are to explain the meaning of the playlist by interpreting the lyrics of all " +
                    "the songs in the playlist. You should answer in a few words. You should not use any of the lyrics",
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1000,
            },
        });
        return NextResponse.json({ result: response.text });
    } catch(err) {
        console.error(err);
        return new Response(
            JSON.stringify({error: 'Error with Gemini API'}),
            {status : 500, headers: {'Content-Type' : 'application/json'}}
        );
    }
}