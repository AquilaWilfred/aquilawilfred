// app/admin/_components/editors/ServicesEditor.tsx

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit,
  Loader,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import RichEditor from "@/components/editor/RichEditor";
import { CURRENCIES, DEFAULT_RATES } from "@/lib/admin-constants";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";
import { Extras } from "@/types/admin";

interface ServicesEditorProps {
  extras: Extras;
  onRefresh: () => Promise<void>;
}

export default function ServicesEditor({ extras, onRefresh }: ServicesEditorProps) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [globalRates, setGlobalRates] = useState(DEFAULT_RATES);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [savingRates, setSavingRates] = useState(false);
  const [showRatesPanel, setShowRatesPanel] = useState(false);

  useEffect(() => {
    fetch("/api/currency")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setGlobalRates(d.data);
        setRatesLoaded(true);
      });
  }, []);

  const saveRates = async () => {
    setSavingRates(true);
    try {
      const res = await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalRates),
      });
      if (!res.ok) throw new Error();
      toast.success("Exchange rates saved! Website updated.");
    } catch {
      toast.error("Failed to save rates.");
    } finally {
      setSavingRates(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, exchange_rates: globalRates }),
      });
      if (!res.ok) throw new Error();
      toast.success("Service saved!");
      await onRefresh();
      setEditing(null);
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const r = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted");
      await onRefresh();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const toggleVisible = async (svc: any) => {
    const newVal = svc.visible === false ? true : false;
    try {
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...svc, visible: newVal }),
      });
      if (!r.ok) throw new Error();
      await onRefresh();
      toast.success(newVal ? "Now visible ✓" : "Hidden from website");
    } catch {
      toast.error("Failed to update.");
    }
  };

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (editing)
    return (
      <div className="p-8">
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back to Services
        </button>

        <div className="max-w-5xl mx-auto space-y-6 w-full">
          <h3 className="text-white font-heading font-bold text-xl">Edit Service</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/40 text-xs font-mono block mb-1.5">
                ICON (emoji)
              </label>
              <input
                style={inputStyle}
                value={editing.icon || ""}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                placeholder="🧠"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs font-mono block mb-1.5">
                TITLE
              </label>
              <input
                style={inputStyle}
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs font-mono block mb-2">
              SHORT DESCRIPTION
            </label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-white/40 text-xs font-mono block mb-2">
              DETAILED ARTICLE (Feasibility, Planning, Design, Budget)
            </label>
            <RichEditor
              value={editing.feasibility || ""}
              onChange={(v) => setEditing({ ...editing, feasibility: v })}
              placeholder="Describe feasibility, planning process, design approach, deliverables and cost breakdown..."
              minHeight={500}
              showCodeCanvas={false}
            />
          </div>

          {/* Pricing */}
          <div className="p-6 rounded-xl" style={box}>
            <h4 className="text-white font-heading font-semibold mb-1">
              💰 Pricing Per Currency
            </h4>
            <p className="text-white/30 text-xs font-mono mb-4">
              KSH equivalences use your selling rates.
            </p>
            <div className="space-y-3">
              {CURRENCIES.map((cur) => (
                <div
                  key={cur.code}
                  className="flex items-center gap-4 flex-wrap"
                >
                  <div className="w-28 shrink-0">
                    <span className="text-white/70 text-sm font-mono font-bold">
                      {cur.symbol} {cur.code}
                    </span>
                    <p className="text-white/30 text-xs">{cur.name}</p>
                  </div>
                  <input
                    type="number"
                    style={{ ...inputStyle, width: 130 }}
                    value={editing.prices?.[cur.code] || 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        prices: {
                          ...editing.prices,
                          [cur.code]: Number(e.target.value),
                        },
                      })
                    }
                    min={0}
                  />
                  {cur.code !== "KSH" &&
                    (editing.prices?.[cur.code] || 0) > 0 && (
                      <span className="text-emerald-400/60 text-xs font-mono">
                        ≈ KSh{" "}
                        {(
                          (editing.prices[cur.code] || 0) *
                          ((globalRates as any)[cur.code]?.selling || 1)
                        ).toLocaleString()}
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={editing.visible !== false}
              onChange={(e) =>
                setEditing({ ...editing, visible: e.target.checked })
              }
              className="w-4 h-4 accent-sky-500"
            />
            <span className="text-white/60 text-sm">Visible on website</span>
          </label>

          <div className="flex gap-4">
            <button
              onClick={save}
              disabled={saving}
              className={`${btnPrimary} disabled:opacity-60`}
            >
              {saving ? (
                <>
                  <Loader size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Service
                </>
              )}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-5 py-2.5 rounded-xl text-white/60 text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

  // ── LIST MODE ──────────────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6">
      {/* Global exchange rates panel */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(245,158,11,0.3)",
          background: "rgba(245,158,11,0.04)",
        }}
      >
        <button
          onClick={() => setShowRatesPanel(!showRatesPanel)}
          className="w-full flex items-center justify-between px-6 py-4 text-left"
        >
          <div>
            <h4 className="text-amber-300 font-heading font-semibold">
              📊 Global Exchange Rates → KSH
            </h4>
            <p className="text-white/30 text-xs font-mono mt-0.5">
              Controls price conversions on website. Click to{" "}
              {showRatesPanel ? "collapse" : "expand"}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {ratesLoaded && (
              <span className="text-emerald-400 text-xs font-mono">
                ● Loaded
              </span>
            )}
            <span className="text-white/40 text-sm">
              {showRatesPanel ? "▲" : "▼"}
            </span>
          </div>
        </button>

        {showRatesPanel && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(globalRates).map(([cur, rates]: any) => (
                <div
                  key={cur}
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="text-white/70 text-sm font-mono font-bold mb-3">
                    {cur} → KSh
                  </p>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-white/30 text-xs font-mono block mb-1">
                        BUYING RATE
                      </label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={rates.buying}
                        onChange={(e) =>
                          setGlobalRates({
                            ...globalRates,
                            [cur]: {
                              ...rates,
                              buying: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-white/30 text-xs font-mono block mb-1">
                        SELLING RATE (shown on website)
                      </label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={rates.selling}
                        onChange={(e) =>
                          setGlobalRates({
                            ...globalRates,
                            [cur]: {
                              ...rates,
                              selling: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={saveRates}
              disabled={savingRates}
              className={`${btnPrimary} disabled:opacity-60`}
            >
              {savingRates ? (
                <>
                  <Loader size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Exchange Rates to Website
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{extras.services.length} services</p>
        <button
          onClick={() =>
            setEditing({
              id: Date.now().toString(),
              icon: "🔧",
              title: "New Service",
              description: "",
              prices: { KSH: 0, USD: 0, EUR: 0, CNY: 0, GBP: 0 },
              exchange_rates: globalRates,
              feasibility: "",
              visible: true,
            })
          }
          className={btnPrimary}
        >
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.services.map((svc: any) => (
          <div
            key={svc.id}
            className="p-5 rounded-2xl group"
            style={{ ...box, opacity: svc.visible === false ? 0.5 : 1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{svc.icon}</span>
                <div>
                  <h4 className="text-white font-heading font-semibold">
                    {svc.title}
                  </h4>
                  <p className="text-white/40 text-xs line-clamp-1">
                    {svc.description || svc.desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleVisible(svc)}
                  className="p-2 rounded-lg text-white/40 hover:text-sky-400"
                >
                  {svc.visible === false ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() =>
                    setEditing({
                      ...svc,
                      description: svc.description || svc.desc || "",
                    })
                  }
                  className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-400/10"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => del(svc.id)}
                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CURRENCIES.filter((c) => svc.prices?.[c.code] > 0).map((c) => (
                <span
                  key={c.code}
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}
                >
                  {c.symbol}
                  {svc.prices[c.code].toLocaleString()} {c.code}
                </span>
              ))}
              {!CURRENCIES.some((c) => svc.prices?.[c.code] > 0) && (
                <span className="text-white/20 text-xs font-mono italic">
                  {svc.price || "No prices set yet"}
                </span>
              )}
            </div>

            {svc.visible === false && (
              <p className="text-amber-400 text-xs font-mono mt-2">
                ● Hidden from website
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}