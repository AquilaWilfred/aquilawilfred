// app/admin/_components/editors/SettingsEditor.tsx

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Loader, FileUp, ExternalLink } from "lucide-react";
import { box, inputStyle, btnPrimary } from "@/lib/admin-styles";

interface SettingsEditorProps {
  data: any;
  onRefresh: () => Promise<void>;
}

export default function SettingsEditor({ data, onRefresh }: SettingsEditorProps) {
  const [owner, setOwner] = useState({ ...data.owner });
  const [saving, setSaving] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    if (data.owner?.resumeUrl) setResumeUrl(data.owner.resumeUrl);
  }, [data.owner]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...owner, resumeUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved!");
      await onRefresh();
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="p-8 rounded-2xl" style={box}>
          <h3 className="text-white font-heading font-bold text-lg mb-6">
            Personal Information
          </h3>
          <div className="space-y-4">
            {[
              { k: "name", l: "Full Name" },
              { k: "title", l: "Professional Title" },
              { k: "tagline", l: "Tagline" },
              { k: "email", l: "Email" },
              { k: "location", l: "Location" },
              { k: "availability", l: "Availability" },
              { k: "company", l: "Company Name" },
              { k: "experience", l: "Years of Experience" },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-white/40 text-xs font-mono block mb-1.5">
                  {f.l.toUpperCase()}
                </label>
                <input
                  style={inputStyle}
                  value={(owner as any)[f.k] || ""}
                  onChange={(e) => setOwner({ ...owner, [f.k]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="text-white/40 text-xs font-mono block mb-1.5">
                BIO
              </label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                value={owner.bio || ""}
                onChange={(e) => setOwner({ ...owner, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="text-white/40 text-xs font-mono block mb-1.5">
                PHONE NUMBERS (one per line)
              </label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
                value={
                  Array.isArray(owner.phone)
                    ? owner.phone.join("\n")
                    : owner.phone || ""
                }
                onChange={(e) =>
                  setOwner({
                    ...owner,
                    phone: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Resume */}
          <div
            className="p-6 rounded-2xl"
            style={{ ...box, border: "1px solid rgba(14,165,233,0.2)" }}
          >
            <h3 className="text-white font-heading font-bold text-lg mb-2 flex items-center gap-2">
              <FileUp size={18} className="text-sky-400" />
              Resume / CV PDF
            </h3>
            <p className="text-white/30 text-xs font-mono mb-4">
              Paste the public URL to your PDF resume. It will show as a preview
              on the About page and open when clicked.
            </p>
            <label className="text-white/40 text-xs font-mono block mb-1.5">
              RESUME PDF URL
            </label>
            <input
              style={inputStyle}
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view or Cloudinary PDF URL"
            />
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sky-400 text-xs hover:underline"
              >
                <ExternalLink size={12} /> Preview resume link
              </a>
            )}
          </div>

          {/* Profile images */}
          <div
            className="p-6 rounded-2xl"
            style={{ ...box, border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <h3 className="text-white font-heading font-bold text-lg mb-2">
              Profile Images
            </h3>
            <p className="text-white/30 text-xs font-mono mb-4">
              Upload images via Gallery → copy Cloudinary URL → paste below.
            </p>
            <div className="space-y-3">
              {[
                { k: "heroImage", l: "Hero Image URL" },
                { k: "avatarImage", l: "Avatar / Circular Image URL" },
                { k: "aboutImage", l: "About Page Image URL" },
                { k: "footerImage", l: "Footer Image URL" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="text-white/40 text-xs font-mono block mb-1">
                    {f.l.toUpperCase()}
                  </label>
                  <input
                    style={inputStyle}
                    value={(owner as any)[f.k] || ""}
                    onChange={(e) =>
                      setOwner({ ...owner, [f.k]: e.target.value })
                    }
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 rounded-2xl" style={box}>
            <h3 className="text-white font-heading font-bold text-lg mb-4">
              Homepage Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "statProjects", l: "Projects Delivered", def: "20+" },
                { k: "statAccuracy", l: "Model Accuracy", def: "94%" },
                { k: "statCloud", l: "Cloud Platforms", def: "3" },
                { k: "statClients", l: "Clients Served", def: "15+" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="text-white/40 text-xs font-mono block mb-1">
                    {f.l.toUpperCase()}
                  </label>
                  <input
                    style={inputStyle}
                    value={(owner as any)[f.k] || f.def}
                    onChange={(e) =>
                      setOwner({ ...owner, [f.k]: e.target.value })
                    }
                    placeholder={f.def}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={`${btnPrimary} mt-6 w-full justify-center text-base py-4 disabled:opacity-60`}
      >
        {saving ? (
          <>
            <Loader size={18} className="animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save size={18} /> Save All Settings
          </>
        )}
      </button>
    </div>
  );
}