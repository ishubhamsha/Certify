import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCertificateById } from "@/lib/certificates.functions";
import { Certificate } from "@/components/Certificate";

export const Route = createFileRoute("/verify")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : "",
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const fetchFn = useServerFn(getCertificateById);
  const [id, setId] = useState(search.id ?? "");
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function lookup(certId: string) {
    setLoading(true);
    setErr(null);
    setCert(null);
    try {
      const { certificate } = await fetchFn({ data: { id: certId } });
      setCert(certificate);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Not found";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim()) return;
    nav({ search: { id: id.trim() } });
    lookup(id.trim());
  }

  return (
    <div className="min-h-screen control-grid">
      <header className="border-b-2 border-foreground bg-gradient-to-r from-[var(--color-grad-1)] via-[var(--color-grad-2)] to-[var(--color-grad-3)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-6 w-6 bg-foreground" />
            <div className="font-display text-xl font-bold tracking-tight text-foreground">
              CERTIFY
            </div>
          </Link>
          <Link
            to="/dashboard"
            className="font-mono text-[10px] uppercase tracking-[0.3em] underline"
          >
            Dashboard →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Public verifier
          </div>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">
            Verify a certificate.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Paste a certificate ID to confirm its authenticity. Anyone can verify
            — no account needed.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex gap-3">
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. 3f2c1a9d-2e4b-4b6a-9e5d-..."
            className="h-12 rounded-none border-2 border-foreground bg-background font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            disabled={loading || !id.trim()}
            className="h-12 rounded-none font-mono text-sm uppercase tracking-wide"
          >
            {loading ? "Checking…" : "Verify →"}
          </Button>
        </form>

        {loading && <Skeleton className="h-96 rounded-none" />}

        {err && !loading && (
          <div className="border-2 border-destructive bg-destructive/10 p-6">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-destructive">
              Invalid ID
            </div>
            <p className="mt-2">{err}</p>
          </div>
        )}

        {cert && !loading && (
          <div className="space-y-4">
            <div className="border-2 border-success bg-success/10 p-4 font-mono text-xs uppercase tracking-[0.3em] text-success-foreground">
              ✓ Verified — issued{" "}
              {new Date(cert.created_at).toLocaleDateString()}
            </div>
            <Certificate
              name={cert.recipient_name}
              videoTitle={cert.video_title}
              difficulty={cert.difficulty}
              score={cert.score}
              total={cert.total_questions}
              date={new Date(cert.created_at).toLocaleDateString()}
              certId={cert.id}
            />
          </div>
        )}
      </main>
    </div>
  );
}
