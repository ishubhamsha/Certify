import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  videoTitle: string;
  difficulty: string;
  score: number;
  total: number;
  date: string;
  certId: string;
};

export function Certificate(props: Props) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const pct = Math.round((props.score / props.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/" className="font-mono text-xs uppercase underline">
          ← New certification
        </Link>
        <Button onClick={() => window.print()} className="font-mono uppercase tracking-wide">
          Download / Print
        </Button>
      </div>

      <div
        id="cert"
        className="relative mx-auto aspect-[1.414/1] w-full max-w-5xl border-2 border-foreground bg-background p-10 print:border-0"
      >
        <div className="absolute inset-4 border border-foreground/30" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]">
              Certify · YouTube AI Certification
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-right">
              ID · {props.certId}
              <br />
              {props.date}
            </div>
          </div>

          <div className="space-y-6 text-center">
            <div className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Certificate of completion
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tight">{props.name}</h1>
            <div className="mx-auto h-px w-32 bg-foreground" />
            <p className="mx-auto max-w-2xl text-base md:text-lg">
              has successfully completed the{" "}
              <span className="font-mono uppercase">{props.difficulty}</span> certification for
            </p>
            <p className="mx-auto max-w-3xl font-display text-2xl md:text-3xl">
              "{props.videoTitle}"
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-foreground pt-6 font-mono text-xs uppercase">
            <div>
              <div className="text-muted-foreground">Score</div>
              <div className="mt-1 text-2xl">
                {props.score}/{props.total}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Result</div>
              <div className="mt-1 text-2xl">{pct}%</div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Issued</div>
              <div className="mt-1 text-2xl">{props.date}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cert, #cert * { visibility: visible; }
          #cert { position: absolute; inset: 0; margin: 0; border: 0; }
        }
      `}</style>
    </div>
  );
}
