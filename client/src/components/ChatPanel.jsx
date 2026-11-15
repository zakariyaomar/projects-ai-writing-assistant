// client/src/components/ChatPanel.jsx
import { useState } from 'react';

function ChatPanel({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');

    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await onSendMessage(userMessage);
      if (response) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content: 'Content updated based on your feedback.' },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'error', content: 'Failed to process your message. Please try again.' },
      ]);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">AI</div>
        <div>
          <h4 className="font-bold text-slate-900">Zakariya your content</h4>
          <p className="text-xs text-slate-500">Give the assistant precise editing direction.</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Ask for changes like "Make it shorter", "Add more detail about pricing",
        or "Change the tone to be more formal"
      </p>

      {chatHistory.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`rounded-xl px-3 py-2.5 text-sm ${msg.role === 'user' ? 'bg-indigo-50 text-indigo-950' : msg.role === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
              <strong className="mr-1">{msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'Assistant'}:</strong>
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
      )}

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., Make it more concise and add a call-to-action"
          disabled={isLoading}
        />
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300" type="submit" disabled={isLoading || !message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;