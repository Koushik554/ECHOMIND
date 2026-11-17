import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContextOffline } from '../src/services/offlineAi.service.js';

test('offlineAi extracts completed, pending, blockers, and next actions correctly', () => {
  const input = 'I created a React frontend, connected MongoDB, login works but the dashboard API isn\'t returning data. I need to fix the API and improve the UI.';
  
  const result = analyzeContextOffline({
    projectTitle: 'E-Commerce Dashboard',
    inputText: input
  });

  // Verify structure
  assert.ok(result.project_summary);
  assert.equal(result.status, 'blocked'); // because "isn't returning data" is a blocker!
  
  // Verify completed
  assert.ok(result.completed.length >= 1);
  assert.ok(result.completed.some(c => c.toLowerCase().includes('react') || c.toLowerCase().includes('mongodb')));

  // Verify blockers
  assert.ok(result.blockers.length >= 1);
  assert.ok(result.blockers.some(b => b.toLowerCase().includes("isn't returning")));

  // Verify pending
  assert.ok(result.pending.length >= 1);
  assert.ok(result.pending.some(p => p.toLowerCase().includes('api') || p.toLowerCase().includes('ui')));

  // Verify next actions
  assert.ok(result.next_actions.length >= 1);
  assert.equal(result.next_actions[0].priority, 'high'); // Blocker resolutions are marked high priority!
});

test('offlineAi handles clean completed projects without blockers', () => {
  const input = 'Finished implementing all unit tests and successfully deployed to staging. All tests passed.';
  const result = analyzeContextOffline({
    projectTitle: 'Deployment Sprint',
    inputText: input
  });

  assert.equal(result.status, 'completed');
  assert.equal(result.blockers.length, 0);
  assert.ok(result.completed.length >= 1);
});
