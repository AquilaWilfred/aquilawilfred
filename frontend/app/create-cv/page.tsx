"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Lock, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PayModal from "@/components/cv/PayModal";
import CvEditor from "@/components/cv/CvEditor"; // ← your existing editor (see note below)
import { useCvPass } from "@/lib/cv/pass";
import { buildCvHtml, printPdf, withTemplate, norm, EMPTY, TEMPLATES, type CV } from "@/lib/cv/engine";
import { CV_PRICE } from "@/lib/mpesa-public";

const DRAFT = "cv-draft:v1"; // the customer's CV lives only in their own browser

function LivePreview({ cv, watermark }: { cv: CV; watermark: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.6);
  const [pages, setPages] = useState(1);
  const html = useMemo(() => {
    try { return buildCvHtml(cv, true, watermark); }
    catch { return "<p style='font-family:sans-serif;padding:24px'>Preview unavailable.</p>"; }
  }, [cv, watermark]);
  const [shown, setShown] = useState(html);
  useEffect(() => { const t = setTimeout(() => setShown(html), 400); return () => clearTimeout(t); }, [html]); // avoid reloading on every keystroke

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && typeof e.data?.cvPages === "number") setPages(e.data.cvPages);
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, []);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1.2, e.contentRect.width / 794)));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="rounded-2xl overflow-hidden border border-sky-100 shadow-card" style={{ height: (20 + pages * 1129) * scale, background: "#94A3B8" }}>
      <iframe ref={frame} title="CV preview" srcDoc={shown} sandbox="allow-scripts"
        style={{ width: 794, height: 20 + pages * 1129, border: 0, display: "block", transform: `scale(${scale})`, transformOrigin: "top left" }} />
    </div>
  );
}

export default function CreateCvPage() {
  const pass = useCvPass();
  const [cv, setCv] = useState<CV>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);

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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Create your <span className="text-gradient">CV</span></h1>
            <p className="text-sky-900/60 text-sm mt-1">Build it free. Pay KES {CV_PRICE} with M-Pesa to remove the watermark and download the PDF.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(TEMPLATES).map(([id, t]) => (
              <button key={id} onClick={() => setCv(c => withTemplate(c, id))}
                className={`px-4 py-2 rounded-xl text-sm font-heading font-semibold border transition-all ${cv.layout.template === id ? "bg-sky-500 border-sky-400 text-white" : "bg-white border-sky-200 text-sky-800 hover:bg-sky-50"}`}>
                {t.label}
              </button>
            ))}
            <button onClick={download}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl text-white font-semibold">
              {pass.active ? <Download size={16} /> : <Lock size={16} />}
              {pass.active ? "Download PDF" : `Unlock · KES ${CV_PRICE}`}
            </button>
          </div>
        </div>

        {pass.active && pass.expiresAt && (
          <p className="flex items-center gap-2 text-emerald-700 text-sm mb-4">
            <ShieldCheck size={16} /> Unlocked until {new Date(pass.expiresAt).toLocaleString()}. Edit and download as often as you like.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card p-4 md:p-6">
            <CvEditor
                value={cv}
                onChange={setCv}
                onDownload={download}
                watermark={!pass.active}
                stickyTop={100}
                downloadLabel={pass.active ? "Download PDF" : `Unlock and download · KES ${CV_PRICE}`}
                />
          </div>
          <div className="lg:sticky lg:top-28">
            <LivePreview cv={cv} watermark={!pass.active} />
          </div>
        </div>
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