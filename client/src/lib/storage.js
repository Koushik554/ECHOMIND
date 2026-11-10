/**
 * EchoMind Data Storage Layer
 * Manages persistence in browser localStorage with a clean, decoupled abstraction.
 * Easily swappable for MongoDB or a backend database in future phases.
 */

const STORAGE_KEYS = {
  PROJECTS: 'echomind_projects_v1',
  SNAPSHOTS: 'echomind_snapshots_v1',
  ACTIVE_PROJECT_ID: 'echomind_active_project_id_v1'
};

const DEFAULT_PROJECTS = [
  {
    id: 'proj_ecommerce_api',
    title: 'Storefront Microservices & Checkout API',
    description: 'Scalable payment gateway and cart microservice rewrite',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    latestSnapshot: {
      project_summary: 'Migrated cart and auth services to Node/Express; currently resolving webhook race conditions in Stripe payment processing.',
      status: 'in_progress',
      completed: [
        'Auth service JWT token rotation implemented',
        'Cart CRUD endpoints tested and benchmarked',
        'Redis session store configured for staging'
      ],
      pending: [
        'Fix Stripe payment webhook idempotency bug',
        'Write integration tests for checkout flow',
        'Set up rate limiting on public checkout endpoints'
      ],
      decisions: [
        {
          decision: 'Use Redis for cart state instead of direct Postgres writes',
          reason: 'Sub-millisecond latency requirement during flash sales'
        }
      ],
      blockers: [
        'Payment gateway test credentials expiring in 24 hours'
      ],
      risks_and_unknowns: [
        'High concurrency inventory locking under peak load remains unbenchmarked'
      ],
      next_actions: [
        {
          task: 'Implement database transaction lock for checkout webhook to avoid duplicate orders',
          priority: 'high',
          reason: 'Prevents customer double-charges on network retries'
        },
        {
          task: 'Renew Stripe staging credentials',
          priority: 'medium',
          reason: 'Testing suite will fail tomorrow if not refreshed'
        }
      ],
      assumptions: [
        'Stripe webhooks deliver with at-least-once semantics'
      ]
    }
  },
  {
    id: 'proj_ai_summarizer',
    title: 'EchoMind Hackathon Build',
    description: 'AI-powered project memory and context recovery engine',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    latestSnapshot: {
      project_summary: 'Built full stack scaffolding with React, Vite, Tailwind CSS and Node.js Express backend integrating BharatCode model API.',
      status: 'in_progress',
      completed: [
        'Initialized public Git repo with BharatCode.txt verification header',
        'Built backend Express server with /api/health and /api/analyze endpoints',
        'Connected BharatCode OpenAI-compatible API client with error handling'
      ],
      pending: [
        'Connect frontend dashboard to backend analyze service',
        'Verify live student token allowance or subscription on bharatcode.ai',
        'Test resume project view and export summary'
      ],
      decisions: [
        {
          decision: 'Use localStorage data layer with strict schema isolation for MVP',
          reason: 'Fast local responsiveness without external database dependencies'
        }
      ],
      blockers: [
        'Account needs college email verification at bharatcode.ai/account for 10M daily token quota'
      ],
      risks_and_unknowns: [
        'Upstream rate limits on large note dumps'
      ],
      next_actions: [
        {
          task: 'Verify student account at bharatcode.ai/account to activate the free 10M token daily allowance',
          priority: 'high',
          reason: 'Unlocks full AI completion model API'
        },
        {
          task: 'Test markdown export and snapshot recovery workflow in browser',
          priority: 'medium',
          reason: 'Validates primary hackathon evaluation criterion'
        }
      ],
      assumptions: [
        'Student accounts receive full Qwen 3.8 27B model access upon email verification'
      ]
    }
  }
];

export const storage = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, DEFAULT_PROJECTS[1].id);
    }
  },

  getProjects() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
    } catch {
      return [];
    }
  },

  getActiveProjectId() {
    this.init();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || DEFAULT_PROJECTS[0].id;
  },

  setActiveProjectId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  },

  getProject(id) {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  },

  saveProject(project) {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    const now = new Date().toISOString();

    let updatedProjects;
    if (existingIndex >= 0) {
      updatedProjects = [...projects];
      updatedProjects[existingIndex] = {
        ...updatedProjects[existingIndex],
        ...project,
        updatedAt: now
      };
    } else {
      const newProject = {
        ...project,
        id: project.id || `proj_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      updatedProjects = [newProject, ...projects];
    }

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
    return updatedProjects;
  },

  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    
    // Also remove snapshots
    const snapshots = this.getAllSnapshots();
    delete snapshots[id];
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));

    return projects;
  },

  getAllSnapshots() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SNAPSHOTS)) || {};
    } catch {
      return {};
    }
  },

  getSnapshots(projectId) {
    const all = this.getAllSnapshots();
    return all[projectId] || [];
  },

  saveSnapshot(projectId, snapshotData, originalNotes) {
    const all = this.getAllSnapshots();
    const list = all[projectId] || [];

    const snapshot = {
      id: `snap_${Date.now()}`,
      projectId,
      timestamp: new Date().toISOString(),
      originalNotes: originalNotes || '',
      data: snapshotData
    };

    all[projectId] = [snapshot, ...list];
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(all));

    // Also update project's latestSnapshot and updatedAt
    const project = this.getProject(projectId);
    if (project) {
      this.saveProject({
        ...project,
        status: snapshotData.status || project.status,
        latestSnapshot: snapshotData
      });
    }

    return snapshot;
  }
};

