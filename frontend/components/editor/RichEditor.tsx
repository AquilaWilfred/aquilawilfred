"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import type {
  CSSProperties, ReactNode,
  KeyboardEvent as RKeyboardEvent, ClipboardEvent as RClipboardEvent,
} from "react";
import {
  Bold, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, RotateCcw, Palette, Code2, Italic,
  Link2, Unlink, Undo2, Redo2, Maximize2, Minimize2, Quote, Heading1, Heading2,
  Strikethrough, Code, Highlighter, Subscript, Superscript, SeparatorHorizontal,
  CheckSquare, Table, Sigma, Keyboard, ImagePlus, Eraser, Search,
  Sun, Moon, ArrowUpDown, Download, Printer, X, ChevronUp, ChevronDown, Check,
} from "lucide-react";

/* ───────────────────────────── THEMES ─────────────────────────────
 * Every colour in the toolbar AND in content the editor inserts (code blocks,
 * tables, kbd, math, inline code…) is a CSS variable (--re-*). Switching theme
 * swaps the variables, so already-written content re-colours itself instead of
 * ending up white-on-white. Fallbacks (the dark values) are baked into inserted
 * HTML so it still renders sensibly if it is displayed outside the editor.
 */
type ThemeName = "light" | "dark";
type Tokens = Record<string, string>;

const THEMES: Record<ThemeName, Tokens> = {
  dark: {
    bg: "#0A1628", toolbar: "#071020", border: "rgba(255,255,255,0.12)", "border-soft": "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.9)", muted: "rgba(255,255,255,0.68)", faint: "rgba(255,255,255,0.5)",
    accent: "#38BDF8", "accent-bg": "rgba(14,165,233,0.2)", "on-accent": "#04202E",
    hover: "rgba(255,255,255,0.07)", "control-bg": "rgba(255,255,255,0.06)", "control-border": "rgba(255,255,255,0.1)",
    "control-text": "rgba(255,255,255,0.75)", popover: "#0D1421", danger: "#F87171", placeholder: "rgba(255,255,255,0.35)",
    "quote-text": "rgba(255,255,255,0.7)", "quote-bg": "rgba(56,189,248,0.06)", link: "#38BDF8", selection: "rgba(56,189,248,0.3)",
    "code-bg": "#0D1117", "code-header": "#161B22", "code-fg": "#E6EDF3", "code-muted": "#8B949E", "code-border": "rgba(255,255,255,0.12)",
    "code-btn-bg": "rgba(30,41,59,0.92)", "code-btn-border": "rgba(255,255,255,0.15)",
    "inline-code-bg": "rgba(56,189,248,0.12)", "inline-code-fg": "#7DD3FC",
    "kbd-bg": "#1E293B", "kbd-fg": "#E2E8F0", "kbd-border": "rgba(255,255,255,0.2)",
    "table-border": "rgba(255,255,255,0.15)", "th-bg": "rgba(56,189,248,0.1)", "th-fg": "#38BDF8",
    "math-bg": "rgba(124,58,237,0.08)", "math-border": "rgba(124,58,237,0.25)", "math-fg": "#DDD6FE",
    "mark-bg": "#FDE68A", "mark-fg": "#1A1200",
    shadow: "0 20px 60px rgba(0,0,0,0.6)", overlay: "rgba(0,0,0,0.55)",
  },
  light: {
    bg: "#FFFFFF", toolbar: "#F4F6FA", border: "#D5DBE5", "border-soft": "#E2E8F0",
    text: "#0F172A", muted: "#475569", faint: "#5F6E82",
    accent: "#0369A1", "accent-bg": "rgba(3,105,161,0.12)", "on-accent": "#FFFFFF",
    hover: "rgba(15,23,42,0.06)", "control-bg": "#FFFFFF", "control-border": "#CBD5E1",
    "control-text": "#334155", popover: "#FFFFFF", danger: "#B91C1C", placeholder: "#718096",
    "quote-text": "#475569", "quote-bg": "rgba(3,105,161,0.06)", link: "#0369A1", selection: "rgba(14,165,233,0.28)",
    "code-bg": "#F6F8FA", "code-header": "#ECEFF3", "code-fg": "#1F2328", "code-muted": "#57606A", "code-border": "#D0D7DE",
    "code-btn-bg": "rgba(255,255,255,0.95)", "code-btn-border": "#D0D7DE",
    "inline-code-bg": "rgba(3,105,161,0.1)", "inline-code-fg": "#075985",
    "kbd-bg": "#F1F5F9", "kbd-fg": "#0F172A", "kbd-border": "#CBD5E1",
    "table-border": "#CBD5E1", "th-bg": "rgba(3,105,161,0.1)", "th-fg": "#075985",
    "math-bg": "rgba(124,58,237,0.06)", "math-border": "rgba(124,58,237,0.28)", "math-fg": "#5B21B6",
    "mark-bg": "#FDE68A", "mark-fg": "#1A1200",
    shadow: "0 20px 60px rgba(15,23,42,0.25)", overlay: "rgba(15,23,42,0.45)",
  },
};

const themeVars = (name: ThemeName): CSSProperties =>
  Object.fromEntries(Object.entries(THEMES[name]).map(([k, val]) => [`--re-${k}`, val])) as CSSProperties;

/** var(--re-x, fallback) for HTML we inject into the document */
const v = (name: string, fallback: string) => `var(--re-${name},${fallback})`;

const KBD_STYLE =
  `background:${v("kbd-bg", "#1E293B")};border:1px solid ${v("kbd-border", "rgba(255,255,255,0.2)")};` +
  `border-bottom:2px solid ${v("kbd-border", "rgba(255,255,255,0.3)")};border-radius:5px;padding:1px 7px;` +
  `font-family:'Fira Code','Courier New',monospace;font-size:0.85em;color:${v("kbd-fg", "#E2E8F0")};`;

const INLINE_CODE_STYLE =
  `background:${v("inline-code-bg", "rgba(56,189,248,0.12)")};color:${v("inline-code-fg", "#7DD3FC")};padding:2px 6px;` +
  `border-radius:4px;font-family:'Fira Code','Courier New',monospace;font-size:0.9em;`;

const MARK_STYLE = `background:${v("mark-bg", "#FDE68A")};color:${v("mark-fg", "#1A1200")};padding:0 2px;border-radius:3px;`;

/* Inline handlers used by blocks we insert. Kept as constants so the paste
 * sanitiser can recognise them and strip every other on* attribute. */
const CB_SHOW = `(function(el){var btn=el.querySelector('.cb-copy-btn');if(btn){btn.style.opacity='1';btn.style.pointerEvents='auto';}})(this)`;
const CB_HIDE = `(function(el){var btn=el.querySelector('.cb-copy-btn');if(btn){btn.style.opacity='0';btn.style.pointerEvents='none';}})(this)`;
const CB_COPY =
  `(function(btn){var block=btn.closest('.code-block');var c=block?block.querySelector('code'):null;if(!c)return;` +
  `navigator.clipboard.writeText(c.innerText).then(function(){btn.textContent='✓ Copied!';btn.style.color='#34D399';` +
  `btn.style.background='rgba(16,185,129,0.2)';btn.style.borderColor='rgba(16,185,129,0.4)';` +
  `setTimeout(function(){btn.textContent='⎘ Copy';btn.style.color='var(--re-code-muted,#8B949E)';` +
  `btn.style.background='var(--re-code-btn-bg,rgba(30,41,59,0.92))';btn.style.borderColor='var(--re-code-btn-border,rgba(255,255,255,0.15))';},1800);` +
  `}).catch(function(){btn.textContent='Failed';});})(this)`;
const CHECK_CLICK = `this.toggleAttribute('checked', this.checked); this.closest('[contenteditable=true]').dispatchEvent(new Event('input', {bubbles:true}))`;
const SAFE_HANDLERS = new Set([CB_SHOW, CB_HIDE, CB_COPY, CHECK_CLICK]);

const CHECKLIST_HTML =
  `<div class="checklist-item" style="display:flex;align-items:flex-start;gap:8px;margin:4px 0;" contenteditable="false">` +
  `<input type="checkbox" contenteditable="false" onclick="${CHECK_CLICK}" style="margin-top:6px;width:15px;height:15px;accent-color:${v("accent", "#38BDF8")};cursor:pointer;" />` +
  `<span contenteditable="true" style="flex:1;outline:none;">Checklist item</span></div>`;

/* ───────────────────────────── CONSTANTS ───────────────────────────── */
const FONTS = ["Default", "Inter", "Georgia", "Courier New", "Arial", "Times New Roman", "Fira Code"];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"].map(s => ({ label: s, value: s }));
const BLOCKS = [
  { label: "Paragraph", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
  { label: "Quote", value: "BLOCKQUOTE" },
];
const GRADIENTS = [
  "linear-gradient(90deg,#0EA5E9,#7C3AED)",
  "linear-gradient(90deg,#10B981,#0EA5E9)",
  "linear-gradient(90deg,#F59E0B,#EF4444)",
  "linear-gradient(90deg,#8B5CF6,#EC4899)",
  "linear-gradient(90deg,#0EA5E9,#10B981)",
];
const LIST_TYPES = [
  { label: "1.", value: "decimal" },
  { label: "i.", value: "lower-roman" },
  { label: "a.", value: "lower-alpha" },
];

/** Default line spacing for every new paragraph. */
const DEFAULT_LINE_HEIGHT = 1.5;
const SPACING_PRESETS = [
  { label: "Single", value: 1 },
  { label: "1.15", value: 1.15 },
  { label: "1.5 (default)", value: 1.5 },
  { label: "Double", value: 2 },
  { label: "2.5", value: 2.5 },
  { label: "Triple", value: 3 },
];
const fmtSpacing = (n: number) => String(Math.round(n * 100) / 100);

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: "Ctrl/⌘ + B / I / U", action: "Bold / italic / underline" },
  { keys: "Ctrl/⌘ + K", action: "Add link to selection" },
  { keys: "Ctrl/⌘ + H", action: "Find & replace" },
  { keys: "Ctrl/⌘ + Shift + X", action: "Strikethrough" },
  { keys: "Ctrl/⌘ + Shift + H", action: "Highlight" },
  { keys: "Ctrl/⌘ + Alt + 1 / 2 / 3", action: "Heading 1 / 2 / 3" },
  { keys: "Ctrl/⌘ + Alt + 0", action: "Normal paragraph" },
  { keys: "Ctrl/⌘ + \\", action: "Clear formatting" },
  { keys: "Tab / Shift + Tab", action: "Indent / outdent list item" },
  { keys: "Esc", action: "Close panel / exit fullscreen" },
];
const MARKDOWN_HINTS: { keys: string; action: string }[] = [
  { keys: "# + Space", action: "Heading 1" },
  { keys: "## / ### + Space", action: "Heading 2 / 3" },
  { keys: "> + Space", action: "Quote" },
  { keys: "- or * + Space", action: "Bullet list" },
  { keys: "1. + Space", action: "Numbered list" },
  { keys: "[] + Space", action: "Checklist item" },
];

// Single source of truth for horizontal padding so the toolbar, the
// editable area, and the footer all line up on the same left edge.
const PAD_X = 16;

/* ───────────────────────────── HELPERS ───────────────────────────── */
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Shared content styles — used inside the editor and in exported HTML. */
const contentCss = (s: string) => `
${s} ol, ${s} ul { padding-left: 1.5em; }
${s} h1 { font-size: 1.6em; font-weight: 700; margin: 0.6em 0 0.3em; }
${s} h2 { font-size: 1.3em; font-weight: 700; margin: 0.6em 0 0.3em; }
${s} h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; }
${s} p { margin: 0 0 0.75em; }
${s} blockquote { margin: 0.75em 0; padding: 4px 16px; border-left: 3px solid var(--re-accent); color: var(--re-quote-text); font-style: italic; background: var(--re-quote-bg); border-radius: 0 6px 6px 0; }
${s} a { color: var(--re-link); text-decoration: underline; text-underline-offset: 2px; }
${s} hr { border: none; border-top: 1px solid var(--re-border); margin: 1.25em 0; }
${s} img { max-width: 100%; }
${s} .code-block pre { tab-size: 2; }
`;

const parseRgb = (c: string): [number, number, number, number] | null => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
  if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null;
  return [p[0], p[1], p[2], p[3] ?? 1];
};
/** Let the browser normalise any CSS colour (hex, names, hsl…) into rgb(). */
const normalizeColor = (c: string) => {
  const t = document.createElement("span");
  t.style.color = c;
  return t.style.color;
};
const luminance = ([r, g, b]: number[]) => {
  const f = (x: number) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const PASTE_KEEP_STYLES = ["font-weight", "font-style", "text-decoration", "text-align"];
const ALLOWED_ATTRS = new Set(["href", "src", "alt", "title", "colspan", "rowspan", "style", "start"]);

/** Strips foreign colours/backgrounds/fonts/scripts from pasted HTML so pasted text
 *  never becomes invisible against the current theme. Our own blocks are kept intact. */
function sanitizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,meta,link,iframe,object,embed,form,svg,base").forEach(el => el.remove());
  doc.body.querySelectorAll<HTMLElement>("*").forEach(el => {
    const ours = !!el.closest(".code-block, .math-block, .checklist-item");
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      const val = attr.value;
      if (name.startsWith("on")) {
        if (!(ours && SAFE_HANDLERS.has(val))) el.removeAttribute(attr.name);
        return;
      }
      if ((name === "href" || name === "src") && /^\s*(javascript|vbscript):/i.test(val)) {
        el.removeAttribute(attr.name);
        return;
      }
      if (ours) return;
      if (name === "style") {
        const kept = PASTE_KEEP_STYLES
          .map(p => { const pv = el.style.getPropertyValue(p); return pv ? `${p}:${pv}` : ""; })
          .filter(Boolean).join(";");
        if (kept) el.setAttribute("style", kept); else el.removeAttribute("style");
        return;
      }
      if (!ALLOWED_ATTRS.has(name)) el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
}

function download(name: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const topLevelOf = (root: HTMLElement, node: Node, offset: number, isEnd: boolean): Node | null => {
  if (node === root) {
    const i = isEnd ? Math.max(0, offset - 1) : offset;
    return root.childNodes[Math.min(i, root.childNodes.length - 1)] ?? null;
  }
  let n: Node | null = node;
  while (n && n.parentNode !== root) n = n.parentNode;
  return n;
};

/* ───────────────────────────── SMALL UI PIECES ───────────────────────────── */
function ToolBtn({ title, onAct, active = false, danger = false, children }: {
  title: string; onAct: () => void; active?: boolean; danger?: boolean; children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`re-btn${active ? " is-active" : ""}${danger ? " is-danger" : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={active || undefined}
      onMouseDown={e => { e.preventDefault(); onAct(); }}
      // keyboard activation (Enter/Space) fires click with detail === 0
      onClick={e => { if (e.detail === 0) onAct(); }}
    >
      {children}
    </button>
  );
}
const Sep = () => <span className="re-sep-v" aria-hidden="true" />;

/* ───────────────────────────── COMPONENT ───────────────────────────── */
interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  showCodeCanvas?: boolean;
  /** Initial theme ("system" follows the OS). Changing the prop re-applies it. Default "dark". */
  theme?: ThemeName | "system";
  onThemeChange?: (theme: ThemeName) => void;
}

type Menu = "gradient" | "spacing" | "export" | null;

export default function RichEditor({
  value, onChange, placeholder = "Start writing...", minHeight = 300, showCodeCanvas = false,
  theme: themeProp = "dark", onThemeChange,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ThemeName>(themeProp === "light" ? "light" : "dark");
  const [menu, setMenu] = useState<Menu>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeLang, setCodeLang] = useState("javascript");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const [selWords, setSelWords] = useState(0);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [notice, setNotice] = useState<string | null>(null);
  const [textColor, setTextColor] = useState("#0EA5E9");

  // find & replace
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  // line spacing
  const [lineSpacing, setLineSpacing] = useState(DEFAULT_LINE_HEIGHT);
  const [customSpacing, setCustomSpacing] = useState(String(DEFAULT_LINE_HEIGHT));
  const [spacingScope, setSpacingScope] = useState<"selection" | "document">("selection");

  const [active, setActive] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false,
    subscript: false, superscript: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: false,
    insertOrderedList: false, insertUnorderedList: false,
    block: "P",
  });

  const isInternalChange = useRef(false);
  const savedRange = useRef<Range | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  /* ── theme ── */
  useEffect(() => {
    if (themeProp === "system") {
      setTheme(window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    } else {
      setTheme(themeProp);
    }
  }, [themeProp]);

  const toggleTheme = () => {
    const next: ThemeName = theme === "dark" ? "light" : "dark";
    setTheme(next);
    onThemeChange?.(next);
  };

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2800);
  }, []);

  /* ── content bookkeeping ── */
  const updateWordCount = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    const text = root.innerText?.trim() || "";
    setWordCount({ words: text ? text.split(/\s+/).length : 0, chars: text.length });
    setIsEmpty(!text && !root.querySelector("img,table,hr,ul,ol,.code-block,.math-block,.checklist-item"));
  }, []);

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChangeRef.current(editorRef.current.innerHTML);
      updateWordCount();
    }
  }, [updateWordCount]);

  /** Removes inline colours that would be unreadable on the current theme background
   *  (e.g. white text picked in dark mode, then switching to light). */
  const fixContrast = useCallback((themeBg: string) => {
    const root = editorRef.current;
    if (!root) return false;
    const bgRgb = parseRgb(normalizeColor(themeBg));
    if (!bgRgb) return false;
    const bgL = luminance(bgRgb);
    let changed = false;
    root.querySelectorAll<HTMLElement>("*").forEach(el => {
      if (el.closest(".code-block, .math-block, mark, kbd, code, th")) return;
      const ownBg = el.style.backgroundColor ? parseRgb(el.style.backgroundColor) : null;
      if (ownBg && ownBg[3] >= 0.5) {
        // Element paints its own background: make sure its text is readable on it.
        const fg = parseRgb(getComputedStyle(el).color);
        if (fg && contrast(luminance(fg), luminance(ownBg)) < 3) {
          el.style.color = luminance(ownBg) > 0.4 ? "#0F172A" : "#F8FAFC";
          changed = true;
        }
        return;
      }
      const raw = el.style.color || (el.tagName === "FONT" ? el.getAttribute("color") || "" : "");
      if (!raw) return;
      const rgb = parseRgb(normalizeColor(raw));
      if (rgb && rgb[3] > 0.2 && contrast(luminance(rgb), bgL) < 3) {
        el.style.removeProperty("color");
        if (el.tagName === "FONT") el.removeAttribute("color");
        changed = true;
      }
    });
    return changed;
  }, []);

  // Sync external value changes into the DOM (not our own typing)
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    if (root.innerHTML !== (value || "")) {
      root.innerHTML = value || "";
      fixContrast(THEMES[themeRef.current].bg);
    }
    updateWordCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Re-check readability whenever the theme flips.
  useEffect(() => {
    if (fixContrast(THEMES[theme].bg)) syncContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  /* ── selection handling ── */
  const focusEditor = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    const sel = window.getSelection();
    const inside = !!sel && sel.rangeCount > 0 && root.contains(sel.anchorNode);
    if (!inside && savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    root.focus({ preventScroll: true });
  }, []);

  // Reflects the current selection's formatting onto the toolbar and remembers the
  // last in-editor selection so toolbar popovers/inputs can restore it.
  const refreshActiveState = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !root.contains(sel.anchorNode)) return;
    savedRange.current = sel.getRangeAt(0).cloneRange();

    let blockTag = "P";
    try {
      const tag = document.queryCommandValue("formatBlock");
      if (tag) blockTag = tag.toUpperCase().replace(/[<>]/g, "");
    } catch { /* noop */ }
    if (!BLOCKS.some(b => b.value === blockTag)) blockTag = "P";

    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      subscript: document.queryCommandState("subscript"),
      superscript: document.queryCommandState("superscript"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      block: blockTag,
    });

    // line spacing of the block under the caret
    let el: Node | null = sel.anchorNode;
    while (el && el !== root && !(el instanceof HTMLElement && (el.tagName === "LI" || el.parentNode === root))) el = el.parentNode;
    if (el instanceof HTMLElement && el !== root) {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight);
      const fs = parseFloat(cs.fontSize);
      setLineSpacing(Number.isFinite(lh) && fs ? Math.round((lh / fs) * 100) / 100 : 1.2);
    }

    const picked = sel.toString().trim();
    setSelWords(picked ? picked.split(/\s+/).length : 0);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActiveState);
    return () => document.removeEventListener("selectionchange", refreshActiveState);
  }, [refreshActiveState]);

  // close popovers on outside click
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-re-menu]")) setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

  /* ── commands ── */
  const exec = useCallback((command: string, val?: string) => {
    focusEditor();
    if (command === "foreColor") document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, val);
    if (command === "foreColor") document.execCommand("styleWithCSS", false, "false");
    syncContent();
    refreshActiveState();
  }, [focusEditor, syncContent, refreshActiveState]);

  const wrapRange = (tag: string, styleKey: "fontSize" | "fontFamily", val: string) => {
    focusEditor();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement(tag);
    span.style[styleKey] = val;
    if (range.collapsed) {
      span.appendChild(document.createTextNode("\u200B"));
      range.insertNode(span);
      range.setStartAfter(span); range.collapse(true);
      sel.removeAllRanges(); sel.addRange(range);
    } else {
      try { range.surroundContents(span); } catch {
        const frag = range.extractContents(); span.appendChild(frag); range.insertNode(span);
      }
    }
    syncContent();
  };
  const applyFontSize = (size: string) => wrapRange("span", "fontSize", size);
  const applyFontFamily = (font: string) => wrapRange("span", "fontFamily", font === "inherit" ? "" : font);

  const applyBlock = useCallback((tag: string) => {
    focusEditor();
    document.execCommand("formatBlock", false, `<${tag}>`);
    syncContent();
    refreshActiveState();
  }, [focusEditor, syncContent, refreshActiveState]);

  const reset = () => {
    if (!confirm("Clear all content in this field? This can't be undone.")) return;
    if (editorRef.current) { editorRef.current.innerHTML = ""; onChangeRef.current(""); updateWordCount(); }
  };

  const applyGradient = (gradient: string) => {
    focusEditor();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { flash("Select some text first, then pick a gradient."); return; }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundImage = gradient;
    span.style.webkitBackgroundClip = "text";
    span.style.webkitTextFillColor = "transparent";
    span.style.backgroundClip = "text";
    try { range.surroundContents(span); } catch {
      const frag = range.extractContents(); span.appendChild(frag); range.insertNode(span);
    }
    setMenu(null); syncContent();
  };

  const insertOrderedList = (listType: string) => {
    focusEditor();
    document.execCommand("insertOrderedList", false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      while (node && (node as Element).tagName !== "OL") node = node.parentNode;
      if (node) (node as HTMLElement).style.listStyleType = listType;
    }
    syncContent();
  };

  const insertLink = () => {
    focusEditor();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { flash("Select some text first, then add a link."); return; }
    let url = window.prompt("Link URL:", "https://")?.trim();
    if (!url) return;
    if (!/^(https?:|mailto:|tel:|#|\/)/i.test(url)) url = `https://${url}`;
    focusEditor();
    document.execCommand("createLink", false, url);
    syncContent();
  };

  // Wraps the selection in an element with inline styles (inline-code, highlight, kbd).
  const wrapSelection = (tagName: string, styleText: string, promptIfEmpty?: string) => {
    focusEditor();
    const sel = window.getSelection();
    const hasSelection = !!sel && !sel.isCollapsed;
    if (!hasSelection && promptIfEmpty) {
      const text = window.prompt(promptIfEmpty, "");
      if (!text) return;
      focusEditor();
      document.execCommand("insertHTML", false, `<${tagName} style="${styleText}">${escapeHtml(text)}</${tagName}>`);
      syncContent();
      return;
    }
    if (!sel || sel.rangeCount === 0 || !hasSelection) { flash("Select some text first."); return; }
    const range = sel.getRangeAt(0);
    const el = document.createElement(tagName);
    el.style.cssText = styleText;
    try { range.surroundContents(el); } catch {
      const frag = range.extractContents(); el.appendChild(frag); range.insertNode(el);
    }
    syncContent();
  };
  const toggleInlineCode = () => wrapSelection("code", INLINE_CODE_STYLE);
  const toggleHighlight = () => wrapSelection("mark", MARK_STYLE);
  const insertKbd = () => wrapSelection("kbd", KBD_STYLE, "Key or shortcut (e.g. Ctrl+S):");

  const insertHTML = (html: string) => {
    focusEditor();
    document.execCommand("insertHTML", false, html);
    syncContent();
  };
  const insertHR = () => { focusEditor(); document.execCommand("insertHorizontalRule"); syncContent(); };
  const clearFormatting = () => {
    focusEditor();
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    syncContent();
  };
  const insertChecklist = () => insertHTML(CHECKLIST_HTML);

  const insertTable = () => {
    const th = `padding:8px 12px;border:1px solid ${v("table-border", "rgba(255,255,255,0.15)")};background:${v("th-bg", "rgba(56,189,248,0.1)")};color:${v("th-fg", "#38BDF8")};font-weight:600;text-align:left;`;
    const td = `padding:8px 12px;border:1px solid ${v("table-border", "rgba(255,255,255,0.15)")};`;
    const row = `<tr><td style="${td}">&nbsp;</td><td style="${td}">&nbsp;</td><td style="${td}">&nbsp;</td></tr>`;
    insertHTML(
      `<table style="border-collapse:collapse;width:100%;margin:1em 0;font-size:0.9em;">` +
      `<thead><tr><th style="${th}">Column 1</th><th style="${th}">Column 2</th><th style="${th}">Column 3</th></tr></thead>` +
      `<tbody>${row}${row}</tbody></table><p><br></p>`
    );
  };

  const insertMathBlock = () => {
    const formula = window.prompt("Formula or expression (plain text / LaTeX-style notation):", "E = mc^2");
    if (!formula) return;
    insertHTML(
      `<div class="math-block" style="margin:1em 0;padding:14px 20px;background:${v("math-bg", "rgba(124,58,237,0.08)")};` +
      `border:1px solid ${v("math-border", "rgba(124,58,237,0.25)")};border-radius:10px;font-family:Georgia,'Times New Roman',serif;` +
      `font-style:italic;font-size:1.1em;color:${v("math-fg", "#DDD6FE")};text-align:center;">${escapeHtml(formula)}</div><p><br></p>`
    );
  };

  const insertImageByUrl = () => {
    const url = window.prompt("Image URL:", "https://")?.trim();
    if (!url) return;
    if (!/^(https?:\/\/|data:image\/)/i.test(url)) { flash("Image URLs must start with https:// or http://"); return; }
    const alt = window.prompt("Alt text (for accessibility):", "") || "";
    insertHTML(
      `<img src="${url.replace(/"/g, "&quot;")}" alt="${alt.replace(/"/g, "&quot;")}" style="max-width:100%;border-radius:10px;margin:1em 0;display:block;" />`
    );
  };

  const insertCode = () => {
    if (!codeContent.trim()) return;
    const escaped = escapeHtml(codeContent);

    // OUTER: overflow must NOT be hidden — that kills the scroll inside cb-body
    const outerStyle = `position:relative;background:${v("code-bg", "#0D1117")};border-radius:12px;overflow:visible;max-width:100%;margin:1.5rem 0;border:1px solid ${v("code-border", "rgba(255,255,255,0.12)")};font-family:'Fira Code','Courier New',monospace;box-shadow:0 4px 24px rgba(0,0,0,0.25);`;
    const headerStyle = `display:flex;align-items:center;padding:8px 16px;background:${v("code-header", "#161B22")};border-radius:12px 12px 0 0;border-bottom:1px solid ${v("code-border", "rgba(255,255,255,0.08)")};`;
    const langStyle = `color:${v("code-muted", "#8B949E")};font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;`;
    // BODY: scrolls horizontally AND vertically, never clips
    const bodyStyle = "position:relative;overflow-x:auto;overflow-y:auto;max-height:520px;border-radius:0 0 12px 12px;";
    const preStyle = "margin:0;padding:16px;white-space:pre;word-break:normal;overflow-wrap:normal;tab-size:2;min-width:max-content;";
    const codeStyle = `font-family:'Fira Code','Courier New',monospace;font-size:0.875rem;color:${v("code-fg", "#E6EDF3")};line-height:1.7;white-space:pre;display:block;`;
    const copyBtnStyle = `position:sticky;float:right;top:8px;right:8px;z-index:10;background:${v("code-btn-bg", "rgba(30,41,59,0.92)")};border:1px solid ${v("code-btn-border", "rgba(255,255,255,0.15)")};color:${v("code-muted", "#8B949E")};font-size:11px;padding:5px 12px;border-radius:7px;cursor:pointer;font-family:monospace;opacity:0;transition:opacity 0.2s,color 0.2s,background 0.2s;pointer-events:none;margin:8px 8px 0 0;display:inline-block;backdrop-filter:blur(4px);`;

    const codeBlock = [
      `<div class="code-block" style="${outerStyle}" onmouseover="${CB_SHOW}" onmouseout="${CB_HIDE}">`,
      `<div class="cb-header" style="${headerStyle}"><span class="cb-lang" style="${langStyle}">${codeLang}</span></div>`,
      `<div class="cb-body" style="${bodyStyle}">`,
      `<button class="cb-copy-btn" onclick="${CB_COPY}" style="${copyBtnStyle}">⎘ Copy</button>`,
      `<pre style="${preStyle}"><code style="${codeStyle}">${escaped}</code></pre>`,
      `</div></div><p><br></p>`,
    ].join("");

    insertHTML(codeBlock);
    setCodeContent(""); setShowCodeEditor(false);
  };

  /* ── line spacing ── */
  const collectBlocks = (el: Element, out: HTMLElement[], range?: Range) => {
    if (el.tagName === "UL" || el.tagName === "OL") {
      el.querySelectorAll("li").forEach(li => { if (!range || range.intersectsNode(li)) out.push(li as HTMLElement); });
    } else {
      out.push(el as HTMLElement);
    }
  };

  const applyLineSpacing = (raw: number, scope: "selection" | "document") => {
    const root = editorRef.current;
    if (!root || !Number.isFinite(raw)) { flash("Enter a number between 0.8 and 5."); return; }
    const value = Math.round(Math.min(5, Math.max(0.8, raw)) * 100) / 100;
    focusEditor();
    const blocks: HTMLElement[] = [];

    if (scope === "document") {
      Array.from(root.children).forEach(c => collectBlocks(c, blocks));
    } else {
      let sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !root.contains(sel.anchorNode)) return;
      let r = sel.getRangeAt(0);
      let first = topLevelOf(root, r.startContainer, r.startOffset, false);
      if (first && first.nodeType === Node.TEXT_NODE) {
        // loose text directly in the editor: give it a paragraph so it can carry spacing
        document.execCommand("formatBlock", false, "<p>");
        sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        r = sel.getRangeAt(0);
        first = topLevelOf(root, r.startContainer, r.startOffset, false);
      }
      const last = topLevelOf(root, r.endContainer, r.endOffset, true);
      const kids = Array.from(root.childNodes);
      const s = first ? kids.indexOf(first as ChildNode) : -1;
      const e = last ? kids.indexOf(last as ChildNode) : -1;
      if (s < 0 || e < 0) return;
      for (let i = Math.min(s, e); i <= Math.max(s, e); i++) {
        const k = kids[i];
        if (k.nodeType === Node.ELEMENT_NODE) collectBlocks(k as Element, blocks, r);
      }
    }

    if (!blocks.length) return;
    blocks.forEach(b => { b.style.lineHeight = String(value); });
    setLineSpacing(value);
    setCustomSpacing(String(value));
    setMenu(null);
    syncContent();
    refreshActiveState();
  };

  /* ── find & replace ── */
  type Hit = { node: Text; start: number };
  const collectHits = (): Hit[] => {
    const root = editorRef.current;
    if (!root || !findText) return [];
    const needle = matchCase ? findText : findText.toLowerCase();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const hits: Hit[] = [];
    let n: Node | null;
    // eslint-disable-next-line no-cond-assign
    while ((n = walker.nextNode())) {
      const raw = n.textContent || "";
      const text = matchCase ? raw : raw.toLowerCase();
      let i = text.indexOf(needle);
      while (i !== -1) { hits.push({ node: n as Text, start: i }); i = text.indexOf(needle, i + needle.length); }
    }
    return hits;
  };

  // live match count + highlight every match (CSS Custom Highlight API where available)
  useEffect(() => {
    const hl = typeof CSS !== "undefined" ? (CSS as unknown as { highlights?: Map<string, unknown> }).highlights : undefined;
    if (!showFindReplace || !findText) { setMatchCount(0); hl?.delete("re-find"); return; }
    const hits = collectHits();
    setMatchCount(hits.length);
    const HighlightCtor = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
    if (hl && HighlightCtor) {
      const ranges = hits.map(h => {
        const r = document.createRange();
        r.setStart(h.node, h.start); r.setEnd(h.node, h.start + findText.length);
        return r;
      });
      hl.set("re-find", new HighlightCtor(...ranges));
    }
    return () => { hl?.delete("re-find"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findText, matchCase, showFindReplace, value]);

  const findNext = (backwards = false) => {
    const hits = collectHits();
    if (!hits.length) { flash("No matches"); return; }
    const cur = savedRange.current;
    const before = (h: Hit) => { try { return cur!.comparePoint(h.node, h.start); } catch { return 1; } };
    let pick: Hit | undefined;
    if (cur) {
      if (!backwards) pick = hits.find(h => { const c = before(h); return c === 1 || (c === 0 && cur.collapsed); });
      else pick = [...hits].reverse().find(h => before(h) === -1);
    }
    if (!pick) pick = backwards ? hits[hits.length - 1] : hits[0]; // wrap around
    const r = document.createRange();
    r.setStart(pick.node, pick.start); r.setEnd(pick.node, pick.start + findText.length);
    const sel = window.getSelection();
    sel?.removeAllRanges(); sel?.addRange(r);
    savedRange.current = r.cloneRange();
    pick.node.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const replaceOne = () => {
    const r = savedRange.current;
    if (r && findText) {
      const t = r.toString();
      const same = matchCase ? t === findText : t.toLowerCase() === findText.toLowerCase();
      if (same) {
        focusEditor();
        if (replaceText) document.execCommand("insertText", false, replaceText);
        else document.execCommand("delete");
        syncContent();
      }
    }
    findNext(false);
  };

  const replaceAll = () => {
    const root = editorRef.current;
    if (!root || !findText) return;
    const re = new RegExp(escapeRegExp(findText), matchCase ? "g" : "gi");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let n: Node | null;
    // eslint-disable-next-line no-cond-assign
    while ((n = walker.nextNode())) nodes.push(n as Text);
    let count = 0;
    nodes.forEach(node => {
      const text = node.textContent || "";
      const next = text.replace(re, () => { count++; return replaceText; });
      if (next !== text) node.textContent = next;
    });
    syncContent();
    flash(count === 0 ? `"${findText}" not found` : `Replaced ${count} match${count === 1 ? "" : "es"}`);
  };

  /* ── export ── */
  const buildExportHtml = () => {
    const html = editorRef.current?.innerHTML ?? "";
    const vars = Object.entries(THEMES.light).map(([k, val]) => `--re-${k}:${val};`).join("");
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Document</title>` +
      `<style>:root{${vars}}body{margin:40px auto;max-width:820px;padding:0 24px;font:16px/${DEFAULT_LINE_HEIGHT} system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--re-text);background:#fff}` +
      `${contentCss("body")}.cb-copy-btn{display:none!important}@media print{.cb-body{max-height:none!important;overflow:visible!important}.code-block{break-inside:avoid}}</style></head><body>${html}</body></html>`;
  };

  const exportAs = (kind: "html" | "text" | "print") => {
    setMenu(null);
    if (kind === "html") download("document.html", "text/html;charset=utf-8", buildExportHtml());
    else if (kind === "text") download("document.txt", "text/plain;charset=utf-8", editorRef.current?.innerText ?? "");
    else {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        const w = iframe.contentWindow;
        if (!w) return;
        w.onafterprint = () => iframe.remove();
        w.focus(); w.print();
        setTimeout(() => iframe.remove(), 60000);
      };
      iframe.srcdoc = buildExportHtml();
    }
  };

  /* ── keyboard: shortcuts + markdown-style autoformat ── */
  const tryMarkdownShortcut = (): boolean => {
    const root = editorRef.current;
    const sel = window.getSelection();
    if (!root || !sel || !sel.isCollapsed || !sel.anchorNode || !root.contains(sel.anchorNode)) return false;
    const anchor = sel.anchorNode;
    const offset = sel.anchorOffset;
    let block: Node | null = anchor;
    while (block && block.parentNode !== root) block = block.parentNode;
    if (!block || !["P", "DIV", "#text"].includes(block.nodeName)) return false;

    const pre = document.createRange();
    pre.selectNodeContents(block);
    pre.setEnd(anchor, offset);
    const trigger = pre.toString();

    let action: (() => void) | null = null;
    if (trigger === "#") action = () => document.execCommand("formatBlock", false, "<h1>");
    else if (trigger === "##") action = () => document.execCommand("formatBlock", false, "<h2>");
    else if (trigger === "###") action = () => document.execCommand("formatBlock", false, "<h3>");
    else if (trigger === ">") action = () => document.execCommand("formatBlock", false, "<blockquote>");
    else if (trigger === "-" || trigger === "*") action = () => document.execCommand("insertUnorderedList");
    else if (trigger === "1.") action = () => document.execCommand("insertOrderedList");
    else if (trigger === "[]" || trigger === "[ ]") action = () => document.execCommand("insertHTML", false, CHECKLIST_HTML);
    if (!action) return false;

    if (block.nodeName === "#text") {
      const p = document.createElement("p");
      root.insertBefore(p, block);
      p.appendChild(block);
      block = p;
    }
    const el = block as HTMLElement;
    const clear = document.createRange();
    clear.selectNodeContents(el);
    clear.setEnd(anchor, offset);
    clear.deleteContents();
    if (!el.textContent) el.innerHTML = "<br>";
    const caret = document.createRange();
    caret.setStart(el, 0); caret.collapse(true);
    sel.removeAllRanges(); sel.addRange(caret);

    action();
    syncContent();
    refreshActiveState();
    return true;
  };

  const openFind = () => {
    const picked = window.getSelection()?.toString().trim();
    if (picked && !picked.includes("\n") && picked.length < 80) setFindText(picked);
    setShowFindReplace(true);
    setMenu(null);
  };

  const handleKeyDown = (e: RKeyboardEvent<HTMLDivElement>) => {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && e.altKey && /^Digit[0-3]$/.test(e.code)) {
      e.preventDefault();
      applyBlock(["P", "H1", "H2", "H3"][Number(e.code.slice(5))]);
      return;
    }
    if (mod && !e.altKey) {
      if (key === "k") { e.preventDefault(); insertLink(); return; }
      if (key === "h") { e.preventDefault(); if (e.shiftKey) toggleHighlight(); else openFind(); return; }
      if (e.shiftKey && key === "x") { e.preventDefault(); exec("strikeThrough"); return; }
      if (e.key === "\\") { e.preventDefault(); clearFormatting(); return; }
    }
    if (e.key === "Tab" && !mod && !e.altKey) {
      const node = window.getSelection()?.anchorNode;
      const el = node instanceof Element ? node : node?.parentElement;
      if (el?.closest("li")) { e.preventDefault(); exec(e.shiftKey ? "outdent" : "indent"); return; }
    }
    if (e.key === " " && !mod && !e.altKey && !e.shiftKey && !e.nativeEvent.isComposing) {
      if (tryMarkdownShortcut()) e.preventDefault();
    }
  };

  const handleRootKeyDown = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    if (showShortcuts) setShowShortcuts(false);
    else if (menu) setMenu(null);
    else if (showFindReplace) { setShowFindReplace(false); focusEditor(); }
    else if (isFullscreen) setIsFullscreen(false);
  };

  const handlePaste = (e: RClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (!html && !text) return;
    e.preventDefault();
    if (html) document.execCommand("insertHTML", false, sanitizePastedHtml(html));
    else document.execCommand("insertText", false, text);
    syncContent();
  };

  const handleFocus = () => {
    const root = editorRef.current;
    if (!root) return;
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch { /* noop */ }
    if (!root.firstChild || (root.childNodes.length === 1 && root.firstChild.nodeName === "BR")) {
      root.innerHTML = "<p><br></p>";
      const r = document.createRange();
      r.setStart(root.firstChild as Node, 0); r.collapse(true);
      const s = window.getSelection();
      s?.removeAllRanges(); s?.addRange(r);
    }
    refreshActiveState();
  };

  /* ───────────────────────────── RENDER ───────────────────────────── */
  const readMin = wordCount.words ? Math.max(1, Math.ceil(wordCount.words / 200)) : 0;

  const css = `
    .re-root { font-family: inherit; }
    .re-toolbar { background: var(--re-toolbar); display: flex; flex-wrap: wrap; gap: 3px; align-items: center; border-bottom: 1px solid var(--re-border-soft); position: sticky; top: 0; z-index: 20; }
    .re-btn { padding: 6px 8px; border-radius: 7px; border: none; background: transparent; color: var(--re-muted); cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 12px; font-family: inherit; transition: background .15s, color .15s; }
    .re-btn:hover { background: var(--re-hover); color: var(--re-text); }
    .re-btn.is-active { background: var(--re-accent-bg); color: var(--re-accent); }
    .re-btn.is-danger { color: var(--re-danger); }
    .re-btn:focus-visible, .re-select:focus-visible, .re-input:focus-visible, .re-pill:focus-visible, .re-item:focus-visible { outline: 2px solid var(--re-accent); outline-offset: 1px; }
    .re-sep-v { width: 1px; background: var(--re-border); margin: 0 3px; align-self: stretch; }
    .re-select { background: var(--re-control-bg); border: 1px solid var(--re-control-border); color: var(--re-control-text); border-radius: 6px; padding: 4px 6px; font-size: 12px; cursor: pointer; outline: none; font-family: inherit; }
    .re-select option { background: var(--re-popover); color: var(--re-text); }
    .re-input { background: var(--re-control-bg); border: 1px solid var(--re-control-border); color: var(--re-text); border-radius: 6px; padding: 5px 8px; font-size: 12px; outline: none; font-family: inherit; min-width: 0; }
    .re-input::placeholder { color: var(--re-placeholder); }
    .re-pill { background: var(--re-control-bg); border: 1px solid var(--re-control-border); color: var(--re-control-text); border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .re-pill:hover { background: var(--re-hover); color: var(--re-text); }
    .re-pill.is-active { background: var(--re-accent-bg); color: var(--re-accent); border-color: var(--re-accent); }
    .re-pill.is-primary { background: var(--re-accent); color: var(--re-on-accent); border-color: transparent; font-weight: 600; }
    .re-pill.is-primary:hover { filter: brightness(1.08); }
    .re-pop { position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 50; background: var(--re-popover); color: var(--re-text); border: 1px solid var(--re-border); border-radius: 10px; padding: 6px; box-shadow: 0 8px 28px rgba(0,0,0,0.28); max-width: calc(100vw - 32px); }
    .re-pop.align-right { left: auto; right: 0; }
    .re-pop-title { display: block; color: var(--re-faint); font-size: 11px; padding: 4px 8px; }
    .re-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 6px 8px; border-radius: 6px; border: none; background: transparent; color: var(--re-text); font-size: 12px; font-family: inherit; cursor: pointer; text-align: left; }
    .re-item:hover { background: var(--re-hover); }
    .re-rule { height: 1px; background: var(--re-border-soft); margin: 6px 0; }
    .re-panel { background: var(--re-toolbar); border-bottom: 1px solid var(--re-border-soft); display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .re-kbd { background: var(--re-kbd-bg); color: var(--re-kbd-fg); border: 1px solid var(--re-kbd-border); border-bottom-width: 2px; border-radius: 5px; padding: 1px 7px; font-family: 'Fira Code','Courier New',monospace; font-size: 11px; white-space: nowrap; }
    .re-area ::selection { background: var(--re-selection); }
    .re-area ul, .re-area ol { margin: 0 0 0.75em; }
    ::highlight(re-find) { background-color: #FDE68A; color: #1A1200; }
    ${contentCss(".re-area")}
    @media (prefers-reduced-motion: reduce) { .re-btn { transition: none; } }
  `;

  return (
    <div
      className="re-root"
      data-theme={theme}
      onKeyDown={handleRootKeyDown}
      style={{
        ...themeVars(theme),
        border: "1px solid var(--re-border)", borderRadius: 12, overflow: "hidden",
        display: "flex", flexDirection: "column",
        background: "var(--re-bg)", color: "var(--re-text)",
        position: isFullscreen ? "fixed" : "relative",
        ...(isFullscreen ? { inset: 20, zIndex: 1000, boxShadow: "var(--re-shadow)" } : {}),
      }}
    >
      <style>{css}</style>

      {/* TOOLBAR */}
      <div className="re-toolbar" role="toolbar" aria-label="Formatting" style={{ padding: `8px ${PAD_X}px` }}>
        <ToolBtn title="Undo (Ctrl+Z)" onAct={() => exec("undo")}><Undo2 size={14} /></ToolBtn>
        <ToolBtn title="Redo (Ctrl+Shift+Z)" onAct={() => exec("redo")}><Redo2 size={14} /></ToolBtn>

        <Sep />

        <select className="re-select" style={{ maxWidth: 118 }} value={active.block}
          onChange={e => applyBlock(e.target.value)} title="Paragraph style" aria-label="Paragraph style">
          {BLOCKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select className="re-select" style={{ maxWidth: 110 }} defaultValue="inherit"
          onChange={e => applyFontFamily(e.target.value)} title="Font family" aria-label="Font family">
          {FONTS.map(f => <option key={f} value={f === "Default" ? "inherit" : f}>{f}</option>)}
        </select>
        <select className="re-select" style={{ width: 68 }} defaultValue="16px"
          onChange={e => applyFontSize(e.target.value)} title="Font size" aria-label="Font size">
          {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <Sep />

        <ToolBtn title="Bold (Ctrl+B)" active={active.bold} onAct={() => exec("bold")}><Bold size={14} /></ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={active.italic} onAct={() => exec("italic")}><Italic size={14} /></ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={active.underline} onAct={() => exec("underline")}><Underline size={14} /></ToolBtn>
        <ToolBtn title="Strikethrough (Ctrl+Shift+X)" active={active.strikeThrough} onAct={() => exec("strikeThrough")}><Strikethrough size={14} /></ToolBtn>
        <ToolBtn title="Subscript" active={active.subscript} onAct={() => exec("subscript")}><Subscript size={14} /></ToolBtn>
        <ToolBtn title="Superscript" active={active.superscript} onAct={() => exec("superscript")}><Superscript size={14} /></ToolBtn>
        <ToolBtn title="Inline code (select text first)" onAct={toggleInlineCode}><Code size={14} /></ToolBtn>
        <ToolBtn title="Highlight (Ctrl+Shift+H)" onAct={toggleHighlight}><Highlighter size={14} /></ToolBtn>
        <ToolBtn title="Clear formatting (Ctrl+\)" onAct={clearFormatting}><Eraser size={14} /></ToolBtn>

        <Sep />

        <ToolBtn title="Heading 1 (Ctrl+Alt+1)" active={active.block === "H1"} onAct={() => applyBlock(active.block === "H1" ? "P" : "H1")}><Heading1 size={14} /></ToolBtn>
        <ToolBtn title="Heading 2 (Ctrl+Alt+2)" active={active.block === "H2"} onAct={() => applyBlock(active.block === "H2" ? "P" : "H2")}><Heading2 size={14} /></ToolBtn>
        <ToolBtn title="Quote" active={active.block === "BLOCKQUOTE"} onAct={() => applyBlock(active.block === "BLOCKQUOTE" ? "P" : "BLOCKQUOTE")}><Quote size={14} /></ToolBtn>

        <Sep />

        {/* Font colour */}
        <label className="re-btn" title="Text color" style={{ cursor: "pointer", position: "relative" }}>
          <Palette size={14} />
          <span aria-hidden="true" style={{ position: "absolute", left: 8, right: 8, bottom: 2, height: 2, borderRadius: 1, background: textColor }} />
          <input type="color" value={textColor} aria-label="Text color"
            style={{ width: 0, height: 0, opacity: 0, position: "absolute", pointerEvents: "none" }}
            onChange={e => { setTextColor(e.target.value); exec("foreColor", e.target.value); }} />
        </label>

        {/* Gradient */}
        <div data-re-menu style={{ position: "relative" }}>
          <ToolBtn title="Gradient text (select text first)" active={menu === "gradient"} onAct={() => setMenu(menu === "gradient" ? null : "gradient")}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "linear-gradient(90deg,#0EA5E9,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>G</span>
          </ToolBtn>
          {menu === "gradient" && (
            <div className="re-pop" style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160, padding: 10 }}>
              <span className="re-pop-title" style={{ padding: 0 }}>Select text first, then pick a gradient</span>
              {GRADIENTS.map((g, i) => (
                <button key={i} type="button" aria-label={`Gradient ${i + 1}`}
                  onMouseDown={e => { e.preventDefault(); applyGradient(g); }}
                  style={{ background: g, border: "none", borderRadius: 6, height: 24, cursor: "pointer" }} />
              ))}
            </div>
          )}
        </div>

        <Sep />

        <ToolBtn title="Align left" active={active.justifyLeft} onAct={() => exec("justifyLeft")}><AlignLeft size={14} /></ToolBtn>
        <ToolBtn title="Align center" active={active.justifyCenter} onAct={() => exec("justifyCenter")}><AlignCenter size={14} /></ToolBtn>
        <ToolBtn title="Align right" active={active.justifyRight} onAct={() => exec("justifyRight")}><AlignRight size={14} /></ToolBtn>
        <ToolBtn title="Justify" active={active.justifyFull} onAct={() => exec("justifyFull")}><AlignJustify size={14} /></ToolBtn>

        {/* Line spacing */}
        <div data-re-menu style={{ position: "relative" }}>
          <ToolBtn title="Line spacing" active={menu === "spacing"}
            onAct={() => { setCustomSpacing(fmtSpacing(lineSpacing)); setMenu(menu === "spacing" ? null : "spacing"); }}>
            <ArrowUpDown size={14} />
            <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 20 }}>{fmtSpacing(lineSpacing)}</span>
          </ToolBtn>
          {menu === "spacing" && (
            <div className="re-pop" role="menu" aria-label="Line spacing" style={{ minWidth: 220 }}>
              <span className="re-pop-title">Line spacing</span>
              {SPACING_PRESETS.map(p => (
                <button key={p.value} type="button" role="menuitemradio" aria-checked={Math.abs(p.value - lineSpacing) < 0.005}
                  className="re-item"
                  onMouseDown={e => { e.preventDefault(); applyLineSpacing(p.value, spacingScope); }}>
                  <span>{p.label}</span>
                  {Math.abs(p.value - lineSpacing) < 0.005 && <Check size={13} />}
                </button>
              ))}
              <div className="re-rule" />
              <label className="re-pop-title" htmlFor="re-custom-spacing">Custom</label>
              <div style={{ display: "flex", gap: 6, padding: "0 4px 4px" }}>
                <input id="re-custom-spacing" className="re-input" type="number" min={0.8} max={5} step={0.05}
                  value={customSpacing} onChange={e => setCustomSpacing(e.target.value)} placeholder="e.g. 1.75"
                  style={{ width: 90 }}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyLineSpacing(parseFloat(customSpacing), spacingScope); } }} />
                <button type="button" className="re-pill is-primary" onClick={() => applyLineSpacing(parseFloat(customSpacing), spacingScope)}>Apply</button>
              </div>
              <div className="re-rule" />
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 6px", fontSize: 12, cursor: "pointer", color: "var(--re-control-text)" }}>
                <input type="checkbox" checked={spacingScope === "document"}
                  onChange={e => setSpacingScope(e.target.checked ? "document" : "selection")}
                  style={{ accentColor: "var(--re-accent)" }} />
                Apply to whole document
              </label>
            </div>
          )}
        </div>

        <Sep />

        <ToolBtn title="Bullet list" active={active.insertUnorderedList} onAct={() => exec("insertUnorderedList")}><List size={14} /></ToolBtn>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ToolBtn title="Numbered list" active={active.insertOrderedList} onAct={() => insertOrderedList("decimal")}><ListOrdered size={14} /></ToolBtn>
          <select className="re-select" style={{ width: 46, padding: "3px 4px" }}
            onChange={e => insertOrderedList(e.target.value)} defaultValue="decimal" title="List style" aria-label="Numbered list style">
            {LIST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <ToolBtn title="Indent" onAct={() => exec("indent")}><Indent size={14} /></ToolBtn>
        <ToolBtn title="Outdent" onAct={() => exec("outdent")}><Outdent size={14} /></ToolBtn>

        <Sep />

        <ToolBtn title="Add link (Ctrl+K)" onAct={insertLink}><Link2 size={14} /></ToolBtn>
        <ToolBtn title="Remove link" onAct={() => exec("unlink")}><Unlink size={14} /></ToolBtn>

        <Sep />

        <ToolBtn title="Insert image" onAct={insertImageByUrl}><ImagePlus size={14} /></ToolBtn>
        <ToolBtn title="Insert table" onAct={insertTable}><Table size={14} /></ToolBtn>
        <ToolBtn title="Insert checklist" onAct={insertChecklist}><CheckSquare size={14} /></ToolBtn>
        <ToolBtn title="Insert formula" onAct={insertMathBlock}><Sigma size={14} /></ToolBtn>
        <ToolBtn title="Insert divider" onAct={insertHR}><SeparatorHorizontal size={14} /></ToolBtn>
        <ToolBtn title="Keyboard key" onAct={insertKbd}><span style={{ fontSize: 11, fontWeight: 600 }}>kbd</span></ToolBtn>

        {showCodeCanvas && (
          <>
            <Sep />
            <ToolBtn title="Insert code block" active={showCodeEditor} onAct={() => setShowCodeEditor(!showCodeEditor)}>
              <Code2 size={14} /><span>Code</span>
            </ToolBtn>
          </>
        )}

        {/* right-hand tools */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <ToolBtn title="Find & replace (Ctrl+H)" active={showFindReplace} onAct={() => (showFindReplace ? setShowFindReplace(false) : openFind())}><Search size={14} /></ToolBtn>
          <ToolBtn title="Keyboard shortcuts" onAct={() => setShowShortcuts(true)}><Keyboard size={14} /></ToolBtn>

          <div data-re-menu style={{ position: "relative" }}>
            <ToolBtn title="Export" active={menu === "export"} onAct={() => setMenu(menu === "export" ? null : "export")}><Download size={14} /></ToolBtn>
            {menu === "export" && (
              <div className="re-pop align-right" role="menu" aria-label="Export" style={{ minWidth: 200 }}>
                <button type="button" role="menuitem" className="re-item" onClick={() => exportAs("html")}><span>Download as HTML</span><Download size={13} /></button>
                <button type="button" role="menuitem" className="re-item" onClick={() => exportAs("text")}><span>Download as text</span><Download size={13} /></button>
                <button type="button" role="menuitem" className="re-item" onClick={() => exportAs("print")}><span>Print / save as PDF</span><Printer size={13} /></button>
              </div>
            )}
          </div>

          <Sep />

          <ToolBtn title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onAct={toggleTheme}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </ToolBtn>
          <ToolBtn title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} active={isFullscreen} onAct={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </ToolBtn>
          <ToolBtn title="Clear all content" danger onAct={reset}><RotateCcw size={13} /><span>Reset</span></ToolBtn>
        </div>
      </div>

      {/* FIND & REPLACE */}
      {showFindReplace && (
        <div className="re-panel" role="search" style={{ padding: `8px ${PAD_X}px` }}>
          <Search size={14} color="var(--re-faint)" aria-hidden="true" />
          <input className="re-input" autoFocus placeholder="Find" aria-label="Find" value={findText} style={{ width: 150 }}
            onChange={e => setFindText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); findNext(e.shiftKey); } }} />
          <span aria-live="polite" style={{ fontSize: 11, color: "var(--re-faint)", minWidth: 58 }}>
            {findText ? `${matchCount} found` : ""}
          </span>
          <button type="button" className="re-btn" title="Previous match (Shift+Enter)" aria-label="Previous match" onClick={() => findNext(true)}><ChevronUp size={14} /></button>
          <button type="button" className="re-btn" title="Next match (Enter)" aria-label="Next match" onClick={() => findNext(false)}><ChevronDown size={14} /></button>
          <button type="button" className={`re-pill${matchCase ? " is-active" : ""}`} aria-pressed={matchCase} title="Match case" onClick={() => setMatchCase(!matchCase)}>Aa</button>
          <input className="re-input" placeholder="Replace with" aria-label="Replace with" value={replaceText} style={{ width: 150 }}
            onChange={e => setReplaceText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); replaceOne(); } }} />
          <button type="button" className="re-pill" onClick={replaceOne}>Replace</button>
          <button type="button" className="re-pill is-primary" onClick={replaceAll}>Replace all</button>
          <button type="button" className="re-btn" style={{ marginLeft: "auto" }} title="Close (Esc)" aria-label="Close find and replace"
            onClick={() => { setShowFindReplace(false); focusEditor(); }}><X size={14} /></button>
        </div>
      )}

      {/* CODE CANVAS */}
      {showCodeCanvas && showCodeEditor && (
        <div style={{ background: "var(--re-code-bg)", padding: 16, borderBottom: "1px solid var(--re-border-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Code2 size={16} color="var(--re-code-muted)" />
            <span style={{ color: "var(--re-code-muted)", fontSize: 12, fontFamily: "monospace" }}>CODE CANVAS — paste any code, format is preserved</span>
            <select className="re-select" value={codeLang} onChange={e => setCodeLang(e.target.value)} aria-label="Code language"
              style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11 }}>
              {["javascript", "typescript", "python", "kotlin", "sql", "bash", "jsx", "tsx", "html", "css", "json", "yaml", "dockerfile", "r", "c++", "rust", "go"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <textarea value={codeContent} onChange={e => setCodeContent(e.target.value)}
            placeholder="Paste your code here... indentation and spacing preserved exactly"
            aria-label="Code"
            rows={12}
            style={{ width: "100%", background: "var(--re-code-header)", border: "1px solid var(--re-code-border)", borderRadius: 8, color: "var(--re-code-fg)", fontFamily: "'Fira Code','Courier New',monospace", fontSize: 13, lineHeight: 1.6, padding: "12px 16px", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onKeyDown={e => {
              if (e.key === "Tab") {
                e.preventDefault();
                const s = e.currentTarget;
                const start = s.selectionStart, end = s.selectionEnd;
                const next = s.value.substring(0, start) + "  " + s.value.substring(end);
                setCodeContent(next);
                requestAnimationFrame(() => { s.selectionStart = s.selectionEnd = start + 2; });
              }
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={insertCode}
              style={{ background: "linear-gradient(135deg,#0EA5E9,#7C3AED)", border: "none", color: "white", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Insert Code Block
            </button>
            <button type="button" className="re-pill" onClick={() => setShowCodeEditor(false)} style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* EDITABLE AREA — padding matches the toolbar's PAD_X so content lines up under the icons */}
      <div style={{ position: "relative", flex: isFullscreen ? 1 : undefined, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {isEmpty && (
          <div aria-hidden="true" style={{ position: "absolute", top: 18, left: PAD_X, right: PAD_X, color: "var(--re-placeholder)", pointerEvents: "none", fontSize: 16, lineHeight: DEFAULT_LINE_HEIGHT }}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="re-area"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          spellCheck
          onInput={syncContent}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onMouseUp={refreshActiveState}
          onKeyUp={refreshActiveState}
          onFocus={handleFocus}
          style={{
            minHeight: `${minHeight}px`,
            flex: isFullscreen ? 1 : undefined,
            overflowY: isFullscreen ? "auto" : undefined,
            padding: `18px ${PAD_X}px`,
            outline: "none",
            color: "var(--re-text)",
            fontSize: 16,
            lineHeight: DEFAULT_LINE_HEIGHT,
            fontFamily: "inherit",
            background: "var(--re-bg)",
            caretColor: "var(--re-accent)",
            wordBreak: "break-word",
          }}
        />
      </div>

      {/* FOOTER */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap",
        padding: `6px ${PAD_X}px`, background: "var(--re-toolbar)",
        borderTop: "1px solid var(--re-border-soft)",
        color: "var(--re-faint)", fontSize: 11, fontFamily: "monospace",
      }}>
        <span role="status" aria-live="polite" style={{ color: notice ? "var(--re-accent)" : undefined }}>
          {notice ?? (selWords > 0 ? `${selWords} word${selWords === 1 ? "" : "s"} selected` : "")}
        </span>
        <span style={{ display: "flex", gap: 14 }}>
          <span>{wordCount.words} words</span>
          <span>{wordCount.chars} characters</span>
          {readMin > 0 && <span>{readMin} min read</span>}
        </span>
      </div>

      {/* SHORTCUTS MODAL */}
      {showShortcuts && (
        <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
          onMouseDown={e => { if (e.target === e.currentTarget) setShowShortcuts(false); }}
          style={{ position: "absolute", inset: 0, zIndex: 60, background: "var(--re-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--re-popover)", color: "var(--re-text)", border: "1px solid var(--re-border)", borderRadius: 14, padding: 20, width: "min(520px, 100%)", maxHeight: "100%", overflowY: "auto", boxShadow: "var(--re-shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <strong style={{ fontSize: 15 }}>Keyboard shortcuts</strong>
              <button type="button" className="re-btn" style={{ marginLeft: "auto" }} aria-label="Close" onClick={() => setShowShortcuts(false)}><X size={14} /></button>
            </div>
            {[{ title: "Shortcuts", rows: SHORTCUTS }, { title: "Type to format", rows: MARKDOWN_HINTS }].map(group => (
              <div key={group.title} style={{ marginBottom: 12 }}>
                <div className="re-pop-title" style={{ padding: "0 0 6px" }}>{group.title}</div>
                {group.rows.map(r => (
                  <div key={r.keys} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "5px 0", borderBottom: "1px solid var(--re-border-soft)", fontSize: 13 }}>
                    <span style={{ color: "var(--re-control-text)" }}>{r.action}</span>
                    <span className="re-kbd">{r.keys}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}