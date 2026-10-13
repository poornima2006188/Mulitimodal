import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PatientData } from '../types';
import { askAgent } from '../api';
import { MessageSquareText, Send, Loader2, User, Bot, Sparkles, HelpCircle } from 'lucide-react';

interface AiAgentChatProps {
  patient: PatientData;
  selectedTarget: string;
}

export const AiAgentChat: React.FC<AiAgentChatProps> = ({
  patient,
  selectedTarget
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: `Hello. I am the **ArteryLens AI Clinical Decision Support Explainer**. I can provide structured clinical reasoning, explain top SHAP risk drivers, and discuss model boundaries for this patient.\n\nSelect a suggested inquiry below or ask a specific question.`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Explain these results in simple terms.',
    'Which features most influenced this prediction?',
    'What are the limitations of these predictions?'
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg = { role: 'user' as const, text: q };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await askAgent(q, patient, selectedTarget);
      setMessages(prev => [...prev, { role: 'agent', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          text: 'Unable to contact the clinical reasoning server. Please verify backend connectivity at `http://localhost:8000`.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-explainer" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full min-h-[500px]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-[#1A2E44]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <MessageSquareText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
                AI Clinical Reasoning Interface
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grounded in active patient features and multi-target ML estimations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3 h-3" />
            <span>Target: {selectedTarget}</span>
          </div>
        </div>

        {/* Suggested Question Chips */}
        <div className="mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Clinical Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sq)}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-left disabled:opacity-50"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="space-y-3 max-h-[300px] sm:max-h-[340px] overflow-y-auto pr-1 mb-3">
          {messages.map((m, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              {m.role === 'user' ? (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`flex-1 p-3 rounded-xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    : 'bg-teal-50/40 dark:bg-[#07121E]/80 text-slate-800 dark:text-slate-200 border border-teal-100 dark:border-[#1A2E44]'
                }`}
              >
                <div className="prose prose-xs max-w-none dark:prose-invert prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 text-xs">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing clinical reasoning grounded in patient features...</span>
            </div>
          )}
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-[#1A2E44]">
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about this patient's risk profile..."
          className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-1 focus:ring-teal-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="p-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-40 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
          title="Send inquiry"
          aria-label="Send inquiry"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default AiAgentChat;
