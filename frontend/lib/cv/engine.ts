/* ───────────────────────────── DATA MODEL ───────────────────────────── */
export type Entry = { title: string; org: string; period: string; body: string };
export type Skill = { group: string; items: string; rating?: number };
export type Link = { label: string; url: string };
export type ListKey = "education" | "experience" | "projects" | "competitions" | "certifications" | "awards" | "volunteering" | "referees";
export type Trio = [string, string, string];

/** Every visual choice lives here. The document builder reads only this, so a choice applies everywhere. */
export type Layout = {
  template: "classic" | "elegant"; runHead: boolean; bodyColor: string;
  panel: string; ratingStyle: "stars" | "bars" | "dots";
  photoX: number; photoY: number; photoZoom: number; photoRot: number; frameDx: number; frameDy: number;
  order: string[]; hidden: string[];
  preset: string;
  font: "times" | "dmsans";
  accent: string; textColor: string;
  nameColor: "text" | "accent"; headColor: "text" | "accent"; detailColor: "muted" | "text" | "accent";
  headCase: "upper" | "none"; rule: "none" | "short" | "full"; align: "center" | "left";
  sizeUnit: "px" | "pt"; baseSize: number; lineHeight: number; paraGap: number;
  marginX: number; marginY: number;
  photoPos: "left" | "right" | "top"; photoShape: "circle" | "rounded" | "square"; photoSize: number;
  pn: "none" | "n" | "page-n" | "page-n-of-N" | "n-of-N"; pnPos: 0 | 1 | 2;
  headerOn: boolean; header: Trio; footerOn: boolean; footer: Trio;
};
export type CV = {
  name: string; headline: string; email: string; phone: string; location: string; photo: string;
  links: Link[]; summary: string; skills: Skill[]; languages: string; sidebar: SideBlock[]; layout: Layout;
} & Record<ListKey, Entry[]>;

/** Main-column sections, in default order. Users can reorder and hide them. */
export const SECTIONS: Record<string, string> = {
  summary: "Professional summary", education: "Education", skills: "Technical skills", languages: "Languages",
  experience: "Work experience", projects: "Projects", competitions: "Competitions and engagements",
  certifications: "Certifications", awards: "Awards and honours", volunteering: "Volunteer work", referees: "Referees",
};
export const ORDER_DEFAULT = Object.keys(SECTIONS);

/** Style presets, like Word's style sets. Picking one sets the colour and heading choices below. */
export const PRESETS: Record<string, { label: string; style: Partial<Layout> }> = {
  classic: { label: "Classic", style: { font: "times", accent: "#111111", nameColor: "text", headColor: "text", headCase: "upper", rule: "none", detailColor: "text", align: "center" } },
  modern: { label: "Modern", style: { font: "dmsans", accent: "#0F766E", nameColor: "accent", headColor: "accent", headCase: "upper", rule: "short", detailColor: "muted", align: "left" } },
  executive: { label: "Executive", style: { font: "times", accent: "#1E3A8A", nameColor: "accent", headColor: "accent", headCase: "upper", rule: "full", detailColor: "muted", align: "center" } },
  minimal: { label: "Minimal", style: { font: "dmsans", accent: "#334155", nameColor: "text", headColor: "text", headCase: "none", rule: "none", detailColor: "muted", align: "left" } },
};
export const ACCENTS = ["#111111", "#1E3A8A", "#0F766E", "#6D28D9", "#B91C1C", "#9A3412", "#334155"];
export const TEXTS = ["#111111", "#1F2937", "#0F172A", "#3B2F2F"];

export const DEFAULT_LAYOUT: Layout = {
  template: "classic", runHead: false, bodyColor: "#111111",
  panel: "#ECEEF0", ratingStyle: "stars", photoX: 0, photoY: 0, photoZoom: 1, photoRot: 0, frameDx: 0, frameDy: 0,
  order: ORDER_DEFAULT, hidden: [],
  preset: "classic", font: "times", accent: "#111111", textColor: "#111111",
  nameColor: "text", headColor: "text", detailColor: "text", headCase: "upper", rule: "none", align: "center",
  sizeUnit: "px", baseSize: 12, lineHeight: 1.5, paraGap: 1, marginX: 22, marginY: 20,
  photoPos: "right", photoShape: "circle", photoSize: 30,
  pn: "none", pnPos: 1, headerOn: false, header: ["", "", ""], footerOn: false, footer: ["", "", ""],
};

/** Templates change the whole page structure. Each one supplies its own default style and page settings. */
export const TEMPLATES: Record<string, { label: string; blurb: string; layout: Partial<Layout> }> = {
  classic: {
    label: "Classic", blurb: "Single column with a centred header. Clean and easy for recruiting software to read.",
    layout: { template: "classic", runHead: false, preset: "classic", ...PRESETS.classic.style, textColor: "#111111", bodyColor: "#111111", marginX: 22, marginY: 20, photoPos: "right", photoShape: "circle", photoSize: 30, pn: "none", pnPos: 1, headerOn: false, header: ["", "", ""], footerOn: false, footer: ["", "", ""] },
  },
  elegant: {
    label: "Elegant sidebar", blurb: "Two columns: grey sidebar with photo ribbon, contacts and star-rated skills; roman-numeral bullets; running head and page numbers.",
    layout: { template: "elegant", runHead: true, preset: "elegant", font: "dmsans", accent: "#252E66", textColor: "#212124", bodyColor: "#5C5C61", nameColor: "text", headColor: "text", detailColor: "muted", headCase: "upper", rule: "none", align: "left", marginX: 15, marginY: 20, photoSize: 38, photoShape: "circle", pn: "page-n", pnPos: 2, headerOn: false, header: ["", "", ""], footerOn: true, footer: ["{phone} · {email}", "", ""] },
  },
};

/** Sidebar blocks (Elegant template). The user adds, fills, reorders and hides them. */
export type SideType = "contacts" | "languages" | "skills" | "links" | "text" | "list" | "stats" | "tags" | "pairs" | "quote";
export type SideBlock = { id: string; type: SideType; title: string; text: string; show: boolean };
export const SIDE_TYPES: Record<SideType, { label: string; title: string; auto?: string; hint?: string; ph?: string }> = {
  contacts: { label: "Contacts", title: "Contacts", auto: "Filled from the Contact step: phone, email and location." },
  languages: { label: "Languages", title: "Languages", auto: "Filled from the Languages field in the Contact step." },
  skills: { label: "Rated skills", title: "Top skills", auto: "Skill groups that have a star rating in the Skills step." },
  links: { label: "Online links", title: "Online", auto: "Filled from the links in the Contact step." },
  text: { label: "Short text", title: "Availability", hint: "A short paragraph, for example your availability.", ph: "Contract · Remote · On-site" },
  list: { label: "Numbered list", title: "Services", hint: "One item per line. Items get roman numerals.", ph: "Cloud architecture\nAPI development\nData pipelines" },
  stats: { label: "Key numbers", title: "Impact", hint: "One per line, written as: number | caption", ph: "40% | lower cloud costs\n10K+ | concurrent users" },
  tags: { label: "Tags", title: "Tools", hint: "Separate with commas.", ph: "Python, Rust, Docker, PostgreSQL" },
  pairs: { label: "Label and value", title: "At a glance", hint: "One per line, written as: label: value", ph: "Web: React, Next.js\nData: PostgreSQL, Redis" },
  quote: { label: "Quote", title: "", hint: "A short quote or motto. The title can stay empty.", ph: "Learning is not weakness. It is wisdom earned." },
};
export const uid = () => Math.random().toString(36).slice(2, 9);
export const mkBlock = (type: SideType, text = ""): SideBlock => ({ id: uid(), type, title: SIDE_TYPES[type].title, text, show: true });
export const DEFAULT_SIDEBAR: SideBlock[] = (["contacts", "languages", "skills", "links"] as SideType[]).map(t => mkBlock(t));
export const roman = (n: number) => {
  let r = "";
  for (const [v, sym] of [[10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]] as [number, string][]) while (n >= v) { r += sym; n -= v; }
  return r;
};

export const blankEntry = (): Entry => ({ title: "", org: "", period: "", body: "" });
export const EMPTY: CV = {
  name: "", headline: "", email: "", phone: "", location: "", photo: "", links: [], summary: "", languages: "",
  skills: [{ group: "", items: "" }],
  education: [blankEntry()], experience: [], projects: [], competitions: [],
  certifications: [], awards: [], volunteering: [], referees: [], sidebar: DEFAULT_SIDEBAR, layout: DEFAULT_LAYOUT,
};
export const KEY = "cv-builder:v1";
export const LIB_KEY = "cv-builder:lib:v1";
/** Strict: rebuilds the CV field by field. Unknown keys are dropped and every value gets the exact type the renderer expects. */
const S = (v: unknown, d = ""): string =>
  typeof v === "string" ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : d;
const Nm = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const B = (v: unknown, d: boolean): boolean => (typeof v === "boolean" ? v : d);
const R = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const pick = <T extends string | number>(v: unknown, allowed: readonly T[], d: T): T =>
  allowed.includes(v as T) ? (v as T) : d;
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const trio = (v: unknown, d: Trio): Trio => (Array.isArray(v) ? [S(v[0]), S(v[1]), S(v[2])] : d);
const arr = <T,>(v: unknown, f: (o: Record<string, unknown>) => T): T[] => (Array.isArray(v) ? v.map(R).map(f) : []);
const PHOTO_OK = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const normEntry = (o: Record<string, unknown>): Entry => ({
  title: S(o.title), org: S(o.org), period: S(o.period), body: S(o.body),
});

const normLayout = (raw: unknown): Layout => {
  const r = R(raw), D = DEFAULT_LAYOUT;
  const order = strs(r.order);
  return {
    template: pick(r.template, ["classic", "elegant"] as const, D.template),
    runHead: B(r.runHead, D.runHead),
    bodyColor: S(r.bodyColor, D.bodyColor),
    panel: S(r.panel, D.panel),
    ratingStyle: pick(r.ratingStyle, ["stars", "bars", "dots"] as const, D.ratingStyle),
    photoX: Nm(r.photoX, D.photoX), photoY: Nm(r.photoY, D.photoY),
    photoZoom: Nm(r.photoZoom, D.photoZoom), photoRot: Nm(r.photoRot, D.photoRot),
    frameDx: Nm(r.frameDx, D.frameDx), frameDy: Nm(r.frameDy, D.frameDy),
    order: order.length ? order : D.order,
    hidden: strs(r.hidden),
    preset: S(r.preset, D.preset),
    font: pick(r.font, ["times", "dmsans"] as const, D.font),
    accent: S(r.accent, D.accent), textColor: S(r.textColor, D.textColor),
    nameColor: pick(r.nameColor, ["text", "accent"] as const, D.nameColor),
    headColor: pick(r.headColor, ["text", "accent"] as const, D.headColor),
    detailColor: pick(r.detailColor, ["muted", "text", "accent"] as const, D.detailColor),
    headCase: pick(r.headCase, ["upper", "none"] as const, D.headCase),
    rule: pick(r.rule, ["none", "short", "full"] as const, D.rule),
    align: pick(r.align, ["center", "left"] as const, D.align),
    sizeUnit: pick(r.sizeUnit, ["px", "pt"] as const, D.sizeUnit),
    baseSize: Nm(r.baseSize, D.baseSize), lineHeight: Nm(r.lineHeight, D.lineHeight), paraGap: Nm(r.paraGap, D.paraGap),
    marginX: Nm(r.marginX, D.marginX), marginY: Nm(r.marginY, D.marginY),
    photoPos: pick(r.photoPos, ["left", "right", "top"] as const, D.photoPos),
    photoShape: pick(r.photoShape, ["circle", "rounded", "square"] as const, D.photoShape),
    photoSize: Nm(r.photoSize, D.photoSize),
    pn: pick(r.pn, ["none", "n", "page-n", "page-n-of-N", "n-of-N"] as const, D.pn),
    pnPos: pick(r.pnPos, [0, 1, 2] as const, D.pnPos),
    headerOn: B(r.headerOn, D.headerOn), header: trio(r.header, D.header),
    footerOn: B(r.footerOn, D.footerOn), footer: trio(r.footer, D.footer),
  };
};

export const norm = (d: Partial<CV>): CV => {
  const s = R(d);
  const photo = S(s.photo);
  return {
    name: S(s.name), headline: S(s.headline), email: S(s.email), phone: S(s.phone),
    location: S(s.location), summary: S(s.summary), languages: S(s.languages),
    photo: PHOTO_OK.test(photo) ? photo : "",
    links: arr(s.links, o => ({ label: S(o.label), url: S(o.url) })),
    skills: arr(s.skills, o => ({
      group: S(o.group),
      items: Array.isArray(o.items) ? o.items.map(x => S(x)).filter(Boolean).join(", ") : S(o.items),
      ...(typeof o.rating === "number" ? { rating: Math.max(0, Math.min(5, Math.round(o.rating))) } : {}),
    })),
    education: arr(s.education, normEntry),
    experience: arr(s.experience, normEntry),
    projects: arr(s.projects, normEntry),
    competitions: arr(s.competitions, normEntry),
    certifications: arr(s.certifications, normEntry),
    awards: arr(s.awards, normEntry),
    volunteering: arr(s.volunteering, normEntry),
    referees: arr(s.referees, normEntry),
    sidebar: Array.isArray(s.sidebar)
      ? s.sidebar.map(R)
          .filter(b => typeof b.type === "string" && b.type in SIDE_TYPES)
          .map(b => ({
            id: S(b.id) || uid(), type: b.type as SideType,
            title: S(b.title), text: S(b.text), show: B(b.show, true),
          }))
      : DEFAULT_SIDEBAR,
    layout: normLayout(s.layout),
  };
};
export type Item = { id: string; name: string; updated: number; data: CV };
export type Lib = { active: string; items: Item[] };
export const saveFile = (name: string, mime: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Field labels + guidance for every list-type section. `noBody` hides the rich editor. */
export const LISTS: Record<ListKey, { heading: string; labels: [string, string, string, string]; noBody?: boolean }> = {
  education: { heading: "Education", labels: ["Qualification", "Institution", "Dates (e.g. 2022 – 2027)", "Coursework, honours, thesis"] },
  experience: { heading: "Work experience", labels: ["Job title", "Employer", "Dates", "What you did and achieved"] },
  projects: { heading: "Projects", labels: ["Project name and your role", "Context (company, course, personal)", "Dates", "What you built and the result"] },
  competitions: { heading: "Competitions and engagements", labels: ["Competition or engagement", "Organiser", "Dates", "What you did"] },
  certifications: { heading: "Certifications", labels: ["Certificate", "Issuer", "Year", "Notes"] },
  awards: { heading: "Awards and honours", labels: ["Award", "Awarding body", "Year", "Why you received it"] },
  volunteering: { heading: "Volunteer work", labels: ["Role", "Organisation", "Dates", "What you did"] },
  referees: { heading: "Referees", labels: ["Name", "Position and organisation", "Contact (email or phone)", ""], noBody: true },
};

export type Step = { id: string; label: string; required: boolean; tip: string; keys: string[]; lists?: ListKey[] };
export const STEPS: Step[] = [
  { id: "personal", label: "Contact", required: true, keys: ["personal"], tip: "Use a professional email. Leave out age, marital status and your street address." },
  { id: "summary", label: "Summary", required: false, keys: ["summary"], tip: "Three or four sentences: who you are, your strongest skills, and what you want next. Aim for 40–80 words." },
  { id: "education", label: "Education", required: true, keys: ["education"], lists: ["education"], tip: "Newest first. If you haven't graduated, write the expected year." },
  { id: "skills", label: "Skills", required: true, keys: ["skills"], tip: "Group skills by type and put the most relevant group first. Separate items with commas." },
  { id: "experience", label: "Experience", required: false, keys: ["experience"], lists: ["experience"], tip: "Newest first. Start each bullet with a verb and add numbers where you can. Internships, freelance and contract work count." },
  { id: "projects", label: "Projects", required: false, keys: ["projects"], lists: ["projects"], tip: "Pick two to four you can talk about in an interview. Say what you built, with what, and what came of it." },
  { id: "extras", label: "Extras", required: false, keys: ["competitions", "certifications", "awards", "volunteering"], lists: ["competitions", "certifications", "awards", "volunteering"], tip: "Only add what supports the role you're applying for." },
  { id: "referees", label: "Referees", required: false, keys: ["referees"], lists: ["referees"], tip: "Ask permission first. Two referees is standard; one academic and one professional works well." },
  { id: "sidebar", label: "Sidebar", required: false, keys: [], tip: "Fill the grey sidebar of the Elegant template. Add the blocks you want, write their content, and put them in the order you like." },
  { id: "style", label: "Style", required: false, keys: [], tip: "Pick a style, then adjust colours, fonts and spacing. Headings, rules, links, bullets and the photo border all follow the same choices, so the CV stays consistent." },
  { id: "page", label: "Page", required: false, keys: [], tip: "Margins, photo, page numbers, header and footer." },
];

/* ───────────────────────────── VALIDATION ───────────────────────────── */
export const plain = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
export const used = (e: Entry) => !!(e.title.trim() || e.org.trim() || e.period.trim() || plain(e.body));
export const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** Returns messages per section key. Required sections: personal, education, skills. */
export function problems(cv: CV): Record<string, string[]> {
  const p: Record<string, string[]> = {};
  const c: string[] = [];
  if (!cv.name.trim()) c.push("Full name");
  if (!emailOk(cv.email)) c.push("A valid email address");
  if (!cv.phone.trim()) c.push("Phone number");
  if (!cv.location.trim()) c.push("Location (city, country)");
  if (cv.links.some(l => l.url.trim() && !/^https?:\/\//i.test(l.url.trim()))) c.push("Links must start with https://");
  if (c.length) p.personal = c;

  const ed = cv.education.filter(used);
  if (!ed.length || ed.some(e => !e.title.trim() || !e.org.trim() || !e.period.trim()))
    p.education = ["At least one entry with qualification, institution and dates"];
  if (!cv.skills.some(s => s.group.trim() && s.items.trim())) p.skills = ["At least one skill group with a name and items"];

  (Object.keys(LISTS) as ListKey[]).filter(k => k !== "education").forEach(k => {
    if (cv[k].filter(used).some(e => !e.title.trim())) p[k] = [`Every ${LISTS[k].heading.toLowerCase()} entry needs a ${LISTS[k].labels[0].toLowerCase()}`];
  });
  return p;
}
export const REQUIRED_KEYS = ["personal", "education", "skills"];

/* ───────────────────────────── PDF DOCUMENT ───────────────────────────── */
export const esc = (s: unknown): string =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const clamp = (n: number, min: number, max: number, d: number) => (Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d);
export const safeColor = (c: string, d: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : d);
export const mixWhite = (hex: string, keep: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * keep + 255 * (1 - keep)));
  return `#${ch.map(v => v.toString(16).padStart(2, "0")).join("")}`;
};
/** Every size is a multiple of the body size, so changing the body size rescales the whole CV. */
export const SCALE = { name: 2, heading: 14 / 12, small: 11 / 12, hf: 0.85 };
export const FONTS = {
  times: { stack: `"Times New Roman",Times,"Liberation Serif",serif`, weight: 400, link: "" },
  dmsans: {
    stack: `"DM Sans","Helvetica Neue",Arial,sans-serif`, weight: 500,
    link: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,500;0,700;1,500&display=swap">`,
  },
};
export const PN_TEXT = { n: "{page}", "page-n": "Page {page}", "page-n-of-N": "Page {page} of {pages}", "n-of-N": "{page} / {pages}" } as const;
export const PAGE_H = 296; // mm, a hair under A4 so the browser never adds a blank page

/** Keeps structure (lists, bold, italic, links) but drops the editor's theme colours, code blocks and handlers. */
export function clean(html: string): string {
  if (typeof DOMParser === "undefined") return esc(html);
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,.code-block,.math-block,input").forEach(el => el.remove());
  doc.body.querySelectorAll<HTMLElement>("*").forEach(el => {
    Array.from(el.attributes).forEach(a => {
      const n = a.name.toLowerCase();
      if (n === "href" && /^(https?:|mailto:)/i.test(a.value)) return;
      if (n === "style") {
        const kept = ["font-weight", "font-style", "text-decoration"].map(p => { const v = el.style.getPropertyValue(p); return v ? `${p}:${v}` : ""; }).filter(Boolean).join(";");
        if (kept) el.setAttribute("style", kept); else el.removeAttribute("style");
        return;
      }
      el.removeAttribute(a.name);
    });
  });
  return doc.body.innerHTML;
}

export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * k).toString(16).padStart(2, "0")).join("")}`;
};

/**
 * Builds the whole document. Content is split into "units" (header, each entry, each section's first
 * entry together with its heading, each sidebar block). A small script measures them and packs main
 * column and sidebar onto A4 pages, so headers, footers, running heads and real page numbers are
 * exact and nothing is cut across two pages. Both templates share this engine.
 */
export function buildCvHtml(cv: CV, forScreen = false, watermark = false): string {
  const L: Layout = { ...DEFAULT_LAYOUT, ...cv.layout };
  const el = L.template === "elegant";
  const f = FONTS[L.font] ?? FONTS.times;
  const [smin, smax] = L.sizeUnit === "px" ? [10, 22] : [8, 16];
  const base = clamp(L.baseSize, smin, smax, 12), lh = clamp(L.lineHeight, 1, 3, 1.5), gap = clamp(L.paraGap, 0, 3, 1);
  const mx = clamp(L.marginX, 10, 35, 22), my = clamp(L.marginY, 12, 35, 20), ps = clamp(L.photoSize, 20, 45, 30);
  const accent = safeColor(L.accent, "#111111"), text = safeColor(L.textColor, "#111111"), bodyC = safeColor(L.bodyColor, "#111111");
  const panel = safeColor(L.panel, "#ECEEF0");
  const dx = clamp(L.frameDx, -25, 25, 0), dy = clamp(L.frameDy, -25, 25, 0);
  const detail = L.detailColor === "accent" ? "var(--accent)" : L.detailColor === "text" ? "var(--body)" : "var(--muted)";
  const SIDE = 72, SGAP = 9, RHD = 6, SIDE_TOP = 90; // mm
  const mainW = el ? 210 - SIDE - SGAP - mx : 210 - 2 * mx;
  const rightInset = el ? SIDE + SGAP : mx;
  const useRH = el && L.runHead;
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fill = (t: string) => esc(t.replace(/\{name\}/gi, cv.name).replace(/\{email\}/gi, cv.email).replace(/\{phone\}/gi, cv.phone).replace(/\{date\}/gi, date));
  const bar = (cls: string, v: Trio) => v.some(x => x.trim())
    ? `<div class="hf ${cls}"><span>${fill(v[0])}</span><span style="text-align:center">${fill(v[1])}</span><span style="text-align:right">${fill(v[2])}</span></div>` : "";

  const footerVals: Trio = L.footerOn ? [...L.footer] as Trio : ["", "", ""];
  if (L.pn !== "none") {
    const t = PN_TEXT[L.pn];
    footerVals[L.pnPos] = footerVals[L.pnPos].trim() ? `${footerVals[L.pnPos]} · ${t}` : t;
  }
  const hdr = bar("hdr", L.headerOn ? L.header : ["", "", ""]);
  const ftr = bar("ftr", footerVals);

  const entries = (k: ListKey) => cv[k].filter(used).map((e, n) =>
    `<div class="e"><div class="row"><b>${el && k === "projects" ? `<span class="num">${n + 1}</span>` : ""}${esc(e.title)}</b><span class="det">${esc(e.period)}</span></div>` +
    (e.org.trim() ? `<div class="org det">${esc(e.org)}</div>` : "") +
    (!LISTS[k].noBody && plain(e.body) ? `<div class="body">${clean(e.body)}</div>` : "") + `</div>`);

  const hasPhoto = cv.photo.startsWith("data:image/");
  const imgT = `translate(${clamp(L.photoX, -80, 80, 0)}%,${clamp(L.photoY, -80, 80, 0)}%) rotate(${clamp(L.photoRot, -45, 45, 0)}deg) scale(${clamp(L.photoZoom, 1, 3, 1)})`;
  const photoImg = `<img alt="" src="${cv.photo}" style="transform:${imgT}">`;
  const FLAG = `<svg class="flag" viewBox="0 0 24 12"><polygon points="8,12 24,12 16,0 0,0"/></svg>`;
  let header: string;
  if (el) {
    const parts = (cv.name.trim() || "Your Name").split(/\s+/);
    const lastN = parts.length > 1 ? parts.pop()! : "";
    header = `<div class="hd">${FLAG}<h1>${esc(parts.join(" "))}${lastN ? `<br>${esc(lastN)}` : ""}</h1>${cv.headline.trim() ? `<div class="hl det">${esc(cv.headline)}</div>` : ""}</div>`;
  } else {
    const contact = [esc(cv.location), esc(cv.phone), cv.email ? `<a href="mailto:${esc(cv.email)}">${esc(cv.email)}</a>` : "",
      ...cv.links.filter(l => l.url.trim()).map(l => `<a href="${esc(l.url.trim())}">${esc(l.label.trim() || l.url.trim().replace(/^https?:\/\//, ""))}</a>`)]
      .filter(Boolean).join(`<i class="sep">|</i>`);
    const info = `<div class="hd-t"><h1>${esc(cv.name || "Your Name")}</h1>${cv.headline.trim() ? `<div class="hl det">${esc(cv.headline)}</div>` : ""}<div class="ct det">${contact}</div></div>`;
    const ph = hasPhoto ? `<div class="phf">${photoImg}</div>` : "";
    header = !hasPhoto ? `<div class="hd">${info}</div>`
      : L.photoPos === "top" ? `<div class="hd top">${ph}${info}</div>`
      : `<div class="hd side">${L.photoPos === "left" ? ph + info : info + ph}</div>`;
  }

  const units: string[] = [`<div class="u" data-sec="">${header}</div>`];
  const section = (title: string, items: string[]) => items.forEach((h, i) =>
    units.push(`<div class="u${i === 0 ? " first" : ""}" data-sec="${title}">${i === 0 ? `<h2>${title}</h2>` : ""}${h}</div>`));
  const skillItems = cv.skills.filter(x => x.group.trim() && x.items.trim());
  const secItems: Record<string, string[]> = {
    summary: plain(cv.summary) ? [`<div class="body">${clean(cv.summary)}</div>`] : [],
    education: entries("education"),
    skills: !skillItems.length ? [] : el
      ? skillItems.map(x => `<div class="sk2"><b>${esc(x.group)}</b><div class="det">${x.items.split(",").map(t => esc(t.trim())).filter(Boolean).join('<i class="dot">·</i>')}</div></div>`)
      : [skillItems.map(x => `<div class="sk"><b>${esc(x.group)}:</b> ${esc(x.items)}</div>`).join("")],
    languages: !el && cv.languages.trim() ? [`<div class="sk">${esc(cv.languages)}</div>`] : [],
    experience: entries("experience"), projects: entries("projects"), competitions: entries("competitions"),
    certifications: entries("certifications"), awards: entries("awards"), volunteering: entries("volunteering"), referees: entries("referees"),
  };
  const order = [...L.order.filter(id => SECTIONS[id]), ...ORDER_DEFAULT.filter(id => !L.order.includes(id))];
  order.forEach(id => { if (!L.hidden.includes(id)) section(SECTIONS[id], secItems[id] ?? []); });

  /* Elegant: sidebar blocks, panel on every page, avatar on page 1, running head on pages 2+ */
  const rating = (n: number) => {
    const five = [1, 2, 3, 4, 5];
    if (L.ratingStyle === "bars" || L.ratingStyle === "dots") return `<span class="rt ${L.ratingStyle}">${five.map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
    return `<span class="rt">${five.map(i => `<svg viewBox="0 0 10 10" class="${i <= n ? "on" : ""}"><polygon points="5,.3 6.4,3.6 9.9,3.9 7.2,6.2 8.1,9.6 5,7.8 1.9,9.6 2.8,6.2 .1,3.9 3.6,3.6"/></svg>`).join("")}</span>`;
  };
  const lines = (t: string) => t.split("\n").map(x => x.trim()).filter(Boolean);
  const blockBody = (b: SideBlock): string => {
    switch (b.type) {
      case "contacts": return ([["P", cv.phone], ["@", cv.email], ["L", cv.location]] as [string, string][]).filter(([, v]) => v.trim())
        .map(([i, v]) => `<div class="ci"><i>${i}</i><span>${esc(v)}</span></div>`).join("");
      case "languages": return cv.languages.split(",").map(x => x.trim()).filter(Boolean).map(x => `<div class="li">${esc(x)}</div>`).join("");
      case "skills": return skillItems.filter(x => (x.rating || 0) > 0).map(x => `<div class="ts"><div>${esc(x.group)}</div>${rating(x.rating || 0)}</div>`).join("");
      case "links": return cv.links.filter(l => l.url.trim()).map(l => `<div class="ol"><b>${esc(l.label.trim() || "Link")}</b><div>${esc(l.url.trim().replace(/^https?:\/\//, ""))}</div></div>`).join("");
      case "text": return b.text.trim() ? `<div class="tx">${esc(b.text.trim()).replace(/\n/g, "<br>")}</div>` : "";
      case "list": return lines(b.text).map((x, i) => `<div class="rl"><i>${roman(i + 1)}.</i><span>${esc(x)}</span></div>`).join("");
      case "stats": return lines(b.text).map(x => { const [n, ...r] = x.split("|"); return `<div class="st"><b>${esc(n.trim())}</b><span>${esc(r.join("|").trim())}</span></div>`; }).join("");
      case "tags": return b.text.trim() ? `<div class="tgs">${b.text.split(/[,\n]/).map(x => x.trim()).filter(Boolean).map(x => `<span class="tg">${esc(x)}</span>`).join("")}</div>` : "";
      case "pairs": return lines(b.text).map(x => { const k = x.indexOf(":"); return k > 0 ? `<div class="pr"><b>${esc(x.slice(0, k).trim())}</b><span>${esc(x.slice(k + 1).trim())}</span></div>` : `<div class="pr"><span>${esc(x)}</span></div>`; }).join("");
      case "quote": return b.text.trim() ? `<div class="qt">“${esc(b.text.trim())}”</div>` : "";
      default: return "";
    }
  };
  const sideUnits = !el ? [] : (cv.sidebar ?? DEFAULT_SIDEBAR).filter(b => b.show).map(b => {
    const inner = blockBody(b);
    return inner ? `<div class="sb">${b.title.trim() ? `<div class="sh">${esc(b.title.trim())}</div>` : ""}${inner}</div>` : "";
  }).filter(Boolean);
  const radius = L.photoShape === "circle" ? "50%" : L.photoShape === "rounded" ? "12%" : "0";
  const avatar = !el ? "" : `<div class="av"><svg viewBox="0 0 177 190"><polygon points="0,133 177,180.5 177,104.5 0,72.2"/>` +
    (hasPhoto ? "" : `<g fill="#4D4D52"><circle cx="88.5" cy="83.6" r="34"/><path d="M26.5 184C26.5 93.6 58.5 117.6 88.5 117.6S150.5 93.6 150.5 184Z"/></g>`) +
    `</svg>${hasPhoto ? `<div class="eph">${photoImg}</div>` : ""}</div>`;
  const sideBg = el ? `<div class="side-bg"></div>` : "";
  const rh = useRH ? `<div class="rh"><span class="rn">${FLAG}${esc(cv.name)}</span><span class="rs">{sec}</span></div>` : "";

  const rule = L.rule === "full" ? "h2{border-bottom:1px solid var(--accent);padding-bottom:.15em}"
    : L.rule === "short" ? "h2::after{content:'';display:block;width:26mm;border-top:1.5px solid var(--accent);margin-top:.12em}" : "";
  const elCss = el ? `
.u.first{border-top:.6px solid #CCCCD0;padding-top:${gap}em}
h1{text-transform:uppercase;letter-spacing:.06em}.hd .flag,.rn .flag{display:block;width:7mm;fill:var(--accent);margin-bottom:3mm}
h2{letter-spacing:.1em;text-transform:uppercase}.sk2{margin:0 0 ${gap}em}.sk2:last-child{margin-bottom:0}.sk2 b{display:block;color:var(--text)}.dot{font-style:normal;margin:0 .6em;color:var(--accent)}
.body p{text-align:justify}.body ul,.body ol{list-style:lower-roman}
.num{display:inline-flex;align-items:center;justify-content:center;width:1.55em;height:1.55em;border-radius:50%;background:var(--accent);color:#fff;font-size:.75em;margin-right:.7em;vertical-align:middle}
.side-bg{position:absolute;right:0;top:0;bottom:0;width:${SIDE}mm;background:${panel}}
.av{position:absolute;top:17mm;right:5mm;width:62mm;height:67mm;background:${shade(panel, 0.94)}}.av svg{display:block;width:100%;height:100%}.av polygon{fill:var(--accent)}
.eph{position:absolute;left:calc(50% + ${dx}mm);top:calc(44% + ${dy}mm);width:${ps}mm;height:${ps}mm;transform:translate(-50%,-50%);overflow:hidden;border:2.5px solid #fff;border-radius:${radius};background:#ddd}
.si{width:${SIDE - 14}mm;font-size:.88em;line-height:1.35;color:var(--body)}.sipos{position:absolute;right:6mm}
.sb{display:flow-root;padding-bottom:1.3em}.sh{font-weight:700;font-size:.9em;letter-spacing:.12em;text-transform:uppercase;color:var(--text);border-bottom:.6px solid #CCCCD0;padding-bottom:.5em;margin:0 0 .8em}
.ci{display:flex;gap:.7em;align-items:center;margin:0 0 .7em}.ci i{flex:none;width:2em;height:2em;border-radius:50%;background:var(--accent);color:#fff;font-style:normal;font-weight:700;font-size:.7em;display:flex;align-items:center;justify-content:center}.ci span{overflow-wrap:anywhere}
.li{margin:0 0 .3em}.ts{margin:0 0 .7em;color:var(--text)}.rt{display:flex;gap:.2em;margin-top:.25em}.rt svg{width:1.05em;height:1.05em;fill:#CCCCCF}.rt svg.on{fill:var(--accent)}
.rt i{display:block;background:#CCCCCF}.rt.bars i{width:1.6em;height:.4em;border-radius:.2em}.rt.dots i{width:.8em;height:.8em;border-radius:50%}.rt i.on{background:var(--accent)}
.ol{margin:0 0 .7em}.ol b{display:block;color:var(--text);font-size:.92em}.ol div{font-size:.85em;color:var(--muted);overflow-wrap:anywhere}
.rl{display:flex;gap:.5em;margin:0 0 .35em}.rl i{font-style:normal;color:var(--accent);flex:none;min-width:1.5em}
.st{margin:0 0 .6em}.st b{display:block;font-size:1.5em;line-height:1.15;color:var(--accent)}.st span{color:var(--muted)}
.tgs{display:flex;flex-wrap:wrap;gap:.35em}.tg{background:#fff;border:.6px solid #CCCCD0;border-radius:99px;padding:.1em .65em;font-size:.92em}
.pr{margin:0 0 .5em}.pr b{display:block;color:var(--text)}.qt{font-style:italic}
.rh{position:absolute;left:${mx}mm;right:${rightInset}mm;top:${my - 9}mm;display:flex;justify-content:space-between;align-items:center;border-bottom:.6px solid #CCCCD0;padding-bottom:2mm}
.rn{display:flex;align-items:center;gap:2mm;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text)}.rn .flag{margin:0;width:5mm}.rs{color:var(--muted);font-size:.85em}
.ftr{border-top:.6px solid #CCCCD0}` : "";

  const css = `@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}
:root{--text:${text};--body:${bodyC};--accent:${accent};--muted:${mixWhite(bodyC, 0.7)}}
body{font:${f.weight} ${base}${L.sizeUnit}/${lh} ${f.stack};color:var(--body);background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
b,strong,h1,h2{font-weight:700}a{color:var(--accent);text-decoration:none}
#src{position:absolute;left:0;top:0;visibility:hidden;width:${mainW}mm}#ssrc{position:absolute;left:0;top:0;visibility:hidden}
.page{position:relative;width:210mm;height:${PAGE_H}mm;overflow:hidden;background:#fff;break-after:page;page-break-after:always}.page:last-child{break-after:auto;page-break-after:auto}
.pg-main{position:absolute;left:${mx}mm;right:${rightInset}mm;top:${my}mm;bottom:${my}mm}
.hf{position:absolute;left:${mx}mm;right:${mx}mm;height:${my}mm;display:flex;align-items:center;gap:12px;font-size:${SCALE.hf}em;line-height:1.2;color:var(--muted)}.hf span{flex:1}.hdr{top:0}.ftr{bottom:0}
.u{display:flow-root;padding-bottom:${gap}em}
.hd{text-align:${el ? "left" : L.align}}.hd.side{display:flex;align-items:center;gap:6mm;text-align:left}.hd.side .hd-t{flex:1}.hd.top{text-align:center}.hd.top .phf{margin:0 auto 3mm}
.phf{position:relative;display:block;flex:none;overflow:hidden;width:${ps}mm;height:${ps}mm;border:2px solid var(--accent);border-radius:${radius};background:#ddd}
.phf img,.eph img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
h1{font-size:${SCALE.name}em;line-height:1.2;margin:0;color:${L.nameColor === "accent" ? "var(--accent)" : "var(--text)"}}
.det{color:${detail}}.hl{margin:0}.ct{font-size:${SCALE.small}em}.sep{font-style:normal;color:var(--accent);margin:0 .55em}
h2{font-size:${SCALE.heading}em;line-height:1.3;margin:0 0 ${gap}em;color:${L.headColor === "accent" ? "var(--accent)" : "var(--text)"};text-transform:${L.headCase === "upper" ? "uppercase" : "none"};letter-spacing:${L.headCase === "upper" ? ".06em" : "0"}}${el ? "" : rule}
.row{display:flex;justify-content:space-between;gap:14px}.row b{color:var(--text)}.row span.det{white-space:nowrap}.org{font-style:italic}
.body ul,.body ol{margin:0;padding-left:1.4em}.body li::marker{color:var(--accent)}.body p{margin:0 0 ${gap}em}.body>*:last-child{margin-bottom:0}.sk{margin:0}.sk b{color:var(--text)}${elCss}
${forScreen ? "html{background:#94A3B8}body{padding:10px 0}.page{margin:0 auto 10px;box-shadow:0 2px 10px rgba(0,0,0,.3)}" : ""}
${watermark ? ".page::after{content:'PREVIEW · KES 70 TO DOWNLOAD';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(-30deg);font:700 34px sans-serif;letter-spacing:.1em;color:rgba(15,23,42,.09);pointer-events:none;white-space:nowrap;z-index:9}" : ""}`;

  const J = (t: string) => JSON.stringify(t).replace(/</g, "\\u003c");
  const avail = ((PAGE_H - 2 * my - 1) * 96) / 25.4;
  const avS0 = ((PAGE_H - SIDE_TOP - my - 1) * 96) / 25.4, avS1 = avail;
  const rhPx = useRH ? (RHD * 96) / 25.4 : 0;
  const script = `(function(){var EL=${el},HDR=${J(hdr)},FTR=${J(ftr)},SB=${J(sideBg)},S1=${J(avatar)},RH=${J(rh)},AV=${avail},AVS0=${avS0},AVS1=${avS1},RHD=${rhPx},TOP2="${my + RHD}mm",SIDE0="${SIDE_TOP}mm",SIDEN="${my}mm",done=false,T=[];
function fill(t,n,N){return t.split('{page}').join(n).split('{pages}').join(N);}
function pack(us,cap){var pages=[[]],used=0;us.forEach(function(u){var h=u.offsetHeight,i=pages.length-1;if(used+h>cap(i)&&pages[i].length){pages.push([]);used=0;}pages[pages.length-1].push(u);used+=h;});return pages;}
function run(){if(done)return;done=true;var src=document.getElementById('src'),ss=document.getElementById('ssrc');
var mp=pack([].slice.call(src.children),function(i){return i===0?AV:AV-RHD;});
var sp=ss?pack([].slice.call(ss.children),function(i){return i===0?AVS0:AVS1;}):[[]];
var N=Math.max(mp.length,sp.length);
for(var i=0;i<N;i++){var list=mp[i]||[],sl=sp[i]||[],sec=list[0]?(list[0].getAttribute('data-sec')||''):'',pg=document.createElement('div');pg.className='page';
pg.innerHTML=SB+(i===0?S1:'')+(EL?'<div class="si sipos" style="top:'+(i===0?SIDE0:SIDEN)+'"></div>':'')+(i>0&&RH?RH.split('{sec}').join(sec):'')+fill(HDR,i+1,N)+'<div class="pg-main"'+(i>0&&RHD?' style="top:'+TOP2+'"':'')+'></div>'+fill(FTR,i+1,N);
var m=pg.querySelector('.pg-main');list.forEach(function(u){m.appendChild(u);});
var s=pg.querySelector('.sipos');if(s)sl.forEach(function(u){s.appendChild(u);});
document.body.appendChild(pg);list.forEach(function(u){if(u.classList.contains('first'))T.push({t:u.getAttribute('data-sec'),p:i,y:Math.round(u.getBoundingClientRect().top-pg.getBoundingClientRect().top)});});}
src.remove();if(ss)ss.remove();window.__ready=true;try{parent.postMessage({cvPages:N,toc:T},'*');}catch(e){}}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(run);setTimeout(run,2500);})();`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(cv.name || "CV")} - CV</title>${f.link}<style>${css}</style></head><body>` +
    `<div id="src">${units.join("")}</div>${sideUnits.length ? `<div id="ssrc" class="si">${sideUnits.join("")}</div>` : ""}<script>${script}</script></body></html>`;
}

export function printPdf(cv: CV) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  iframe.onload = async () => {
    const w = iframe.contentWindow as (Window & { __ready?: boolean }) | null;
    if (!w) return;
    for (let t = 0; t < 80 && !w.__ready; t++) await new Promise(r => setTimeout(r, 50));
    w.onafterprint = () => iframe.remove();
    w.focus(); w.print();
    setTimeout(() => iframe.remove(), 60000);
  };
  iframe.srcdoc = buildCvHtml(cv);
}

/** Re-skins a CV with another template, keeping content, order and the user's text sizing. */
export function withTemplate(base: CV, id: string): CV {
  const L = base.layout;
  const t = TEMPLATES[id] ?? TEMPLATES.classic;
  return {
    ...base,
    layout: {
      ...DEFAULT_LAYOUT, ...t.layout,
      sizeUnit: L.sizeUnit, baseSize: L.baseSize, lineHeight: L.lineHeight, paraGap: L.paraGap,
      order: L.order, hidden: L.hidden,
      photoX: L.photoX, photoY: L.photoY, photoZoom: L.photoZoom, photoRot: L.photoRot,
      panel: L.panel, ratingStyle: L.ratingStyle,
    },
  };
}