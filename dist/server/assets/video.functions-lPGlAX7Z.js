import { c as createServerRpc } from "./createServerRpc-eurll9PQ.js";
import { j as createServerFn } from "./server-CUL67baf.js";
import { o as objectType, s as stringType, e as enumType } from "./types-BmuyU1df.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)";
const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
const INNERTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const INNERTUBE_CLIENT_VERSION = "20.10.38";
const INNERTUBE_CONTEXT = {
  client: {
    clientName: "ANDROID",
    clientVersion: INNERTUBE_CLIENT_VERSION
  }
};
const INNERTUBE_USER_AGENT = `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`;
class YoutubeTranscriptError extends Error {
  constructor(message) {
    super(`[YoutubeTranscript] 🚨 ${message}`);
  }
}
class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
  constructor() {
    super("YouTube is receiving too many requests from this IP and now requires solving a captcha to continue");
  }
}
class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`The video is no longer available (${videoId})`);
  }
}
class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`Transcript is disabled on this video (${videoId})`);
  }
}
class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`No transcripts are available for this video (${videoId})`);
  }
}
class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
  constructor(lang, availableLangs, videoId) {
    super(`No transcripts are available in ${lang} this video (${videoId}). Available languages: ${availableLangs.join(", ")}`);
  }
}
class YoutubeTranscript {
  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   * @param config Get transcript in a specific language ISO
   */
  static async fetchTranscript(videoId, config) {
    const identifier = this.retrieveVideoId(videoId);
    const innerTubeResult = await this.fetchViaInnerTube(identifier, config);
    if (innerTubeResult) {
      return innerTubeResult;
    }
    return this.fetchViaWebPage(identifier, videoId, config);
  }
  /**
   * Fetch transcript via the InnerTube API (Android client context)
   */
  static async fetchViaInnerTube(identifier, config) {
    try {
      const fetchFn = config?.fetch ?? fetch;
      const resp = await fetchFn(INNERTUBE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": INNERTUBE_USER_AGENT
        },
        body: JSON.stringify({
          context: INNERTUBE_CONTEXT,
          videoId: identifier
        })
      });
      if (!resp.ok)
        return void 0;
      const data = await resp.json();
      const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
        return void 0;
      }
      return this.fetchTranscriptFromTracks(captionTracks, identifier, config);
    } catch {
      return void 0;
    }
  }
  /**
   * Fetch transcript via web page HTML scraping (fallback)
   */
  static async fetchViaWebPage(identifier, originalVideoId, config) {
    const fetchFn = config?.fetch ?? fetch;
    const videoPageResponse = await fetchFn(`https://www.youtube.com/watch?v=${identifier}`, {
      headers: {
        ...config?.lang && { "Accept-Language": config.lang },
        "User-Agent": USER_AGENT
      }
    });
    const videoPageBody = await videoPageResponse.text();
    if (videoPageBody.includes('class="g-recaptcha"')) {
      throw new YoutubeTranscriptTooManyRequestError();
    }
    if (!videoPageBody.includes('"playabilityStatus":')) {
      throw new YoutubeTranscriptVideoUnavailableError(originalVideoId);
    }
    const playerResponse = this.parseInlineJson(videoPageBody, "ytInitialPlayerResponse");
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      throw new YoutubeTranscriptDisabledError(originalVideoId);
    }
    return this.fetchTranscriptFromTracks(captionTracks, originalVideoId, config);
  }
  /**
   * Extract a JSON object assigned to a global variable in inline script tags
   */
  static parseInlineJson(html, globalName) {
    const startToken = `var ${globalName} = `;
    const startIndex = html.indexOf(startToken);
    if (startIndex === -1)
      return null;
    const jsonStart = startIndex + startToken.length;
    let depth = 0;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{")
        depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(jsonStart, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
    return null;
  }
  /**
   * Given caption tracks, select the right one, fetch and parse the transcript XML
   */
  static async fetchTranscriptFromTracks(captionTracks, videoId, config) {
    if (config?.lang && !captionTracks.some((track2) => track2.languageCode === config?.lang)) {
      throw new YoutubeTranscriptNotAvailableLanguageError(config?.lang, captionTracks.map((track2) => track2.languageCode), videoId);
    }
    const track = config?.lang ? captionTracks.find((track2) => track2.languageCode === config?.lang) : captionTracks[0];
    const transcriptURL = track.baseUrl;
    try {
      const captionUrl = new URL(transcriptURL);
      if (!captionUrl.hostname.endsWith(".youtube.com")) {
        throw new YoutubeTranscriptNotAvailableError(videoId);
      }
    } catch (e) {
      if (e instanceof YoutubeTranscriptError)
        throw e;
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }
    const fetchFn = config?.fetch ?? fetch;
    const transcriptResponse = await fetchFn(transcriptURL, {
      headers: {
        ...config?.lang && { "Accept-Language": config.lang },
        "User-Agent": USER_AGENT
      }
    });
    if (!transcriptResponse.ok) {
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }
    const transcriptBody = await transcriptResponse.text();
    const lang = config?.lang ?? captionTracks[0].languageCode;
    return this.parseTranscriptXml(transcriptBody, lang);
  }
  /**
   * Parse transcript XML, supporting both srv3 format (<p t="ms">) and
   * classic format (<text start="s" dur="s">)
   */
  static parseTranscriptXml(xml, lang) {
    const results = [];
    const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = pRegex.exec(xml)) !== null) {
      const startMs = parseInt(match[1], 10);
      const durMs = parseInt(match[2], 10);
      const inner = match[3];
      let text = "";
      const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
      let sMatch;
      while ((sMatch = sRegex.exec(inner)) !== null) {
        text += sMatch[1];
      }
      if (!text) {
        text = inner.replace(/<[^>]+>/g, "");
      }
      text = this.decodeEntities(text).trim();
      if (text) {
        results.push({
          text,
          duration: durMs,
          offset: startMs,
          lang
        });
      }
    }
    if (results.length > 0)
      return results;
    const classicResults = [...xml.matchAll(RE_XML_TRANSCRIPT)];
    return classicResults.map((result) => ({
      text: this.decodeEntities(result[3]),
      duration: parseFloat(result[2]),
      offset: parseFloat(result[1]),
      lang
    }));
  }
  /**
   * Decode common HTML entities in transcript text
   */
  static decodeEntities(text) {
    return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
  }
  /**
   * Retrieve video id from url or string
   * @param videoId video url or video id
   */
  static retrieveVideoId(videoId) {
    if (videoId.length === 11) {
      return videoId;
    }
    const matchId = videoId.match(RE_YOUTUBE);
    if (matchId && matchId.length) {
      return matchId[1];
    }
    throw new YoutubeTranscriptError("Impossible to retrieve Youtube video ID.");
  }
}
function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([0-9A-Za-z_-]{11})/,
    /^([0-9A-Za-z_-]{11})$/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
async function callGemini(system, user, json = false) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: system
        }]
      },
      contents: [{
        role: "user",
        parts: [{
          text: user
        }]
      }],
      generationConfig: json ? {
        responseMimeType: "application/json",
        temperature: 0.5
      } : {
        temperature: 0.5
      }
    })
  });
  if (res.status === 429) throw new Error("Gemini rate limit exceeded. Try again shortly.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
async function fetchOEmbed(videoId) {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!r.ok) return null;
    const d = await r.json();
    return {
      title: d.title,
      author: d.author_name,
      thumbnail: d.thumbnail_url
    };
  } catch {
    return null;
  }
}
const extractVideo_createServerFn_handler = createServerRpc({
  id: "1dbb8a15eb461340a50478e5fafb8204ae1622eb232787fc7045555478a0b1b9",
  name: "extractVideo",
  filename: "src/lib/video.functions.ts"
}, (opts) => extractVideo.__executeServer(opts));
const extractVideo = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  url: stringType().min(1).max(500)
}).parse(d)).handler(extractVideo_createServerFn_handler, async ({
  data
}) => {
  const id = extractVideoId(data.url);
  if (!id) return {
    ok: false,
    error: "Could not extract a valid YouTube video ID from this URL."
  };
  const meta = await fetchOEmbed(id);
  return {
    ok: true,
    videoId: id,
    meta
  };
});
const fetchTranscript_createServerFn_handler = createServerRpc({
  id: "01961aba1d398c24a2c523481ac34c98660a23f4ca67bdb4555391ae73a906f5",
  name: "fetchTranscript",
  filename: "src/lib/video.functions.ts"
}, (opts) => fetchTranscript.__executeServer(opts));
const fetchTranscript = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  videoId: stringType().regex(/^[0-9A-Za-z_-]{11}$/)
}).parse(d)).handler(fetchTranscript_createServerFn_handler, async ({
  data
}) => {
  try {
    const items = await YoutubeTranscript.fetchTranscript(data.videoId);
    if (!items?.length) return {
      ok: false,
      error: "Transcript unavailable for this video."
    };
    const text = items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
    return {
      ok: true,
      transcript: text.slice(0, 3e4)
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transcript unavailable for this video.";
    return {
      ok: false,
      error: msg.includes("disabled") ? "Captions are disabled on this video." : "Transcript unavailable for this video."
    };
  }
});
const summarize_createServerFn_handler = createServerRpc({
  id: "53e0b11d2defc0209748229798fbb29e45f0f13edaa1ce0289068e677af1db92",
  name: "summarize",
  filename: "src/lib/video.functions.ts"
}, (opts) => summarize.__executeServer(opts));
const summarize = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  transcript: stringType().min(20).max(4e4)
}).parse(d)).handler(summarize_createServerFn_handler, async ({
  data
}) => {
  const sys = "You are a precise educator. Summarize transcripts into structured JSON. Output only valid JSON.";
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
      topics: Array.isArray(j.topics) ? j.topics.map(String) : []
    };
  } catch {
    throw new Error("AI returned malformed summary.");
  }
});
const Difficulty = enumType(["beginner", "intermediate", "expert"]);
const generateQuiz_createServerFn_handler = createServerRpc({
  id: "d666e1e881b85de21bc1921f96e7cfc54aa209b84a96c4c8a9fda605298888a8",
  name: "generateQuiz",
  filename: "src/lib/video.functions.ts"
}, (opts) => generateQuiz.__executeServer(opts));
const generateQuiz = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  transcript: stringType().min(20).max(4e4),
  difficulty: Difficulty
}).parse(d)).handler(generateQuiz_createServerFn_handler, async ({
  data
}) => {
  const sys = "You generate rigorous multiple-choice quizzes from learning content. Output only valid JSON.";
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
    const qs = (j.questions ?? []).map((q) => ({
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
      answerIndex: Math.max(0, Math.min(3, Number(q.answerIndex ?? 0))),
      explanation: String(q.explanation ?? "")
    })).filter((q) => q.question && q.options.length === 4);
    if (!qs.length) throw new Error("empty");
    return {
      questions: qs
    };
  } catch {
    throw new Error("AI returned malformed quiz.");
  }
});
export {
  extractVideo_createServerFn_handler,
  fetchTranscript_createServerFn_handler,
  generateQuiz_createServerFn_handler,
  summarize_createServerFn_handler
};
