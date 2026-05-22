import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listCertificates, deleteCertificate } from "@/lib/certificates.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const listFn = useServerFn(listCertificates);
  const delFn = useServerFn(deleteCertificate);
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  const { data, isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => listFn(),
    enabled: !!user,
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Certificate removed.");
      qc.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const certs = data?.certificates ?? [];
  const totalScore = certs.reduce((a, c: any) => a + c.score, 0);
  const totalQuestions = certs.reduce((a, c: any) => a + c.total_questions, 0);
  const avgPct = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen control-grid">
      <header className="border-b border-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-6 w-6 bg-foreground" />
            <div className="font-display text-xl font-bold tracking-tight">CERTIFY</div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/verify"
              className="font-mono text-[10px] uppercase tracking-[0.3em] underline"
            >
              Verify cert
            </Link>
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-[0.3em] underline"
            >
              + New certification
            </Link>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
              {user?.email}
            </span>

            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                nav({ to: "/auth" });
              }}
              className="h-9 rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-wide"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
              Dashboard
            </div>
            <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">
              <span className="gradient-text">Your certifications</span>
            </h1>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const id = String(fd.get("id") || "").trim();
              if (id) nav({ to: "/verify", search: { id } });
            }}
            className="flex w-full max-w-md gap-2"
          >
            <input
              name="id"
              placeholder="Search by certificate ID…"
              className="h-10 flex-1 border-2 border-foreground bg-background px-3 font-mono text-xs outline-none focus:border-primary"
            />
            <Button
              type="submit"
              className="h-10 rounded-none font-mono text-[10px] uppercase tracking-wide"
            >
              Verify →
            </Button>
          </form>
        </div>


        <div className="grid grid-cols-3 divide-x-2 divide-foreground border-2 border-foreground">
          <Stat label="Courses" value={String(certs.length)} />
          <Stat label="Avg score" value={`${avgPct}%`} />
          <Stat
            label="Passed"
            value={String(
              certs.filter((c: any) => c.score / c.total_questions >= 0.7).length,
            )}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-none" />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div className="border-2 border-dashed border-foreground p-12 text-center">
            <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
              No certificates yet
            </p>
            <Link to="/">
              <Button className="mt-6 h-12 rounded-none font-mono text-sm uppercase tracking-wide">
                Earn your first →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certs.map((c: any) => {
              const pct = Math.round((c.score / c.total_questions) * 100);
              const passed = pct >= 70;
              return (
                <div
                  key={c.id}
                  className="border-2 border-foreground p-5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start gap-4">
                    {c.thumbnail_url ? (
                      <img
                        src={c.thumbnail_url}
                        alt=""
                        className="h-20 w-32 shrink-0 border border-foreground object-cover"
                      />
                    ) : (
                      <div className="h-20 w-32 shrink-0 border border-foreground bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug">
                        {c.video_title}
                      </h3>
                      {c.channel && (
                        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {c.channel}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-foreground/20 pt-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                    <div>
                      <div className="text-muted-foreground">Score</div>
                      <div className="mt-1 text-sm">
                        {c.score}/{c.total_questions}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Result</div>
                      <div className={`mt-1 text-sm ${passed ? "" : "text-destructive"}`}>
                        {pct}% {passed ? "PASS" : "FAIL"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Level</div>
                      <div className="mt-1 text-sm capitalize">{c.difficulty}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        to="/verify"
                        search={{ id: c.id }}
                        className="underline hover:text-primary"
                      >
                        View →
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("Delete this certificate?")) del.mutate(c.id);
                        }}
                        className="underline hover:text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-4xl font-bold">{value}</div>
    </div>
  );
}
