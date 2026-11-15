// client/src/components/ContentDisplay.jsx
import { useState } from 'react';

function ContentDisplay({ content, isLoading, onSave }) {
  const [draftTitle, setDraftTitle] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="size-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="mt-4 font-semibold text-slate-800">Generating your content...</p>
        <p className="mt-1 text-sm text-slate-500">This usually takes just a moment.</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-100 flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-600">✦</div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Your content workspace</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Your generated draft will appear here. Start with a brief on the left to bring your first idea to life.</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!draftTitle.trim()) return;
    onSave(draftTitle);
    setDraftTitle('');
    setShowSaveForm(false);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([content.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-content.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Draft ready</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Generated content</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">Provider: {content.provider}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">Tokens: {content.usage?.total || 0}</span>
        </div>
      </div>

      <div className="max-h-150 overflow-y-auto px-5 py-6 sm:px-6">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">{content.content}</pre>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <button className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700" onClick={() => setShowSaveForm(true)}>Save draft</button>
        <button className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100" onClick={handleExportMarkdown}>Export Markdown</button>
        <button className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100" onClick={() => navigator.clipboard.writeText(content.content)}>
          Copy to Clipboard
        </button>
      </div>

      {showSaveForm && (
        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:px-6">
          <input
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Draft title..."
          />
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300" onClick={handleSave} disabled={!draftTitle.trim()}>
            Save
          </button>
          <button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" onClick={() => setShowSaveForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default ContentDisplay;