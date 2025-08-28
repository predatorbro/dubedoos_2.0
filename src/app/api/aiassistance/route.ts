import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY as string,
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

    const system = `You are a helpful assistant for a productivity app (quickees, notes, bookmarks, calendar).
Respond ONLY with strict JSON. Never include markdown, backticks, code fences, or explanations. Output a SINGLE JSON object exactly in this shape:
{"action":"todo|note|both|link|calendar|chat","title":"","description":"","todo":"","linkLabel":"","linkUrl":"","category":"","newCategory":"","date":"","calendarTodo":""}
- For a quickee/todo request: action="todo" and fill 'todo' (and optionally 'title'/'description').
- For a note request: action="note" and fill 'title' and 'description'.
- For both: action="both" and fill both note and todo fields.
- For a bookmark/link request: action="link" and fill 'linkLabel', 'linkUrl', and either 'category' (existing) or 'newCategory' (new one).
- For a calendar request (e.g., "on 20 aug add ..."): action="calendar" and fill ISO 'date' (YYYY-MM-DD) and 'calendarTodo'. If the user does NOT specify a year, DEFAULT the year to 2025 while keeping the provided month and day.
- For general conversation: action="chat" and place the answer in 'description' (optionally 'title').
- If the user provides JSON or text that implies an action (even inside code fences), EXTRACT the intended JSON values and return a clean JSON object without any fences or extra text.
- Never echo the user's prompt.`;

    const userMessage: string = typeof message === "string" ? message : JSON.stringify(message);
    const prompt: string = `${system}\n\nUser input: ${userMessage}`;

    const GeminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt || "",
    });

    const raw = GeminiResponse.text || "";

    // Sanitize helper: strip code fences and extract JSON block if present
    const stripFences = (t: string) => t.replace(/```[\s\S]*?```/g, (match) => match.replace(/```json|```/g, "")).trim();
    const extractJson = (t: string): any | null => {
      const cleaned = stripFences(t);
      try { return JSON.parse(cleaned); } catch {}
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) { try { return JSON.parse(m[0]); } catch {} }
      return null;
    };

    let parsed: any = extractJson(raw);
    if (!parsed) {
      // Fallback to chat with cleaned text
      parsed = { action: "chat", title: "", description: stripFences(raw), todo: "" };
    }

    const result = {
      action: typeof parsed.action === "string" ? parsed.action : "chat",
      title: typeof parsed.title === "string" ? parsed.title : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      todo: typeof parsed.todo === "string" ? parsed.todo : "",
      linkLabel: typeof parsed.linkLabel === "string" ? parsed.linkLabel : "",
      linkUrl: typeof parsed.linkUrl === "string" ? parsed.linkUrl : "",
      category: typeof parsed.category === "string" ? parsed.category : "",
      newCategory: typeof parsed.newCategory === "string" ? parsed.newCategory : "",
      date: typeof parsed.date === "string" ? parsed.date : "",
      calendarTodo: typeof parsed.calendarTodo === "string" ? parsed.calendarTodo : "",
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to generate content" }), {
      status: 500,
    });
  }
}


