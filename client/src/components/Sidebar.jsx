import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Layers,
  ChevronRight,
  Server
} from 'lucide-react';

export default function Sidebar({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onCreateProject, 
  onDeleteProject,
  serverStatus
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateProject({
      title: newTitle.trim(),
      description: newDesc.trim() || 'No description provided.',
      status: 'in_progress'
    });
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Done</span>;
      case 'blocked':
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"><AlertCircle className="w-3 h-3" /> Blocked</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200"><Clock className="w-3 h-3" /> Active</span>;
    }
  };

  return (
    <aside className="w-80 h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              EchoMind
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded">MVP</span>
            </h1>
            <p className="text-[11px] text-slate-400">Context Recovery Engine</p>
          </div>
        </div>
      </div>

      {/* Projects Header & Action */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <FolderKanban className="w-4 h-4 text-slate-400" />
          <span>Projects ({projects.length})</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-600 px-2.5 py-1.5 rounded-lg transition-colors"
          title="Create New Project"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* New Project Inline Modal */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 m-3 bg-slate-800/90 rounded-xl border border-slate-700 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Create Project</h3>
          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-medium">Project Name *</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Next.js Mobile App"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Short Description</label>
            <input
              type="text"
              placeholder="Optional overview"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {projects.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No projects yet. Click <strong>+ New Project</strong> to begin.
          </div>
        ) : (
          projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-slate-800 text-white border-indigo-500/60 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs leading-snug truncate group-hover:text-white">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {proj.description || 'No description'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${proj.title}"?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 text-slate-400 transition-opacity"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    {getStatusBadge(proj.latestSnapshot?.status || proj.status)}
                  </span>
                  <span>
                    {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backend & Model Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${serverStatus?.ok ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span className="text-slate-300 font-medium">BharatCode AI</span>
          </div>
          <span className="text-slate-400 text-[10px]">
            {serverStatus?.model || 'qwen-3.8-27b'}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Backend: {serverStatus?.ok ? 'Connected' : 'Offline'}</span>
          <span className="text-indigo-400">10M Token Free</span>
        </div>
      </div>
    </aside>
  );
}

