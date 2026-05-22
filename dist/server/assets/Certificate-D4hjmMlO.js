import { W as reactExports, M as jsxRuntimeExports } from "./server-CUL67baf.js";
import { L as Link } from "./router-BqV3_rnq.js";
import { B as Button } from "./button-8Tq0xP8B.js";
function Certificate(props) {
  reactExports.useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const pct = Math.round(props.score / props.total * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between print:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "font-mono text-xs uppercase underline", children: "← New certification" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => window.print(), className: "font-mono uppercase tracking-wide", children: "Download / Print" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        id: "cert",
        className: "relative mx-auto aspect-[1.414/1] w-full max-w-5xl border-2 border-foreground bg-background p-10 print:border-0",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-4 border border-foreground/30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-full flex-col justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-[0.3em]", children: "Certify · YouTube AI Certification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-right", children: [
                "ID · ",
                props.certId,
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                props.date
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground", children: "Certificate of completion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-5xl md:text-7xl tracking-tight", children: props.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-px w-32 bg-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto max-w-2xl text-base md:text-lg", children: [
                "has successfully completed the",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono uppercase", children: props.difficulty }),
                " certification for"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto max-w-3xl font-display text-2xl md:text-3xl", children: [
                '"',
                props.videoTitle,
                '"'
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 border-t border-foreground pt-6 font-mono text-xs uppercase", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Score" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-2xl", children: [
                  props.score,
                  "/",
                  props.total
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Result" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-2xl", children: [
                  pct,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Issued" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl", children: props.date })
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          body * { visibility: hidden; }
          #cert, #cert * { visibility: visible; }
          #cert { position: absolute; inset: 0; margin: 0; border: 0; }
        }
      ` })
  ] });
}
export {
  Certificate as C
};
