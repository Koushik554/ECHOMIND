import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ContextCapture from './components/ContextCapture';
import StructuredResults from './components/StructuredResults';
import ResumeView from './components/ResumeView';
import ExportModal from './components/ExportModal';
import HistoryModal from './components/HistoryModal';
import { storage } from './lib/storage';
import { 
  FolderKanban, 
  Sparkles, 
  Compass, 
  Clock, 
  Share2, 
  Menu, 
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'resume'
  const [currentMemory, setCurrentMemory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState({ ok: false, model: 'Checking...' });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastOriginalNotes, setLastOriginalNotes] = useState('');

  // 1. Initialize data and load projects
  useEffect(() => {
    storage.init();
    const loadedProjects = storage.getProjects();
    setProjects(loadedProjects);
    const initialActiveId = storage.getActiveProjectId() || loadedProjects[0]?.id;
    setActiveProjectId(initialActiveId);

    const activeProj = loadedProjects.find(p => p.id === initialActiveId);
    if (activeProj?.latestSnapshot) {
      setCurrentMemory(activeProj.latestSnapshot);
    }

    // 2. Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setServerStatus({
          ok: data.status === 'ok',
          model: data.model || 'qwen-3.8-27b',
          hasApiKey: data.hasApiKey
        });
      })
      .catch(() => {
        setServerStatus({ ok: false, model: 'Offline' });
      });
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleSelectProject = (id) => {
    setActiveProjectId(id);
    storage.setActiveProjectId(id);
    const proj = projects.find(p => p.id === id);
    if (proj?.latestSnapshot) {
      setCurrentMemory(proj.latestSnapshot);
    } else {
      setCurrentMemory(null);
    }
    setError(null);
    setMobileMenuOpen(false);
  };

  const handleCreateProject = (newProjData) => {
    const updated = storage.saveProject(newProjData);
    setProjects(updated);
    const created = updated[0];
    if (created) {
      setActiveProjectId(created.id);
      storage.setActiveProjectId(created.id);
      setCurrentMemory(null);
      setError(null);
    }
  };

  const handleDeleteProject = (id) => {
    const updated = storage.deleteProject(id);
    setProjects(updated);
    if (activeProjectId === id && updated.length > 0) {
      setActiveProjectId(updated[0].id);
      storage.setActiveProjectId(updated[0].id);
      setCurrentMemory(updated[0].latestSnapshot || null);
    }
  };

  const handleAnalyze = async (inputText) => {
    setIsLoading(true);
    setError(null);
    setLastOriginalNotes(inputText);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: activeProject?.title || 'Untitled Project',
          inputText
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message || `Server returned error ${response.status}`);
      }

      const extractedMemory = result.data;
      setCurrentMemory(extractedMemory);

      // Save as latest snapshot in project
      if (activeProject) {
        storage.saveSnapshot(activeProject.id, extractedMemory, inputText);
        // Refresh project list to reflect update
        setProjects(storage.getProjects());
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSaveSnapshot = () => {
    if (!activeProject || !currentMemory) return;
    storage.saveSnapshot(activeProject.id, currentMemory, lastOriginalNotes);
    setProjects(storage.getProjects());
  };

  const handleRestoreSnapshot = (snapshotData) => {
    setCurrentMemory(snapshotData);
  };

  const snapshots = activeProject ? storage.getSnapshots(activeProject.id) : [];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex">
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          serverStatus={serverStatus}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-sm">
          <div className="w-80 h-full">
            <Sidebar
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              serverStatus={serverStatus}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}>
            <button className="m-4 p-2 bg-white rounded-full text-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project</span>
                <span className="text-slate-300">/</span>
                <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs md:max-w-md">
                  {activeProject?.title || 'EchoMind Workspace'}
                </h2>
              </div>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'workspace'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>

              <button
                onClick={() => setActiveTab('resume')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'resume'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Resume View</span>
              </button>
            </div>

            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              title="View History Snapshots"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>History ({snapshots.length})</span>
            </button>

            {/* Export Markdown Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              title="Export Markdown Summary"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {activeTab === 'resume' ? (
            <ResumeView
              project={activeProject}
              onSwitchToCapture={() => setActiveTab('workspace')}
            />
          ) : (
            <>
              {/* Context Capture Section */}
              <ContextCapture
                project={activeProject}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                error={error}
              />

              {/* Structured AI Results */}
              <StructuredResults
                memory={currentMemory}
                onSaveSnapshot={handleManualSaveSnapshot}
                onOpenExport={() => setIsExportOpen(true)}
              />
            </>
          )}
        </main>
      </div>

      {/* Export Markdown Modal */}
      {isExportOpen && (
        <ExportModal
          project={activeProject}
          memory={currentMemory}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Snapshots / History Modal */}
      {isHistoryOpen && (
        <HistoryModal
          project={activeProject}
          snapshots={snapshots}
          onRestoreSnapshot={handleRestoreSnapshot}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}

