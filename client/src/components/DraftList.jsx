// client/src/components/DraftList.jsx
import { useState, useEffect } from 'react';

function DraftList() {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDrafts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/drafts');
        const data = await response.json();
        if (isMounted) setDrafts(data.drafts);
      } catch (error) {
        console.error('Failed to fetch drafts:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadDrafts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      await fetch(`http://localhost:3001/api/drafts/${id}`, { method: 'DELETE' });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (selectedDraft?.id === id) setSelectedDraft(null);
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  if (isLoading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Loading drafts...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <p className="text-sm font-semibold text-indigo-600">Library</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Saved drafts <span className="text-slate-400">({drafts.length})</span></h3>
        </div>
        {drafts.length === 0 ? (
          <p className="px-5 py-8 text-sm leading-6 text-slate-500">No drafts saved yet. Generate content and save it here for later.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className={`group cursor-pointer px-5 py-4 transition hover:bg-slate-50 ${selectedDraft?.id === draft.id ? 'border-l-4 border-indigo-600 bg-indigo-50 pl-4' : ''}`}
                onClick={() => setSelectedDraft(draft)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-slate-800">{draft.title}</strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      {draft.content_type} · {draft.tone} · {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 opacity-0 transition hover:bg-rose-50 group-hover:opacity-100 focus:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(draft.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {selectedDraft ? (
          <>
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">{selectedDraft.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">Type: {selectedDraft.content_type}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">Tone: {selectedDraft.tone}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">Provider: {selectedDraft.provider || 'N/A'}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">Tokens: {selectedDraft.tokens_used}</span>
              </div>
            </div>
            <pre className="max-h-150 overflow-y-auto whitespace-pre-wrap px-5 py-6 font-sans text-sm leading-7 text-slate-700 sm:px-6">{selectedDraft.content}</pre>
          </>
        ) : (
          <div className="flex min-h-100 flex-col items-center justify-center p-8 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-lg text-slate-500">⌁</div>
            <p className="mt-4 text-sm text-slate-500">Select a draft to preview it.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DraftList;