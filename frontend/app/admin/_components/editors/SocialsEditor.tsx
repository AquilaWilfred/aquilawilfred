// app/admin/_components/editors/SocialsEditor.tsx

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Loader, Eye, EyeOff } from "lucide-react";
import { ALL_SOCIALS } from "@/lib/admin-constants";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";
import { Extras, SocialLink } from "@/types/admin";

interface SocialsEditorProps {
  extras: Extras;
  onRefresh: () => Promise<void>;
}

export default function SocialsEditor({ extras, onRefresh }: SocialsEditorProps) {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const merged = ALL_SOCIALS.map((s) => {
      const existing = extras.socials.find((e: any) => e.id === s.id);
      return existing || { ...s, visible: false, sort_order: 99 };
    });
    setSocials(merged);
  }, [extras.socials]);

  const saveAll = async (updatedSocials?: SocialLink[]) => {
    const toSave = updatedSocials || socials;
    setSaving(true);
    try {
      const res = await fetch("/api/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socials: toSave }),
      });
      if (!res.ok) throw new Error();
      toast.success("Social links saved!");
      await onRefresh();
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
      setSavingId(null);
    }
  };

  const toggleAndSave = async (id: string) => {
    setSavingId(id);
    const updated = socials.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    setSocials(updated);
    await saveAll(updated);
  };

  const update = (id: string, field: string, value: any) => {
    setSocials(socials.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-heading font-bold text-xl">
            Social Media & Dev Hubs
          </h3>
          <p className="text-white/40 text-sm mt-1">
            Toggle saves instantly. Edit URLs then click Save All to update links.
          </p>
        </div>
        <button
          onClick={() => saveAll()}
          disabled={saving}
          className={`${btnPrimary} disabled:opacity-60`}
        >
          {saving && !savingId ? (
            <>
              <Loader size={15} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={15} /> Save All
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {socials.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              ...box,
              border: s.visible
                ? "1px solid rgba(14,165,233,0.3)"
                : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-2xl w-10 text-center shrink-0">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium mb-1">
                {s.platform}
              </p>
              <input
                style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }}
                value={s.url || ""}
                onChange={(e) => update(s.id, "url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <button
              onClick={() => toggleAndSave(s.id)}
              disabled={savingId === s.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 disabled:opacity-50"
              style={{
                background: s.visible
                  ? "rgba(14,165,233,0.2)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${
                  s.visible
                    ? "rgba(14,165,233,0.4)"
                    : "rgba(255,255,255,0.12)"
                }`,
                color: s.visible ? "#38BDF8" : "rgba(255,255,255,0.35)",
                minWidth: 110,
                justifyContent: "center",
              }}
            >
              {savingId === s.id ? (
                <>
                  <Loader size={13} className="animate-spin" /> Saving
                </>
              ) : s.visible ? (
                <>
                  <Eye size={14} /> Visible
                </>
              ) : (
                <>
                  <EyeOff size={14} /> Hidden
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div
        className="mt-6 p-4 rounded-xl"
        style={{
          background: "rgba(14,165,233,0.08)",
          border: "1px solid rgba(14,165,233,0.15)",
        }}
      >
        <p className="text-sky-300/70 text-sm">
          💡 Toggling <strong>Visible/Hidden</strong> saves instantly. After
          editing URLs, click <strong>Save All</strong>. Hardcoded links (GitHub,
          LinkedIn, WhatsApp, Upwork, Kaggle, Portfolio) always show on the
          website regardless of this setting.
        </p>
      </div>
    </div>
  );
}