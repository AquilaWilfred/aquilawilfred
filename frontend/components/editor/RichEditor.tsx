"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, RotateCcw, Palette, Code2, Italic
} from "lucide-react";

const FONTS = ["Default", "Inter", "Georgia", "Courier New", "Arial", "Times New Roman", "Fira Code"];
const FONT_SIZES = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
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

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  showCodeCanvas?: boolean;
}

export default function RichEditor({ value, onChange, placeholder = "Start writing...", minHeight = 300, showCodeCanvas = false }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeLang, setCodeLang] = useState("javascript");
  const isInternalChange = useRef(false);
  const savedRange = useRef<Range | null>(null);

  // Only sync external value changes into DOM (not our own typing)
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const syncContent = useCallback(() => {
    if (editorRef.current) { isInternalChange.current = true; onChange(editorRef.current.innerHTML); }
  }, [onChange]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  };

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus(); restoreSelection();
    document.execCommand(command, false, val);
    syncContent();
  }, [syncContent]);

  const applyFontSize = useCallback((size: string) => {
    editorRef.current?.focus(); restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = size;
    if (range.collapsed) {
      // Insert a zero-width space span so next typed chars inherit this size
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
  }, [syncContent]);

  const applyFontFamily = useCallback((font: string) => {
    editorRef.current?.focus(); restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontFamily = font === "inherit" ? "" : font;
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
  }, [syncContent]);

  const reset = useCallback(() => {
    if (editorRef.current) { editorRef.current.innerHTML = ""; onChange(""); }
  }, [onChange]);

  const applyGradient = useCallback((gradient: string) => {
    editorRef.current?.focus(); restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString() === "") {
      alert("Select some text first, then pick a gradient."); return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundImage = gradient;
    span.style.webkitBackgroundClip = "text";
    span.style.webkitTextFillColor = "transparent";
    span.style.backgroundClip = "text";
    try { range.surroundContents(span); } catch {
      const frag = range.extractContents(); span.appendChild(frag); range.insertNode(span);
    }
    setShowGradientPicker(false); syncContent();
  }, [syncContent]);

  const insertOrderedList = useCallback((listType: string) => {
    editorRef.current?.focus(); restoreSelection();
    document.execCommand("insertOrderedList", false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      while (node && (node as Element).tagName !== "OL") node = node.parentNode;
      if (node) (node as HTMLElement).style.listStyleType = listType;
    }
    syncContent();
  }, [syncContent]);

  const insertCode = useCallback(() => {
    if (!codeContent.trim()) return;
    const escaped = codeContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // OUTER: overflow must NOT be hidden — that kills the scroll inside cb-body
    const outerStyle = "position:relative;background:#0D1117;border-radius:12px;overflow:visible;max-width:100%;margin:1.5rem 0;border:1px solid rgba(255,255,255,0.12);font-family:'Fira Code','Courier New',monospace;box-shadow:0 4px 24px rgba(0,0,0,0.4);";
    // Header: language label only — no copy button here anymore
    const headerStyle = "display:flex;align-items:center;padding:8px 16px;background:#161B22;border-radius:12px 12px 0 0;border-bottom:1px solid rgba(255,255,255,0.08);";
    const langStyle = "color:#8B949E;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:0.08em;";
    // BODY: scrolls horizontally AND vertically, never clips
    const bodyStyle = "position:relative;overflow-x:auto;overflow-y:auto;max-height:520px;border-radius:0 0 12px 12px;";
    const preStyle = "margin:0;padding:16px;white-space:pre;word-break:normal;overflow-wrap:normal;tab-size:2;min-width:max-content;";
    const codeStyle = "font-family:'Fira Code','Courier New',monospace;font-size:0.875rem;color:#E6EDF3;line-height:1.7;white-space:pre;display:block;";

    // COPY BUTTON: absolutely positioned top-right of the body, hidden until hover
    // Uses onmouseover/onmouseout on the outer block to show/hide
    const copyBtnStyle = "position:sticky;float:right;top:8px;right:8px;z-index:10;background:rgba(30,41,59,0.92);border:1px solid rgba(255,255,255,0.15);color:#8B949E;font-size:11px;padding:5px 12px;border-radius:7px;cursor:pointer;font-family:monospace;opacity:0;transition:opacity 0.2s,color 0.2s,background 0.2s;pointer-events:none;margin:8px 8px 0 0;display:inline-block;backdrop-filter:blur(4px);";

    // Show/hide copy button on hover of entire code block
    const showCopy = `(function(el){var btn=el.querySelector('.cb-copy-btn');if(btn){btn.style.opacity='1';btn.style.pointerEvents='auto';}})`;
    const hideCopy = `(function(el){var btn=el.querySelector('.cb-copy-btn');if(btn){btn.style.opacity='0';btn.style.pointerEvents='none';}})`;

    // Copy function — self-contained IIFE
    const copyFn = `(function(btn){var block=btn.closest('.code-block');var c=block?block.querySelector('code'):null;if(!c)return;navigator.clipboard.writeText(c.innerText).then(function(){btn.textContent='✓ Copied!';btn.style.color='#34D399';btn.style.background='rgba(16,185,129,0.2)';btn.style.borderColor='rgba(16,185,129,0.4)';setTimeout(function(){btn.textContent='⎘ Copy';btn.style.color='#8B949E';btn.style.background='rgba(30,41,59,0.92)';btn.style.borderColor='rgba(255,255,255,0.15)';},1800);}).catch(function(){btn.textContent='Failed';});})(this)`;

    const codeBlock = [
      `<div class="code-block" style="${outerStyle}" onmouseover="${showCopy}(this)" onmouseout="${hideCopy}(this)">`,
        `<div class="cb-header" style="${headerStyle}">`,
          `<span class="cb-lang" style="${langStyle}">${codeLang}</span>`,
        `</div>`,
        `<div class="cb-body" style="${bodyStyle}">`,
          // Copy button floats inside the scrollable body at top-right, sticky so it stays visible when scrolling
          `<button class="cb-copy-btn" onclick="${copyFn}" style="${copyBtnStyle}">⎘ Copy</button>`,
          `<pre style="${preStyle}"><code style="${codeStyle}">${escaped}</code></pre>`,
        `</div>`,
      `</div><p><br></p>`,
    ].join("");

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, codeBlock);
      syncContent();
    }
    setCodeContent(""); setShowCodeEditor(false);
  }, [codeContent, codeLang, syncContent]);

  const btn = (active = false) => ({
    padding: "5px 7px", borderRadius: "6px", border: "none",
    background: active ? "rgba(14,165,233,0.2)" : "transparent",
    color: active ? "#38BDF8" : "rgba(255,255,255,0.65)",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
    fontSize: "12px", transition: "all 0.15s",
  } as React.CSSProperties);

  const sel: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.7)", borderRadius: "6px", padding: "4px 6px",
    fontSize: "12px", cursor: "pointer", outline: "none",
  };

  const div = <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 3px", alignSelf: "stretch" }} />;

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", overflow: "hidden" }}>
      {/* TOOLBAR */}
      <div style={{ background: "#071020", padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: "3px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

        <select style={{ ...sel, maxWidth: "110px" }} defaultValue="inherit"
          onMouseDown={saveSelection} onChange={e => applyFontFamily(e.target.value)}>
          {FONTS.map(f => <option key={f} value={f === "Default" ? "inherit" : f}>{f}</option>)}
        </select>

        <select style={{ ...sel, width: "68px" }} defaultValue="14px"
          onMouseDown={saveSelection} onChange={e => applyFontSize(e.target.value)}>
          {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {div}

        <button style={btn()} onMouseDown={e => { e.preventDefault(); saveSelection(); exec("bold"); }} title="Bold"><Bold size={14} /></button>
        <button style={btn()} onMouseDown={e => { e.preventDefault(); saveSelection(); exec("italic"); }} title="Italic"><Italic size={14} /></button>
        <button style={btn()} onMouseDown={e => { e.preventDefault(); saveSelection(); exec("underline"); }} title="Underline"><Underline size={14} /></button>

        {div}

        {/* Font color */}
        <label style={{ ...btn(), cursor: "pointer", position: "relative" } as React.CSSProperties} title="Text Color" onMouseDown={saveSelection}>
          <Palette size={14} />
          <input type="color" style={{ width: 0, height: 0, opacity: 0, position: "absolute", pointerEvents: "none" }}
            onChange={e => { restoreSelection(); exec("foreColor", e.target.value); }} />
        </label>

        {/* Gradient */}
        <div style={{ position: "relative" }}>
          <button style={btn(showGradientPicker)}
            onMouseDown={e => { e.preventDefault(); saveSelection(); setShowGradientPicker(!showGradientPicker); }}
            title="Gradient Text (select text first)">
            <span style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(90deg,#0EA5E9,#7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>G</span>
          </button>
          {showGradientPicker && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "#0D1421", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px", marginTop: "4px" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontFamily: "monospace", margin: "0 0 4px" }}>Select text first, then pick gradient</p>
              {GRADIENTS.map((g, i) => <button key={i} onMouseDown={e => { e.preventDefault(); applyGradient(g); }} style={{ background: g, border: "none", borderRadius: "6px", height: "24px", cursor: "pointer" }} />)}
            </div>
          )}
        </div>

        {div}

        <button style={btn()} onMouseDown={e => { e.preventDefault(); exec("justifyLeft"); }} title="Align Left"><AlignLeft size={14} /></button>
        <button style={btn()} onMouseDown={e => { e.preventDefault(); exec("justifyCenter"); }} title="Align Center"><AlignCenter size={14} /></button>
        <button style={btn()} onMouseDown={e => { e.preventDefault(); exec("justifyRight"); }} title="Align Right"><AlignRight size={14} /></button>
        <button style={btn()} onMouseDown={e => { e.preventDefault(); exec("justifyFull"); }} title="Justify"><AlignJustify size={14} /></button>

        {div}

        <button style={btn()} onMouseDown={e => { e.preventDefault(); saveSelection(); exec("insertUnorderedList"); }} title="Bullet List"><List size={14} /></button>

        {/* Ordered list + type picker */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <button style={btn()} onMouseDown={e => { e.preventDefault(); saveSelection(); insertOrderedList("decimal"); }} title="Numbered List"><ListOrdered size={14} /></button>
          <select style={{ ...sel, width: "46px", padding: "3px 4px" }}
            onMouseDown={saveSelection} onChange={e => insertOrderedList(e.target.value)} defaultValue="decimal" title="List style">
            {LIST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <button style={btn()} onMouseDown={e => { e.preventDefault(); exec("indent"); }} title="Indent"><Indent size={14} /></button>
        <button style={btn()} onMouseDown={e => { e.preventDefault(); exec("outdent"); }} title="Outdent"><Outdent size={14} /></button>

        {div}

        {showCodeCanvas && (
          <button style={btn(showCodeEditor)} onMouseDown={e => { e.preventDefault(); setShowCodeEditor(!showCodeEditor); }} title="Insert Code Block">
            <Code2 size={14} /><span>Code</span>
          </button>
        )}

        <button style={{ ...btn(), marginLeft: "auto", color: "#F87171" }} onMouseDown={e => { e.preventDefault(); reset(); }} title="Reset all content">
          <RotateCcw size={13} /><span>Reset</span>
        </button>
      </div>

      {/* CODE CANVAS */}
      {showCodeCanvas && showCodeEditor && (
        <div style={{ background: "#0D1117", padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <Code2 size={16} color="#8B949E" />
            <span style={{ color: "#8B949E", fontSize: "12px", fontFamily: "monospace" }}>CODE CANVAS — paste any code, format is preserved</span>
            <select value={codeLang} onChange={e => setCodeLang(e.target.value)}
              style={{ marginLeft: "auto", background: "#161B22", border: "1px solid rgba(255,255,255,0.1)", color: "#8B949E", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontFamily: "monospace", outline: "none" }}>
              {["javascript","typescript","python","kotlin","sql","bash","jsx","tsx","html","css","json","yaml","dockerfile","r","c++","rust","go"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <textarea value={codeContent} onChange={e => setCodeContent(e.target.value)}
            placeholder="Paste your code here... indentation and spacing preserved exactly"
            rows={12}
            style={{ width: "100%", background: "#161B22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#E6EDF3", fontFamily: "'Fira Code','Courier New',monospace", fontSize: "13px", lineHeight: "1.6", padding: "12px 16px", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); const s = e.currentTarget; const start = s.selectionStart; const end = s.selectionEnd; s.value = s.value.substring(0,start)+"  "+s.value.substring(end); s.selectionStart = s.selectionEnd = start+2; setCodeContent(s.value); } }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <button onClick={insertCode} style={{ background: "linear-gradient(135deg,#0EA5E9,#7C3AED)", border: "none", color: "white", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Insert Code Block</button>
            <button onClick={() => setShowCodeEditor(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* EDITABLE AREA */}
      <div ref={editorRef} contentEditable suppressContentEditableWarning
        onInput={syncContent} data-placeholder={placeholder}
        style={{ minHeight: `${minHeight}px`, padding: "16px 20px", outline: "none", color: "rgba(255,255,255,0.9)", fontSize: "14px", lineHeight: "1.8", fontFamily: "inherit", background: "#0A1628", caretColor: "#38BDF8" }}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          display: block;
        }
        [contenteditable] ol, [contenteditable] ul { padding-left: 1.5em; }
        .code-block pre { tab-size: 2; }
      `}</style>
    </div>
  );
}
