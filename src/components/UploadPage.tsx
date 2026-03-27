import { useState, useCallback } from 'react';
import { createNote } from './note-store';
import MarkdownPreview from './MarkdownPreview';

export default function UploadPage({ basePath }: { basePath: string }) {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setMarkdown(text);
      if (!title) {
        const name = file.name.replace(/\.(md|mdx|txt)$/, '').replace(/[-_]/g, ' ');
        setTitle(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    reader.readAsText(file);
  }

  async function handleFetchUrl() {
    const url = urlInput.trim();
    if (!url) return;

    setFetching(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setMarkdown(text);
      if (!title) {
        const filename = url.split('/').pop() || '';
        const name = filename.replace(/\.(md|mdx|txt)$/, '').replace(/[-_]/g, ' ');
        if (name) setTitle(name.charAt(0).toUpperCase() + name.slice(1));
      }
      showToast('Fetched markdown from URL');
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch URL', 'error');
    } finally {
      setFetching(false);
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }
    if (!markdown.trim()) {
      showToast('Please enter some content', 'error');
      return;
    }
    createNote(title.trim(), markdown);
    showToast('Note saved!');
    setTitle('');
    setMarkdown('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = markdown.substring(0, start) + '  ' + markdown.substring(end);
      setMarkdown(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Upload Notes</h1>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Note
        </button>
      </div>

      <div className="upload-layout">
        <div className="upload-panel">
          <h2>Editor</h2>
          <input
            type="text"
            className="title-input"
            placeholder="Note title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="file-upload-row">
            <label className="file-input-label">
              Upload .md file
              <input type="file" accept=".md,.mdx,.txt,.markdown" onChange={handleFile} />
            </label>
          </div>
          <div className="file-upload-row">
            <input
              type="text"
              className="title-input"
              placeholder="Or paste a URL to a .md file..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleFetchUrl}
              disabled={fetching || !urlInput.trim()}
            >
              {fetching ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
          <textarea
            className="md-editor"
            placeholder={"Paste your markdown here...\n\nSupports LaTeX: $E = mc^2$\nCode blocks: ```python\nAnd all standard markdown."}
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
          <div className="upload-actions">
            <a className="btn btn-secondary" href={`${basePath}/my-notes/`}>
              My Notes
            </a>
          </div>
        </div>

        <div className="preview-panel">
          <h2>Preview</h2>
          <div className="preview-box">
            {markdown ? (
              <MarkdownPreview content={markdown} />
            ) : (
              <p style={{ color: 'var(--app-text-muted)', fontStyle: 'italic' }}>
                Start typing to see a live preview...
              </p>
            )}
          </div>
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
