import { W as reactExports, M as jsxRuntimeExports } from "./server-CUL67baf.js";
import { u as useAuth, o as useNavigate, L as Link, m as toast } from "./router-BqV3_rnq.js";
import { B as Button } from "./button-8Tq0xP8B.js";
import { I as Input } from "./input-BL_SZnE6.js";
import { s as supabase } from "./client-Dh7Rj3mP.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
function AuthPage() {
  const {
    user,
    loading
  } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && user) nav({
      to: "/dashboard"
    });
  }, [user, loading, nav]);
  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              display_name: name || email.split("@")[0]
            }
          }
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Welcome back.");
        nav({
          to: "/dashboard"
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen control-grid", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 bg-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-bold tracking-tight", children: "CERTIFY" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-md px-6 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground", children: mode === "signin" ? "Welcome back" : "Create account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-5xl font-bold tracking-tight", children: mode === "signin" ? "Sign in." : "Sign up." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-10 space-y-4", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono text-xs uppercase tracking-[0.2em]", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Jane Doe", className: "mt-2 h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono text-xs uppercase tracking-[0.2em]", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: "mt-2 h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-mono text-xs uppercase tracking-[0.2em]", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "mt-2 h-12 rounded-none border-2 border-foreground bg-background focus-visible:ring-0 focus-visible:ring-offset-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy, className: "h-12 w-full rounded-none font-mono text-sm uppercase tracking-wide", children: busy ? "Working…" : mode === "signin" ? "Sign in →" : "Create account →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode(mode === "signin" ? "signup" : "signin"), className: "mt-6 font-mono text-xs uppercase tracking-[0.2em] underline", children: mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in" })
    ] })
  ] });
}
export {
  AuthPage as component
};
