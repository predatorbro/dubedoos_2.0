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
            Your task is to take the raw user input and rewrite it into a clear, short, and meaningful notes.  
            
            The response must be:  
            - Direct and refined (no introductions, no explanations, no extra phrases).  
            - Grammatically correct and easy to understand.  
            - Short but descriptive enough to remind the user of the task.  
            - 2x length the user input only.
            - Use simple english that a 8th grader would understand.
            Only output the refined note.

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