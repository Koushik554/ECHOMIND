import React from 'react';
import { 
  Compass, 
  HelpCircle, 
  PauseCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ArrowRight,
  Layers,
  Sparkles,
  Calendar,
  Clock
} from 'lucide-react';

export default function ResumeView({ project, onSwitchToCapture }) {
  const memory = project?.latestSnapshot;

  if (!memory) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Context Snapshots Yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Paste your project notes or work log in the Capture tab to build this project's memory and unlock instant context recovery.
        </p>
        <button
          onClick={onSwitchToCapture}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Capture Context Now
        </button>
      </div>
    );
  }

  const topAction = memory.next_actions?.[0];
  const lastUpdated = project?.updatedAt
    ? new Date(project.updatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Recently';

  return (
    <div className="space-y-6">
      {/* Recovery Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Context Recovery Mode
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Resuming: {project.title}
          </h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5" />
            Last active state recorded on {lastUpdated}
          </p>
        </div>

        <button
          onClick={onSwitchToCapture}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition-all self-start md:self-auto"
        >
          <span>Update Context</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* The 3 Core Questions Specified by the Hackathon Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. What is this project? */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <span className="text-xs font-black">1</span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              What is this project?
            </h3>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Project Scope & Purpose</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {memory.project_summary || project.description || 'No detailed scope provided.'}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status:</span>
            <span className="font-semibold text-slate-800 uppercase tracking-wider">{memory.status}</span>
          </div>
        </div>

        {/* 2. Where did I stop? */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <span className="text-xs font-black">2</span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Where did I stop?
            </h3>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Last Completed Work</h4>
            
            {memory.completed && memory.completed.length > 0 ? (
              <div className="space-y-1.5">
                {memory.completed.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No completed tasks logged yet.</p>
            )}

            {memory.blockers && memory.blockers.length > 0 && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2 font-medium">Blocker: {memory.blockers[0]}</span>
              </div>
            )}
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pending items:</span>
            <span className="font-semibold text-slate-800">{memory.pending?.length || 0} remaining</span>
          </div>
        </div>

        {/* 3. What should I do next? */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl shadow-xl shadow-indigo-950/20 p-6 text-white flex flex-col justify-between border border-indigo-800">
          <div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 text-indigo-200 flex items-center justify-center mb-3">
              <span className="text-xs font-black">3</span>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
              What should I do next?
            </h3>
            <h4 className="text-sm font-bold text-white mb-2">Immediate Recommended Step</h4>

            {topAction ? (
              <div className="space-y-2">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white mb-1.5 inline-block">
                    {topAction.priority || 'HIGH'} PRIORITY
                  </span>
                  <p className="text-xs font-semibold text-white leading-snug">
                    {topAction.task}
                  </p>
                  {topAction.reason && topAction.reason !== 'Not specified' && (
                    <p className="text-[11px] text-indigo-200/80 mt-1 italic">
                      {topAction.reason}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-indigo-300 italic">No pending actions found.</p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-indigo-800/60 flex items-center justify-between text-[11px] text-indigo-200">
            <span>Ready to execute?</span>
            <span className="font-bold text-white">Focus & Dive In →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

