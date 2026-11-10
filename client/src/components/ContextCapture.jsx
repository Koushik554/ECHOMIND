import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  FileText, 
  AlertTriangle, 
  Check, 
  Loader2, 
  HelpCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

const SAMPLE_NOTES = [
  {
    label: 'React Frontend & Bug Fix',
    text: 'I created a React frontend, connected MongoDB, login works but the dashboard API isn\'t returning data. I need to fix the API and improve the UI.'
  },
  {
    label: 'Database & Auth Migration',
    text: 'Completed migration of user passwords to argon2 hashing and updated Prisma schema. Added unit tests for login route (all green). Still pending: OAuth Google sign-in and email verification tokens. Blocker: SMTP credentials haven\'t been provided by DevOps yet. Decision: Use mock mailer for local testing.'
  },
  {
    label: 'Full-Stack Standup Notes',
    text: 'Yesterday finished Docker compose setup for Postgres and Redis. Today working on payment gateway webhook verification. Blocker: Stripe test clock simulated payments fail intermittently due to missing signing secret in .env. Next: configure webhook secret and run e2e checkout test.'
  }
];

export default function ContextCapture({ 
  project, 
  onAnalyze, 
  isLoading, 
  error 
}) {
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    setCharCount(val.length);
  };

  const handleApplySample = (sampleText) => {
    setInputText(sampleText);
    setCharCount(sampleText.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim().length < 10 || isLoading) return;
    onAnalyze(inputText);
  };

  const isTooShort = charCount > 0 && charCount < 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Capture Context & Raw Notes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dump your unstructured thoughts, git commit logs, bug lists, or standup updates below.
          </p>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400">Load sample:</span>
          {SAMPLE_NOTES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(sample.text)}
              className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <textarea
            rows={5}
            value={inputText}
            onChange={handleChange}
            placeholder="Paste your rough project notes here... (e.g., 'Implemented auth middleware and MongoDB models, but JWT refresh token rotation fails on Safari. Need to fix cookie domain and write tests next.')"
            className={`w-full rounded-xl border p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-y ${
              isTooShort 
                ? 'border-amber-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 bg-amber-50/20' 
                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
          />
        </div>

        {/* Bottom bar with validation and submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              <strong>{charCount}</strong> characters
            </span>
            {isTooShort && (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Please enter at least 10 characters
              </span>
            )}
            {charCount >= 10 && (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Ready to organize
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inputText && (
              <button
                type="button"
                onClick={() => { setInputText(''); setCharCount(0); }}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={charCount < 10 || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Organizing with BharatCode AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Organize My Context</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Upstream / Model Error Banner with Action */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-rose-900">AI Context Engine Response</h4>
            <p className="leading-relaxed text-rose-700">{error.message || 'Failed to extract context from input.'}</p>
            {error.message?.includes('bharatcode.ai/account') && (
              <div className="pt-2">
                <a
                  href="https://bharatcode.ai/account"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold text-[11px] shadow-sm transition-colors"
                >
                  Verify Student Account on BharatCode.ai
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

