import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react';

// Icon components
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ToolBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`rte-tool-btn${active ? ' rte-active' : ''}${disabled ? ' rte-disabled' : ''}`}
  >
    {children}
  </button>
);

const Divider = () => <span className="rte-divider" />;

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "",
    editorProps: {
      attributes: {
        class: "rte-content",
        spellcheck: "true",
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  const charCount = editor.getText().length;
  const wordCount = editor.getText().trim() === '' ? 0 : editor.getText().trim().split(/\s+/).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

        .rte-wrap {
          --ink: #0d0d12;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --accent: #e8521a;
          --muted: #8a8a96;
          --border: rgba(0,0,0,0.09);
          --font-display: 'Syne', sans-serif;
          --font-body: 'Outfit', sans-serif;
          --radius: 12px;

          font-family: var(--font-body);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: #fff;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rte-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,82,26,0.10);
        }

        /* ── TOOLBAR ── */
        .rte-toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 8px 10px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .rte-tool-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px; height: 30px;
          border: none;
          background: transparent;
          border-radius: 7px;
          color: #4a4a56;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .rte-tool-btn:hover { background: var(--surface2); color: var(--ink); }
        .rte-tool-btn.rte-active { background: var(--ink); color: #fff; }
        .rte-tool-btn.rte-disabled { opacity: 0.35; cursor: not-allowed; }
        .rte-divider {
          width: 1px; height: 20px;
          background: var(--border);
          margin: 0 4px;
          flex-shrink: 0;
        }

        /* ── EDITOR CONTENT ── */
        .rte-content {
          min-height: 200px;
          padding: 16px 18px;
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--ink);
          line-height: 1.7;
          outline: none;
          word-break: break-word;
        }
        .rte-content p { margin: 0 0 8px; }
        .rte-content p:last-child { margin-bottom: 0; }
        .rte-content h1 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--ink); letter-spacing: -0.03em; margin: 16px 0 8px; }
        .rte-content h2 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; margin: 14px 0 6px; }
        .rte-content h3 { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--ink); margin: 12px 0 4px; }
        .rte-content strong { font-weight: 700; color: var(--ink); }
        .rte-content em { font-style: italic; color: #3a3a50; }
        .rte-content s { text-decoration: line-through; color: var(--muted); }
        .rte-content code {
          font-size: 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 5px;
          padding: 1px 6px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          color: var(--accent);
        }
        .rte-content pre {
          background: var(--ink);
          border-radius: 10px;
          padding: 14px 16px;
          margin: 10px 0;
          overflow-x: auto;
        }
        .rte-content pre code {
          background: none;
          border: none;
          color: #f5f4f0;
          padding: 0;
          font-size: 13px;
        }
        .rte-content ul, .rte-content ol { padding-left: 22px; margin: 6px 0 10px; }
        .rte-content li { margin-bottom: 4px; }
        .rte-content ul li::marker { color: var(--accent); }
        .rte-content ol li::marker { color: var(--accent); font-weight: 600; }
        .rte-content blockquote {
          border-left: 3px solid var(--accent);
          margin: 10px 0;
          padding: 6px 14px;
          background: rgba(232,82,26,0.05);
          border-radius: 0 8px 8px 0;
          color: #5a5a66;
          font-style: italic;
        }
        .rte-content hr { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
        .rte-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--muted);
          pointer-events: none;
          float: left;
          height: 0;
        }

        /* ── BUBBLE MENU ── */
        .rte-bubble {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--ink);
          border-radius: 9px;
          padding: 5px 7px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12);
        }
        .rte-bubble .rte-tool-btn { color: rgba(245,244,240,0.7); }
        .rte-bubble .rte-tool-btn:hover { background: rgba(255,255,255,0.1); color: #f5f4f0; }
        .rte-bubble .rte-tool-btn.rte-active { background: var(--accent); color: #fff; }
        .rte-bubble .rte-divider { background: rgba(255,255,255,0.12); }

        /* ── FOOTER ── */
        .rte-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 6px 14px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          gap: 12px;
        }
        .rte-count {
          font-size: 11px;
          color: var(--muted);
          font-weight: 400;
        }
        .rte-count span { font-weight: 600; color: #6a6a76; }
      `}</style>

      <div className="rte-wrap">
        {/* ── TOOLBAR ── */}
        <div className="rte-toolbar">
          {/* History */}
          <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13C5.4 7.7 10.8 4 17 4c3.3 0 6.3 1.3 8.5 3.5"/></svg>
          </ToolBtn>
          <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13C18.6 7.7 13.2 4 7 4 3.7 4 .7 5.3-1.5 7.5"/></svg>
          </ToolBtn>

          <Divider />

          {/* Headings */}
          <ToolBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolBtn>
          <ToolBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
          <ToolBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>

          <Divider />

          {/* Inline marks */}
          <ToolBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
          </ToolBtn>
          <ToolBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
          </ToolBtn>
          <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4s-5 1.5-5 4c0 5 9 4 9 8s-2.5 4-4 4-4-1.5-4-4"/></svg>
          </ToolBtn>
          <ToolBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></svg>
          </ToolBtn>
          <ToolBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </ToolBtn>

          <Divider />

          {/* Block elements */}
          <ToolBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </ToolBtn>
          <ToolBtn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 10l-3 3 3 3"/><path d="M16 10l3 3-3 3"/><line x1="12" y1="7" x2="12" y2="17"/></svg>
          </ToolBtn>
          <ToolBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </ToolBtn>
        </div>

        {/* ── BUBBLE MENU (selection toolbar) ── */}
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
          <div className="rte-bubble">
            <ToolBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
            </ToolBtn>
            <ToolBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
            </ToolBtn>
            <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4s-5 1.5-5 4c0 5 9 4 9 8s-2.5 4-4 4-4-1.5-4-4"/></svg>
            </ToolBtn>
            <ToolBtn title="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </ToolBtn>
            <Divider />
            <ToolBtn title="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
            <ToolBtn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </ToolBtn>
          </div>
        </BubbleMenu>

        {/* ── EDITOR ── */}
        <EditorContent editor={editor} />

        {/* ── FOOTER ── */}
        <div className="rte-footer">
          <span className="rte-count"><span>{wordCount}</span> words</span>
          <span className="rte-count"><span>{charCount}</span> chars</span>
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;