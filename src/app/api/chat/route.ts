import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY,
});

export async function POST(req: Request) {

    try {
        const { message } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ error: "No text provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const prompt = `
            You are a smart note assistant.  
            Your task is to take the raw user input and rewrite it into a clear, short, and meaningful note.  
            
            The response must be:  
            - Direct and refined (no introductions, explanations, or extra phrases)
            - Grammatically correct and easy to understand
            - Concise but descriptive enough to remind the user of the content
            - Maximum twice the length of the original user input
            - Written in simple English that an 8th grader would understand
            - Focus on the key information and main points
            
            Only output the refined note - nothing else.

            User input: ${message}
            `;

        const GeminiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return new Response(JSON.stringify({ text: GeminiResponse.text }));
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Failed to generate content" }), {
            status: 500,
        });
    }
}
