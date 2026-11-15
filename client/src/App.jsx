// client/src/App.jsx
import { useState } from 'react';
import GenerateForm from './components/GenerateForm';
import ContentDisplay from './components/ContentDisplay';
import ChatPanel from './components/ChatPanel';
import DraftList from './components/DraftList';
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedContent(data);
      setConversationId(data.conversationId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message) => {
    if (!conversationId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Chat failed');
      }

      const data = await response.json();
      setGeneratedContent(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (title) => {
    if (!generatedContent) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: generatedContent.content,
          contentType: generatedContent.contentType || 'blog',
          tone: generatedContent.tone || 'casual',
          topic: generatedContent.topic || '',
          provider: generatedContent.provider,
          model: generatedContent.model,
          tokensUsed: generatedContent.usage?.total || 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to save draft');
      alert('Draft saved successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">
              AI
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">AI Writing Assistant</h1>
              <p className="text-sm text-slate-500">Create polished content in less time</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            Ready to write
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-8 text-white shadow-xl sm:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Content studio</p>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Turn your ideas into content that moves people.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Choose a format, set the voice, and refine AI-generated copy until it is ready to publish.</p>
        </section>

        <nav className="mb-6 flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label="Content workspace">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            onClick={() => setActiveTab('generate')}
          >
            Create content
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'drafts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            onClick={() => setActiveTab('drafts')}
          >
            Saved drafts
          </button>
        </nav>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <p>{error}</p>
            <button className="font-semibold hover:text-rose-950" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div className="space-y-6">
              <GenerateForm onGenerate={handleGenerate} isLoading={isLoading} />
              {generatedContent && <ChatPanel onSendMessage={handleChatMessage} isLoading={isLoading} />}
            </div>
            <ContentDisplay content={generatedContent} isLoading={isLoading} onSave={handleSaveDraft} />
          </div>
        )}

        {activeTab === 'drafts' && <DraftList />}
      </main>
    </div>
  );
}

export default App;