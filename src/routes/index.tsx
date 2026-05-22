import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  extractVideo,
  fetchTranscript,
  summarize,
  generateQuiz,
} from "@/lib/video.functions";
import { saveCertificate } from "@/lib/certificates.functions";
import { Certificate } from "@/components/Certificate";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: App,
});

type Difficulty = "beginner" | "intermediate" | "expert";
type Step = "input" | "video" | "quiz" | "result" | "certificate";
type Question = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

function App() {
  const extractFn = useServerFn(extractVideo);
  const transcriptFn = useServerFn(fetchTranscript);
  const summarizeFn = useServerFn(summarize);
  const quizFn = useServerFn(generateQuiz);
  const saveCertFn = useServerFn(saveCertificate);
  const { user, loading: authLoading, signOut } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [meta, setMeta] = useState<{ title: string; author: string; thumbnail?: string } | null>(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<{ summary: string; keyPoints: string[]; topics: string[] } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<"" | "extract" | "summary" | "quiz" | "save">("");
  const [certId, setCertId] = useState("");

  useEffect(() => {
    if (user && !name) {
      const meta = user.user_metadata as { display_name?: string } | undefined;
      setName(meta?.display_name ?? user.email?.split("@")[0] ?? "");
    }
  }, [user, name]);

  async function runSummary(t = transcript) {
    setLoading("summary");
    try {
      const s = await summarizeFn({ data: { transcript: t } });
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
      const q = await quizFn({ data: { transcript, difficulty } });
      setQuestions(q.questions);
      setAnswers(new Array(q.questions.length).fill(-1));
      setStep("quiz");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Quiz generation failed");
    } finally {
      setLoading("");
    }
  }


  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to start a certification.");
      nav({ to: "/auth" });
      return;
    }
    if (!url.trim()) {
      toast.error("Paste a YouTube URL first.");
      return;
    }
    setLoading("extract");
    try {
      const ex = await extractFn({ data: { url: url.trim() } });
      if (!ex.ok) {
        toast.error(ex.error);
        return;
      }
      setVideoId(ex.videoId);
      setMeta(ex.meta);
      const t = await transcriptFn({ data: { videoId: ex.videoId } });
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
          recipient_name: name.trim(),
        },
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

  return (
    <div className="min-h-screen control-grid">
      <header className="border-b border-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-6 w-6 bg-foreground" />
            <div className="font-display text-xl font-bold tracking-tight">CERTIFY</div>
            <div className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
              AI · YouTube · Certification
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
              {step === "input" ? "01 / Paste" : step === "video" ? "02 / Study" : step === "quiz" ? "03 / Test" : step === "result" ? "04 / Result" : "05 / Certificate"}
            </div>
            {authLoading ? null : user ? (
              <>
                <Link to="/dashboard" className="font-mono text-[10px] uppercase tracking-[0.3em] underline">
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  onClick={async () => { await signOut(); }}
                  className="h-9 rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-wide"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="h-9 rounded-none font-mono text-xs uppercase tracking-wide">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {step === "input" && (
          <InputStep url={url} setUrl={setUrl} loading={loading === "extract"} onSubmit={handleStart} />
        )}

        {step === "video" && (
          <VideoStep
            videoId={videoId}
            meta={meta}
            summary={summary}
            loadingSummary={loading === "summary"}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onGenerateQuiz={runQuiz}
            generatingQuiz={loading === "quiz"}
          />
        )}

        {step === "quiz" && (
          <QuizStep
            questions={questions}
            answers={answers}
            setAnswers={setAnswers}
            onSubmit={submitQuiz}
            difficulty={difficulty}
          />
        )}

        {step === "result" && (
          <ResultStep
            questions={questions}
            answers={answers}
            score={score}
            passed={passed}
            onRetry={() => {
              setAnswers(new Array(questions.length).fill(-1));
              setStep("quiz");
            }}
            onClaim={handleClaim}
            saving={loading === "save"}
            name={name}
            setName={setName}
          />
        )}

        {step === "certificate" && meta && (
          <Certificate
            name={name || "Student"}
            videoTitle={meta.title}
            difficulty={difficulty}
            score={score}
            total={questions.length}
            date={new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            certId={certId}
          />
        )}
      </main>

      <footer className="border-t border-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Built with Support .SS</span>
          <span>v1.0</span>
        </div>
      </footer>
    </div>
  );
}

function InputStep({
  url,
  setUrl,
  loading,
  onSubmit,
}: {
  url: string;
  setUrl: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="grid gap-12 md:grid-cols-12">
      <div className="md:col-span-7">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Step 01 — Paste video URL
        </div>
        <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
          Get certified
          <br />
          on <span className="bg-foreground px-2 text-background">any YouTube</span> video.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Paste a URL. We fetch the transcript, generate an AI summary, build an adaptive quiz, and issue a
          printable certificate when you pass.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-3">
          <label className="font-mono text-xs uppercase tracking-[0.2em]">YouTube URL</label>
          <div className="flex gap-2">
            <Input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="h-14 rounded-none border-2 border-foreground bg-background font-mono text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-14 rounded-none px-8 font-mono text-sm uppercase tracking-wide"
            >
              {loading ? "Fetching…" : "Analyze →"}
            </Button>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Supports youtube.com/watch · youtu.be · shorts
          </p>
        </form>
      </div>

      <div className="md:col-span-5">
        <div className="border-2 border-foreground p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            How it works
          </div>
          <ol className="mt-4 space-y-4">
            {[
              ["01", "Paste a YouTube URL"],
              ["02", "Auto-fetch transcript"],
              ["03", "AI summary + key points"],
              ["04", "Pick Beginner / Intermediate / Expert"],
              ["05", "Take 8-question quiz"],
              ["06", "Earn your certificate"],
            ].map(([n, label]) => (
              <li key={n} className="flex items-start gap-4 border-t border-foreground/20 pt-4 first:border-0 first:pt-0">
                <span className="font-mono text-xs text-muted-foreground">{n}</span>
                <span className="font-display text-lg">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function VideoStep({
  videoId,
  meta,
  summary,
  loadingSummary,
  difficulty,
  setDifficulty,
  onGenerateQuiz,
  generatingQuiz,
}: {
  videoId: string;
  meta: { title: string; author: string } | null;
  summary: { summary: string; keyPoints: string[]; topics: string[] } | null;
  loadingSummary: boolean;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onGenerateQuiz: () => void;
  generatingQuiz: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-4">
        <div className="aspect-video w-full border-2 border-foreground bg-foreground">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={meta?.title ?? "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {meta && (
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight">{meta.title}</h2>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {meta.author}
            </p>
          </div>
        )}

        <div className="border-2 border-foreground p-6">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-[0.3em]">Difficulty</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Choose one
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["beginner", "intermediate", "expert"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`border-2 border-foreground px-4 py-4 text-left transition-colors ${
                  difficulty === d ? "bg-foreground text-background" : "bg-background hover:bg-muted"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
                  {d === "beginner" ? "01" : d === "intermediate" ? "02" : "03"}
                </div>
                <div className="font-display text-lg capitalize">{d}</div>
              </button>
            ))}
          </div>
          <Button
            onClick={onGenerateQuiz}
            disabled={!summary || generatingQuiz}
            className="mt-6 h-12 w-full rounded-none font-mono text-sm uppercase tracking-wide"
          >
            {generatingQuiz ? "Generating quiz…" : "Generate quiz →"}
          </Button>
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-4">
        <div className="border-2 border-foreground p-6">
          <div className="font-mono text-xs uppercase tracking-[0.3em]">AI Summary</div>
          {loadingSummary && (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
          {summary && (
            <>
              <p className="mt-4 font-mono text-sm leading-relaxed">{summary.summary}</p>
              <div className="mt-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Key points
                </div>
                <ul className="mt-3 space-y-2">
                  {summary.keyPoints.map((k, i) => (
                    <li key={i} className="flex gap-3 border-t border-foreground/15 pt-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {summary.topics.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {summary.topics.map((t) => (
                    <span
                      key={t}
                      className="border border-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function QuizStep({
  questions,
  answers,
  setAnswers,
  onSubmit,
  difficulty,
}: {
  questions: Question[];
  answers: number[];
  setAnswers: (a: number[]) => void;
  onSubmit: () => void;
  difficulty: Difficulty;
}) {
  const answered = answers.filter((a) => a >= 0).length;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-end justify-between border-b border-foreground pb-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Quiz · {difficulty}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold">Answer all {questions.length} questions</h2>
        </div>
        <div className="font-mono text-sm">
          {answered}/{questions.length}
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="border-2 border-foreground p-6">
          <div className="flex gap-4">
            <span className="font-mono text-xs text-muted-foreground">
              Q{String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-xl font-semibold leading-snug">{q.question}</h3>
          </div>
          <div className="mt-5 grid gap-2">
            {q.options.map((opt, oi) => {
              const active = answers[i] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => {
                    const next = [...answers];
                    next[i] = oi;
                    setAnswers(next);
                  }}
                  className={`flex items-start gap-4 border-2 border-foreground px-4 py-3 text-left transition-colors ${
                    active ? "bg-foreground text-background" : "hover:bg-muted"
                  }`}
                >
                  <span className="font-mono text-xs">{String.fromCharCode(65 + oi)}</span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        onClick={onSubmit}
        className="h-14 w-full rounded-none font-mono text-sm uppercase tracking-wider"
      >
        Submit answers →
      </Button>
    </div>
  );
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
  setName,
}: {
  questions: Question[];
  answers: number[];
  score: number;
  passed: boolean;
  onRetry: () => void;
  onClaim: () => void;
  saving: boolean;
  name: string;
  setName: (v: string) => void;
}) {
  const pct = Math.round((score / questions.length) * 100);
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="border-2 border-foreground">
        <div className="grid grid-cols-3 divide-x-2 divide-foreground border-b-2 border-foreground">
          <Stat label="Score" value={`${score}/${questions.length}`} />
          <Stat label="Percentage" value={`${pct}%`} />
          <Stat label="Result" value={passed ? "PASS" : "FAIL"} accent={passed} />
        </div>
        <div className="p-6">
          {passed ? (
            <>
              <h2 className="font-display text-3xl font-bold">You passed.</h2>
              <p className="mt-2 text-muted-foreground">
                Enter your name as you want it printed on the certificate.
              </p>
              <div className="mt-6 flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  disabled={!name.trim() || saving}
                  onClick={onClaim}
                  className="h-12 rounded-none px-6 font-mono text-sm uppercase tracking-wide"
                >
                  {saving ? "Saving…" : "Claim certificate →"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl font-bold">Not quite — 70% required.</h2>
              <p className="mt-2 text-muted-foreground">Review the answers below and try again.</p>
              <Button
                onClick={onRetry}
                className="mt-6 h-12 rounded-none px-6 font-mono text-sm uppercase tracking-wide"
              >
                Retake quiz →
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold">Review</h3>
        {questions.map((q, i) => {
          const correct = answers[i] === q.answerIndex;
          return (
            <div key={i} className="border-2 border-foreground p-5">
              <div className="flex justify-between gap-4">
                <h4 className="font-display text-base font-semibold">
                  Q{i + 1}. {q.question}
                </h4>
                <span
                  className={`shrink-0 border-2 border-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    correct ? "bg-foreground text-background" : ""
                  }`}
                >
                  {correct ? "Correct" : "Wrong"}
                </span>
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <div>
                  <span className="font-mono text-xs text-muted-foreground">Your answer: </span>
                  {answers[i] >= 0 ? q.options[answers[i]] : "—"}
                </div>
                {!correct && (
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">Correct: </span>
                    {q.options[q.answerIndex]}
                  </div>
                )}
                {q.explanation && (
                  <p className="mt-2 border-t border-foreground/15 pt-2 font-mono text-xs text-muted-foreground">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-6 ${accent ? "bg-foreground text-background" : ""}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">{label}</div>
      <div className="mt-2 font-display text-4xl font-bold">{value}</div>
    </div>
  );
}
