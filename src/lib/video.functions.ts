import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import { extractVideoId } from "./youtube";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(system: string, user: string, json = false): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: json
        ? { responseMimeType: "application/json", temperature: 0.5 }
        : { temperature: 0.5 },
    }),
  });
  if (res.status === 429) throw new Error("Gemini rate limit exceeded. Try again shortly.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function fetchOEmbed(videoId: string) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );
    if (!r.ok) return null;
    const d = await r.json();
    return {
      title: d.title as string,
      author: d.author_name as string,
      thumbnail: d.thumbnail_url as string,
    };
  } catch {
    return null;
  }
}

export const extractVideo = createServerFn({ method: "POST" })
  .inputValidator((d: { url: string }) =>
    z.object({ url: z.string().min(1).max(500) }).parse(d),
  )
  .handler(async ({ data }) => {
    const id = extractVideoId(data.url);
    if (!id)
      return {
        ok: false as const,
        error: "Could not extract a valid YouTube video ID from this URL.",
      };
    const meta = await fetchOEmbed(id);
    return { ok: true as const, videoId: id, meta };
  });

export const fetchTranscript = createServerFn({ method: "POST" })
  .inputValidator((d: { videoId: string }) =>
    z.object({ videoId: z.string().regex(/^[0-9A-Za-z_-]{11}$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      const items = await YoutubeTranscript.fetchTranscript(data.videoId);
      if (!items?.length)
        return { ok: false as const, error: "Transcript unavailable for this video." };
      const text = items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
      return { ok: true as const, transcript: text.slice(0, 30000) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transcript unavailable for this video.";
      return {
        ok: false as const,
        error: msg.includes("disabled")
          ? "Captions are disabled on this video."
          : "Transcript unavailable for this video.",
      };
    }
  });

export const summarize = createServerFn({ method: "POST" })
  .inputValidator((d: { transcript: string }) =>
    z.object({ transcript: z.string().min(20).max(40000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const sys =
      "You are a precise educator. Summarize transcripts into structured JSON. Output only valid JSON.";
    const usr = `Summarize this YouTube transcript. Return JSON with shape:
{"summary": string (3-4 sentence overview), "keyPoints": string[] (5-8 punchy bullets), "topics": string[] (3-6 short topic tags)}

Transcript:
${data.transcript}`;
    const raw = await callGemini(sys, usr, true);
    try {
      const j = JSON.parse(raw);
      return {
        summary: String(j.summary ?? ""),
        keyPoints: Array.isArray(j.keyPoints) ? j.keyPoints.map(String) : [],
        topics: Array.isArray(j.topics) ? j.topics.map(String) : [],
      };
    } catch {
      throw new Error("AI returned malformed summary.");
    }
  });

const Difficulty = z.enum(["beginner", "intermediate", "expert"]);

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { transcript: string; difficulty: "beginner" | "intermediate" | "expert" }) =>
      z
        .object({ transcript: z.string().min(20).max(40000), difficulty: Difficulty })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const sys =
      "You generate rigorous multiple-choice quizzes from learning content. Output only valid JSON.";
    const usr = `Generate a ${data.difficulty}-level quiz with exactly 8 multiple-choice questions based on this transcript.
Return JSON: {"questions":[{"question":string,"options":[string,string,string,string],"answerIndex":number(0-3),"explanation":string}]}

Difficulty guide:
- beginner: recall and definitions
- intermediate: application and comparison
- expert: synthesis, edge cases, nuanced reasoning

Transcript:
${data.transcript}`;
    const raw = await callGemini(sys, usr, true);
    try {
      const j = JSON.parse(raw);
      const qs = (j.questions ?? [])
        .map((q: any) => ({
          question: String(q.question ?? ""),
          options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
          answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex ?? 0))),
          explanation: String(q.explanation ?? ""),
        }))
        .filter((q: any) => q.question && q.options.length === 4);
      if (!qs.length) throw new Error("empty");
      return { questions: qs };
    } catch {
      throw new Error("AI returned malformed quiz.");
    }
  });
