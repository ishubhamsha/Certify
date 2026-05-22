import { j as createServerFn, W as reactExports, M as jsxRuntimeExports } from "./server-CUL67baf.js";
import { u as useAuth, o as useNavigate, L as Link, m as toast } from "./router-BqV3_rnq.js";
import { c as createSsrRpc, u as useServerFn, s as saveCertificate, S as Skeleton } from "./certificates.functions-tZ-GzQT8.js";
import { B as Button } from "./button-8Tq0xP8B.js";
import { I as Input } from "./input-BL_SZnE6.js";
import { o as objectType, s as stringType, e as enumType } from "./types-BmuyU1df.js";
import { C as Certificate } from "./Certificate-D4hjmMlO.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-Dh7Rj3mP.js";
import "./index-DdGN5IVl.js";
import "./auth-middleware-dcQ7tGdu.js";
const extractVideo = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  url: stringType().min(1).max(500)
}).parse(d)).handler(createSsrRpc("1dbb8a15eb461340a50478e5fafb8204ae1622eb232787fc7045555478a0b1b9"));
const fetchTranscript = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  videoId: stringType().regex(/^[0-9A-Za-z_-]{11}$/)
}).parse(d)).handler(createSsrRpc("01961aba1d398c24a2c523481ac34c98660a23f4ca67bdb4555391ae73a906f5"));
const summarize = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  transcript: stringType().min(20).max(4e4)
}).parse(d)).handler(createSsrRpc("53e0b11d2defc0209748229798fbb29e45f0f13edaa1ce0289068e677af1db92"));
const Difficulty = enumType(["beginner", "intermediate", "expert"]);
const generateQuiz = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  transcript: stringType().min(20).max(4e4),
  difficulty: Difficulty
}).parse(d)).handler(createSsrRpc("d666e1e881b85de21bc1921f96e7cfc54aa209b84a96c4c8a9fda605298888a8"));
function App() {
  const extractFn = useServerFn(extractVideo);
  const transcriptFn = useServerFn(fetchTranscript);
  const summarizeFn = useServerFn(summarize);
  const quizFn = useServerFn(generateQuiz);
  const saveCertFn = useServerFn(saveCertificate);
  const {
    user,
    loading: authLoading,
    signOut
  } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = reactExports.useState("input");
  const [url, setUrl] = reactExports.useState("");
  const [videoId, setVideoId] = reactExports.useState("");
  const [meta, setMeta] = reactExports.useState(null);
  const [transcript, setTranscript] = reactExports.useState("");
  const [summary, setSummary] = reactExports.useState(null);
  const [difficulty, setDifficulty] = reactExports.useState("intermediate");
  const [questions, setQuestions] = reactExports.useState([]);
  const [answers, setAnswers] = reactExports.useState([]);
  const [name, setName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState("");
  const [certId, setCertId] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (user && !name) {
      const meta2 = user.user_metadata;
      setName(meta2?.display_name ?? user.email?.split("@")[0] ?? "");
    }
  }, [user, name]);
  async function runSummary(t = transcript) {
    setLoading("summary");
    try {
      const s = await summarizeFn({
        data: {
          transcript: t
        }
      });
      setSummary(s);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Summary failed");
    } finally {
      setLoading("");
    }
  }
  async function runQuiz() {
    setLoading("quiz");
    try {
      const q = await quizFn({
        data: {
          transcript,
          difficulty
        }
      });
      setQuestions(q.questions);
      setAnswers(new Array(q.questions.length).fill(-1));
      setStep("quiz");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Quiz generation failed");
    } finally {
      setLoading("");
    }
  }
  async function handleStart(e) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to start a certification.");
      nav({
        to: "/auth"
      });
      return;
    }
    if (!url.trim()) {
      toast.error("Paste a YouTube URL first.");
      return;
    }
    setLoading("extract");
    try {
      const ex = await extractFn({
        data: {
          url: url.trim()
        }
      });
      if (!ex.ok) {
        toast.error(ex.error);
        return;
      }
      setVideoId(ex.videoId);
      setMeta(ex.meta);
      const t = await transcriptFn({
        data: {
          videoId: ex.videoId
        }
      });
      if (!t.ok) {
        toast.error(t.error);
        return;
      }
      setTranscript(t.transcript);
      setStep("video");
      void runSummary(t.transcript);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading("");
    }
  }
  async function handleClaim() {
    if (!name.trim()) {
      toast.error("Enter your name.");
      return;
    }
    setLoading("save");
    try {
      const result = await saveCertFn({
        data: {
          video_id: videoId,
          video_title: meta?.title ?? "Untitled",
          channel: meta?.author ?? null,
          thumbnail_url: meta?.thumbnail ?? null,
          difficulty,
          score,
          total_questions: questions.length,
          topics: summary?.topics ?? [],
          recipient_name: name.trim()
        }
      });
      setCertId(result.id);
      toast.success("Certificate saved to your dashboard.");
      setStep("certificate");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save certificate");
    } finally {
      setLoading("");
    }
  }
  function submitQuiz() {
    if (answers.some((a) => a < 0)) {
      toast.error("Answer every question before submitting.");
      return;
    }
    setStep("result");
  }
  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0), 0);
  const passed = questions.length > 0 && score / questions.length >= 0.7;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen control-grid", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 bg-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-bold tracking-tight", children: "CERTIFY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:block", children: "AI · YouTube · Certification" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block", children: step === "input" ? "01 / Paste" : step === "video" ? "02 / Study" : step === "quiz" ? "03 / Test" : step === "result" ? "04 / Result" : "05 / Certificate" }),
        authLoading ? null : user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "font-mono text-[10px] uppercase tracking-[0.3em] underline", children: "Dashboard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: async () => {
            await signOut();
          }, className: "h-9 rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-wide", children: "Sign out" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-9 rounded-none font-mono text-xs uppercase tracking-wide", children: "Sign in" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-6 py-10", children: [
      step === "input" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputStep, { url, setUrl, loading: loading === "extract", onSubmit: handleStart }),
      step === "video" && /* @__PURE__ */ jsxRuntimeExports.jsx(VideoStep, { videoId, meta, summary, loadingSummary: loading === "summary", difficulty, setDifficulty, onGenerateQuiz: runQuiz, generatingQuiz: loading === "quiz" }),
      step === "quiz" && /* @__PURE__ */ jsxRuntimeExports.jsx(QuizStep, { questions, answers, setAnswers, onSubmit: submitQuiz, difficulty }),
      step === "result" && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultStep, { questions, answers, score, passed, onRetry: () => {
        setAnswers(new Array(questions.length).fill(-1));
        setStep("quiz");
      }, onClaim: handleClaim, saving: loading === "save", name, setName }),
      step === "certificate" && meta && /* @__PURE__ */ jsxRuntimeExports.jsx(Certificate, { name: name || "Student", videoTitle: meta.title, difficulty, score, total: questions.length, date: (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, {
        year: "numeric",
        month: "short",
        day: "numeric"
      }), certId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Built with TanStack · Lovable AI" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "v1.0" })
    ] }) })
  ] });
}
function InputStep({
  url,
  setUrl,
  loading,
  onSubmit
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-12 md:grid-cols-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground", children: "Step 01 — Paste video URL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl", children: [
        "Get certified",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "on ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-foreground px-2 text-background", children: "any YouTube" }),
        " video."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xl text-lg text-muted-foreground", children: "Paste a URL. We fetch the transcript, generate an AI summary, build an adaptive quiz, and issue a printable certificate when you pass." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-10 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono text-xs uppercase tracking-[0.2em]", children: "YouTube URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://www.youtube.com/watch?v=…", className: "h-14 rounded-none border-2 border-foreground bg-background font-mono text-base focus-visible:ring-0 focus-visible:ring-offset-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "h-14 rounded-none px-8 font-mono text-sm uppercase tracking-wide", children: loading ? "Fetching…" : "Start →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: "Supports youtube.com/watch · youtu.be · shorts" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-foreground p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground", children: "How it works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-4 space-y-4", children: [["01", "Paste a YouTube URL"], ["02", "Auto-fetch transcript"], ["03", "AI summary + key points"], ["04", "Pick Beginner / Intermediate / Expert"], ["05", "Take 8-question quiz"], ["06", "Earn your certificate"]].map(([n, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-4 border-t border-foreground/20 pt-4 first:border-0 first:pt-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: n }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg", children: label })
      ] }, n)) })
    ] }) })
  ] });
}
function VideoStep({
  videoId,
  meta,
  summary,
  loadingSummary,
  difficulty,
  setDifficulty,
  onGenerateQuiz,
  generatingQuiz
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video w-full border-2 border-foreground bg-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { className: "h-full w-full", src: `https://www.youtube.com/embed/${videoId}`, title: meta?.title ?? "Video", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }) }),
      meta && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold leading-tight", children: meta.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground", children: meta.author })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-foreground p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.3em]", children: "Difficulty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground", children: "Choose one" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-3 gap-2", children: ["beginner", "intermediate", "expert"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDifficulty(d), className: `border-2 border-foreground px-4 py-4 text-left transition-colors ${difficulty === d ? "bg-foreground text-background" : "bg-background hover:bg-muted"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.2em] opacity-70", children: d === "beginner" ? "01" : d === "intermediate" ? "02" : "03" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg capitalize", children: d })
        ] }, d)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onGenerateQuiz, disabled: !summary || generatingQuiz, className: "mt-6 h-12 w-full rounded-none font-mono text-sm uppercase tracking-wide", children: generatingQuiz ? "Generating quiz…" : "Generate quiz →" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "lg:col-span-4 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-foreground p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.3em]", children: "AI Summary" }),
      loadingSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4/6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" })
      ] }),
      summary && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-mono text-sm leading-relaxed", children: summary.summary }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground", children: "Key points" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: summary.keyPoints.map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3 border-t border-foreground/15 pt-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: String(i + 1).padStart(2, "0") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: k })
          ] }, i)) })
        ] }),
        summary.topics.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: summary.topics.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border border-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-wider", children: t }, t)) })
      ] })
    ] }) })
  ] });
}
function QuizStep({
  questions,
  answers,
  setAnswers,
  onSubmit,
  difficulty
}) {
  const answered = answers.filter((a) => a >= 0).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between border-b border-foreground pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground", children: [
          "Quiz · ",
          difficulty
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-2 font-display text-3xl font-bold", children: [
          "Answer all ",
          questions.length,
          " questions"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm", children: [
        answered,
        "/",
        questions.length
      ] })
    ] }),
    questions.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-foreground p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
          "Q",
          String(i + 1).padStart(2, "0")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-semibold leading-snug", children: q.question })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid gap-2", children: q.options.map((opt, oi) => {
        const active = answers[i] === oi;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          const next = [...answers];
          next[i] = oi;
          setAnswers(next);
        }, className: `flex items-start gap-4 border-2 border-foreground px-4 py-3 text-left transition-colors ${active ? "bg-foreground text-background" : "hover:bg-muted"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: String.fromCharCode(65 + oi) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: opt })
        ] }, oi);
      }) })
    ] }, i)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSubmit, className: "h-14 w-full rounded-none font-mono text-sm uppercase tracking-wider", children: "Submit answers →" })
  ] });
}
function ResultStep({
  questions,
  answers,
  score,
  passed,
  onRetry,
  onClaim,
  saving,
  name,
  setName
}) {
  const pct = Math.round(score / questions.length * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 divide-x-2 divide-foreground border-b-2 border-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Score", value: `${score}/${questions.length}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Percentage", value: `${pct}%` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Result", value: passed ? "PASS" : "FAIL", accent: passed })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: passed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold", children: "You passed." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Enter your name as you want it printed on the certificate." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Your full name", className: "h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !name.trim() || saving, onClick: onClaim, className: "h-12 rounded-none px-6 font-mono text-sm uppercase tracking-wide", children: saving ? "Saving…" : "Claim certificate →" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold", children: "Not quite — 70% required." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Review the answers below and try again." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onRetry, className: "mt-6 h-12 rounded-none px-6 font-mono text-sm uppercase tracking-wide", children: "Retake quiz →" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-semibold", children: "Review" }),
      questions.map((q, i) => {
        const correct = answers[i] === q.answerIndex;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-foreground p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-display text-base font-semibold", children: [
              "Q",
              i + 1,
              ". ",
              q.question
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 border-2 border-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${correct ? "bg-foreground text-background" : ""}`, children: correct ? "Correct" : "Wrong" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "Your answer: " }),
              answers[i] >= 0 ? q.options[answers[i]] : "—"
            ] }),
            !correct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "Correct: " }),
              q.options[q.answerIndex]
            ] }),
            q.explanation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 border-t border-foreground/15 pt-2 font-mono text-xs text-muted-foreground", children: q.explanation })
          ] })
        ] }, i);
      })
    ] })
  ] });
}
function Stat({
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-6 ${accent ? "bg-foreground text-background" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.3em] opacity-70", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-display text-4xl font-bold", children: value })
  ] });
}
export {
  App as component
};
