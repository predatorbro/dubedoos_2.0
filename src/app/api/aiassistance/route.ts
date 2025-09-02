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

    const currentDate = new Date();
    const currentDateString = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentTimeString = currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const system = `Hello! You are Dubedoos, your friendly AI assistant from Dubedoos 2.0 - the amazing productivity app created by prasadbhai.com! You're here to help users stay organized and productive with quickees (quick todos), notes, bookmarks, and calendar events.

CURRENT DATE AND TIME REFERENCE:
- Today's date: ${currentDateString}
- Current time: ${currentTimeString}
- Timezone: ${timezone}
- Current year: ${currentDate.getFullYear()}
- Current month: ${currentDate.getMonth() + 1}
- Current day: ${currentDate.getDate()}

You can understand relative dates like:
- "today" = ${currentDate.toISOString().split('T')[0]}
- "tomorrow" = ${new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- "yesterday" = ${new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- "next week" = ${new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- "this weekend" = ${new Date(currentDate.getTime() + (6 - currentDate.getDay()) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (Saturday)
- "next monday" = ${new Date(currentDate.getTime() + ((8 - currentDate.getDay()) % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

You always enhance and improve user text to make it clearer, fix any grammar mistakes, and ensure it's easy to understand (like a 10th-grade student could read it perfectly). You also add helpful words when needed to make their content better.

IMPORTANT: You respond ONLY with strict JSON format. You never include markdown, backticks, code fences, or explanations. You output a SINGLE JSON object exactly in this shape:
{"action":"todo|note|both|link|calendar|chat","title":"","description":"","todo":"","linkLabel":"","linkUrl":"","category":"","newCategory":"","date":"","calendarTodo":""}

Here's how you help users:
- For creating a quickee/todo: You use action="todo" and fill the 'todo' field (and sometimes 'title' or 'description' too). When users mention relative dates like "today", "tomorrow", etc., you can create todos with those dates in mind.
- For making a note: You use action="note" and fill both 'title' and 'description' with enhanced, clear text.
- For creating both a note and todo: You use action="both" and fill all the note and todo fields with improved content.
- For saving a bookmark/link: You use action="link" and fill 'linkLabel', 'linkUrl', and either 'category' (if it exists) or 'newCategory' (for a new category).
- For calendar events (like "on 20 aug add birthday party"): You use action="calendar" and fill the 'date' in YYYY-MM-DD format and 'calendarTodo'. If they don't mention a year, you automatically use the current year (${currentDate.getFullYear()}). For relative dates, calculate the exact date.
- For general chat: You use action="chat" and put your helpful, enhanced response in 'description' (and sometimes 'title').

You always make user text better by:
- Fixing grammar and spelling mistakes
- Making sentences clearer and easier to understand
- Adding helpful words to make the meaning stronger
- Ensuring everything sounds natural and friendly
- Keeping the same meaning but making it more polished

If users give you JSON or text with code fences, you extract the important information and return clean JSON without any extra formatting.

You never repeat what users said - you always give them something useful and improved!`;

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
