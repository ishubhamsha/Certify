import { W as reactExports, M as jsxRuntimeExports } from "./server-CUL67baf.js";
import { R as Route, L as Link, m as toast } from "./router-BqV3_rnq.js";
import { u as useServerFn, S as Skeleton, g as getCertificateById } from "./certificates.functions-tZ-GzQT8.js";
import { B as Button } from "./button-8Tq0xP8B.js";
import { I as Input } from "./input-BL_SZnE6.js";
import { C as Certificate } from "./Certificate-D4hjmMlO.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-Dh7Rj3mP.js";
import "./index-DdGN5IVl.js";
import "./auth-middleware-dcQ7tGdu.js";
import "./types-BmuyU1df.js";
function VerifyPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const fetchFn = useServerFn(getCertificateById);
  const [id, setId] = reactExports.useState(search.id ?? "");
  const [loading, setLoading] = reactExports.useState(false);
  const [cert, setCert] = reactExports.useState(null);
  const [err, setErr] = reactExports.useState(null);
  async function lookup(certId) {
    setLoading(true);
    setErr(null);
    setCert(null);
    try {
      const {
        certificate
      } = await fetchFn({
        data: {
          id: certId
        }
      });
      setCert(certificate);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Not found";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }
  function onSubmit(e) {
    e.preventDefault();
    if (!id.trim()) return;
    nav({
      search: {
        id: id.trim()
      }
    });
    lookup(id.trim());
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen control-grid", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b-2 border-foreground bg-gradient-to-r from-[var(--color-grad-1)] via-[var(--color-grad-2)] to-[var(--color-grad-3)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 bg-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-bold tracking-tight text-foreground", children: "CERTIFY" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "font-mono text-[10px] uppercase tracking-[0.3em] underline", children: "Dashboard →" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl px-6 py-12 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.3em] text-accent", children: "Public verifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-5xl font-bold tracking-tight", children: "Verify a certificate." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-2xl text-muted-foreground", children: "Paste a certificate ID to confirm its authenticity. Anyone can verify — no account needed." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: id, onChange: (e) => setId(e.target.value), placeholder: "e.g. 3f2c1a9d-2e4b-4b6a-9e5d-...", className: "h-12 rounded-none border-2 border-foreground bg-background font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading || !id.trim(), className: "h-12 rounded-none font-mono text-sm uppercase tracking-wide", children: loading ? "Checking…" : "Verify →" })
      ] }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96 rounded-none" }),
      err && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-destructive bg-destructive/10 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.3em] text-destructive", children: "Invalid ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: err })
      ] }),
      cert && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-success bg-success/10 p-4 font-mono text-xs uppercase tracking-[0.3em] text-success-foreground", children: [
          "✓ Verified — issued",
          " ",
          new Date(cert.created_at).toLocaleDateString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Certificate, { name: cert.recipient_name, videoTitle: cert.video_title, difficulty: cert.difficulty, score: cert.score, total: cert.total_questions, date: new Date(cert.created_at).toLocaleDateString(), certId: cert.id })
      ] })
    ] })
  ] });
}
export {
  VerifyPage as component
};
