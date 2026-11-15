// client/src/components/GenerateForm.jsx
import { useState } from 'react';

function GenerateForm({ onGenerate, isLoading }) {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, contentType, tone, length });
  };

  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="text-sm font-semibold text-indigo-600">New draft</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Tell us what you want to create</h2>
        <p className="mt-1 text-sm text-slate-500">A clear brief produces more focused results.</p>
      </div>
      <div className="form-group">
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="topic">Topic or brief</label>
        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Benefits of mobile banking for small businesses in Kenya"
          rows={3}
          required
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="form-group">
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="contentType">Content type</label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            id="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="blog">Blog Post</option>
            <option value="email">Email</option>
            <option value="social">Social Media Post</option>
          </select>
        </div>

        <div className="form-group">
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="tone">Tone</label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="persuasive">Persuasive</option>
          </select>
        </div>

        <div className="form-group">
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="length">Length</label>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            id="length"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          >
            <option value="short">Short (150-250 words)</option>
            <option value="medium">Medium (400-600 words)</option>
            <option value="long">Long (800-1200 words)</option>
          </select>
        </div>
      </div>

      <button className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none" type="submit" disabled={isLoading || !topic.trim()}>
        {isLoading ? 'Generating...' : 'Generate Content'}
      </button>
    </form>
  );
}

export default GenerateForm;