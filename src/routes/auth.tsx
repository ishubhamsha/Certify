import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        nav({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen control-grid">
      <header className="border-b border-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-6 w-6 bg-foreground" />
            <div className="font-display text-xl font-bold tracking-tight">CERTIFY</div>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 py-16">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </div>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">
          {mode === "signin" ? "Sign in." : "Sign up."}
        </h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.2em]">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-2 h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.2em]">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.2em]">Password</label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-none font-mono text-sm uppercase tracking-wide"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in →" : "Create account →"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 font-mono text-xs uppercase tracking-[0.2em] underline"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </main>
    </div>
  );
}
