"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PayModal from "@/components/cv/PayModal";
import CvEditor from "@/components/cv/CvEditor";
import { useCvPass } from "@/lib/cv/pass";
import { useWatermark } from "@/lib/cv/watermark";
import { buildCvHtml, printPdf, norm, EMPTY, type CV, type WmConfig } from "@/lib/cv/engine";
import { CV_PRICE } from "@/lib/mpesa-public";

const DRAFT = "cv-draft:v1"; // the customer's CV lives only in their own browser

function LivePreview({ cv, watermark, onPages }: { cv: CV; watermark: boolean | WmConfig; onPages: (n: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.6);
  const [pages, setPages] = useState(1);
  const html = useMemo(() => {
    try { return buildCvHtml(cv, true, watermark); }
    catch { return "<p style='font-family:sans-serif;padding:24px'>Preview unavailable.</p>"; }
  }, [cv, watermark]);
  const [shown, setShown] = useState(html);
  useEffect(() => { const t = setTimeout(() => setShown(html), 400); return () => clearTimeout(t); }, [html]); // don't reload on every keystroke

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && typeof e.data?.cvPages === "number") {
        setPages(e.data.cvPages); onPages(e.data.cvPages);
      }
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [onPages]);

  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1.2, e.contentRect.width / 794)));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="rounded-2xl overflow-hidden border border-sky-100 shadow-card"
      style={{ height: (20 + pages * 1129) * scale, background: "#94A3B8" }}>
      <iframe ref={frame} title="CV preview" srcDoc={shown} sandbox="allow-scripts"
        style={{ width: 794, height: 20 + pages * 1129, border: 0, display: "block", transform: `scale(${scale})`, transformOrigin: "top left" }} />
    </div>
  );
}

export default function CreateCvPage() {
  const pass = useCvPass();
  const wm = useWatermark();
  const [cv, setCv] = useState<CV>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    try { const raw = localStorage.getItem(DRAFT); if (raw) setCv(norm(JSON.parse(raw))); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) try { localStorage.setItem(DRAFT, JSON.stringify(cv)); } catch {}
  }, [cv, loaded]);

  const download = () => (pass.active ? printPdf(cv) : setPaying(true));

  return (<>
    <Navbar />
    <main className="pt-28 pb-20 min-h-screen bg-section-alt">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="mb-6">
          <h1 className="section-title">Create your <span className="text-gradient">CV</span></h1>
          <p className="text-sky-900/60 text-sm mt-1">Build it free. Pay KES {CV_PRICE} with M-Pesa to remove the watermark and download the PDF.</p>
        </div>

        {pass.active && pass.expiresAt && (
          <p className="flex items-center gap-2 text-emerald-700 text-sm mb-4">
            <ShieldCheck size={16} /> Unlocked until {new Date(pass.expiresAt).toLocaleString()}. Edit and download as often as you like.
          </p>
        )}

        {loaded && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <CvEditor
              value={cv}
              onChange={setCv}
              onDownload={download}
              watermark={pass.active ? false : wm}
              showPreview={false}
              pages={pages}
              downloadLabel={pass.active ? "Download PDF" : `Unlock and download · KES ${CV_PRICE}`}
            />
            <div className="xl:sticky xl:top-28">
              <LivePreview cv={cv} watermark={pass.active ? false : wm} onPages={setPages} />
            </div>
          </div>
        )}
      </div>
    </main>
    <Footer />
    {paying && (
      <PayModal price={CV_PRICE}
        onClose={() => setPaying(false)}
        onPaid={(token, exp) => { pass.save(token, exp); setPaying(false); }} />
    )}
  </>);
}