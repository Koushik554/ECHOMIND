import React from 'react';
import { X, Clock, Calendar, BookmarkCheck, ArrowRight, Trash2 } from 'lucide-react';

export default function HistoryModal({ 
  project, 
  snapshots, 
  onRestoreSnapshot, 
  onClose 
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Project History & Snapshots</h3>
              <p className="text-[11px] text-slate-500">Timeline of past analyses for {project?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshots List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved snapshots yet. After running an AI analysis, click <strong>Save Snapshot</strong> to preserve your context here.
            </div>
          ) : (
            snapshots.map((snap, idx) => {
              const dateStr = new Date(snap.timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              });
              const data = snap.data;

              return (
                <div 
                  key={snap.id || idx}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {data?.status || 'in_progress'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {data?.project_summary || 'No summary available.'}
                  </p>

                  {data?.next_actions?.[0] && (
                    <div className="text-[11px] bg-slate-50 border border-slate-200/80 p-2 rounded-lg text-slate-700">
                      <strong>Next action:</strong> {data.next_actions[0].task}
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        onRestoreSnapshot(data);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Load Snapshot</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

