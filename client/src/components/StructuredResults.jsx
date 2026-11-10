import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  Lightbulb, 
  HelpCircle, 
  Flame, 
  ArrowRight, 
  BookmarkCheck, 
  Share2, 
  Compass,
  Layers,
  ChevronDown,
  Check
} from 'lucide-react';

export default function StructuredResults({ 
  memory, 
  onSaveSnapshot, 
  onOpenExport, 
  isCurrentSnapshotSaved 
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!memory) return null;

  const handleSave = () => {
    onSaveSnapshot();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200"><Flame className="w-3 h-3 text-rose-600" /> High Priority</span>;
      case 'medium':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Medium</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">Completed</span>;
      case 'blocked':
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">Blocked</span>;
      case 'not_started':
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">Not Started</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">In Progress</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Project State</span>
            {getStatusBadge(memory.status)}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {memory.project_summary || 'No summary extracted.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saveSuccess}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              saveSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved to History!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Save Snapshot</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Prioritized Next Actions (Hero Section) */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Compass className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white uppercase">Prioritized Next Actions</h3>
              <p className="text-[11px] text-indigo-200">Highest-impact immediate steps to resume forward momentum</p>
            </div>
          </div>
        </div>

        {memory.next_actions && memory.next_actions.length > 0 ? (
          <div className="space-y-2.5">
            {memory.next_actions.map((action, idx) => (
              <div 
                key={idx}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 transition-all flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{action.task}</span>
                    {getPriorityBadge(action.priority)}
                  </div>
                  {action.reason && action.reason !== 'Not specified' && (
                    <p className="text-xs text-indigo-200/80 mt-1 italic">
                      Why: {action.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-indigo-300/80 p-4 text-center bg-white/5 rounded-xl border border-white/10">
            No pending next actions identified in this context dump.
          </div>
        )}
      </div>

      {/* Two Column Grid: Completed Work vs Pending Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Work */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Completed Work ({memory.completed?.length || 0})
            </h3>
          </div>
          {memory.completed && memory.completed.length > 0 ? (
            <ul className="space-y-2">
              {memory.completed.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/80 border border-slate-200/60 p-2.5 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No completed work explicitly mentioned.</p>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Pending Tasks ({memory.pending?.length || 0})
            </h3>
          </div>
          {memory.pending && memory.pending.length > 0 ? (
            <ul className="space-y-2">
              {memory.pending.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/40 border border-amber-200/50 p-2.5 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No remaining work explicitly reported.</p>
          )}
        </div>
      </div>

      {/* Blockers & Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blockers */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-100">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900">
              Known Blockers ({memory.blockers?.length || 0})
            </h3>
          </div>
          {memory.blockers && memory.blockers.length > 0 ? (
            <ul className="space-y-2">
              {memory.blockers.map((blocker, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 bg-rose-50/70 border border-rose-200 p-2.5 rounded-lg font-medium">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">🎉 No blockers identified.</p>
          )}
        </div>

        {/* Decisions Made */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Key Decisions & Rationale
            </h3>
          </div>
          {memory.decisions && memory.decisions.length > 0 ? (
            <ul className="space-y-2">
              {memory.decisions.map((d, idx) => (
                <li key={idx} className="text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
                  <div className="font-semibold text-slate-800">{d.decision}</div>
                  {d.reason && d.reason !== 'Not specified' && (
                    <div className="text-[11px] text-slate-500 italic">Reason: {d.reason}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No explicit architectural decisions recorded.</p>
          )}
        </div>
      </div>

      {/* Risks & Unknowns / Assumptions */}
      {(memory.risks_and_unknowns?.length > 0 || memory.assumptions?.length > 0) && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
          {memory.risks_and_unknowns?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                Risks & Unknowns
              </h4>
              <ul className="space-y-1.5">
                {memory.risks_and_unknowns.map((risk, idx) => (
                  <li key={idx} className="text-xs text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-slate-400">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {memory.assumptions?.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Cautious Assumptions
              </h4>
              <ul className="space-y-1.5">
                {memory.assumptions.map((assump, idx) => (
                  <li key={idx} className="text-xs text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-slate-400">
                    {assump}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

