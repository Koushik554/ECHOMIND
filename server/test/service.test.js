import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanJsonOutput, normalizeProjectMemory } from '../src/services/bharatcode.service.js';

test('cleanJsonOutput strips markdown code fences correctly', () => {
  // Plain JSON
  assert.equal(cleanJsonOutput('{"a": 1}'), '{"a": 1}');

  // ```json fence
  const withJsonFence = '```json\n{"project_summary": "Test"}\n```';
  assert.equal(cleanJsonOutput(withJsonFence), '{"project_summary": "Test"}');

  // Generic ``` fence
  const withPlainFence = '```\n{"project_summary": "Test"}\n```';
  assert.equal(cleanJsonOutput(withPlainFence), '{"project_summary": "Test"}');

  // Extra whitespaces
  const withSpaces = '   ```json   {"a": 2}   ```   ';
  assert.equal(cleanJsonOutput(withSpaces), '{"a": 2}');
});

test('normalizeProjectMemory guarantees complete schema conforming to hackathon contract', () => {
  // Empty or invalid input
  const emptyResult = normalizeProjectMemory(null);
  assert.equal(emptyResult.status, 'in_progress');
  assert.equal(emptyResult.project_summary, 'No summary available.');
  assert.deepEqual(emptyResult.completed, []);
  assert.deepEqual(emptyResult.pending, []);
  assert.deepEqual(emptyResult.decisions, []);
  assert.deepEqual(emptyResult.blockers, []);
  assert.deepEqual(emptyResult.risks_and_unknowns, []);
  assert.deepEqual(emptyResult.next_actions, []);
  assert.deepEqual(emptyResult.assumptions, []);

  // Partial input with invalid status
  const partial = {
    project_summary: 'Migrated auth to JWT',
    status: 'invalid_status_xyz',
    completed: ['Created login route'],
    next_actions: ['Fix cookie domain']
  };

  const normalized = normalizeProjectMemory(partial);
  assert.equal(normalized.status, 'in_progress'); // fallback
  assert.equal(normalized.project_summary, 'Migrated auth to JWT');
  assert.deepEqual(normalized.completed, ['Created login route']);
  assert.equal(normalized.next_actions.length, 1);
  assert.equal(normalized.next_actions[0].task, 'Fix cookie domain');
  assert.equal(normalized.next_actions[0].priority, 'medium');

  // Valid complete input
  const full = {
    project_summary: 'E-commerce API complete',
    status: 'completed',
    completed: ['Done task 1'],
    pending: [],
    decisions: [{ decision: 'Used Postgres', reason: 'ACID requirements' }],
    blockers: [],
    risks_and_unknowns: [],
    next_actions: [{ task: 'Deploy to AWS', priority: 'high', reason: 'Go live deadline' }],
    assumptions: ['Stripe webhook secret is ready']
  };

  const normalizedFull = normalizeProjectMemory(full);
  assert.equal(normalizedFull.status, 'completed');
  assert.equal(normalizedFull.decisions[0].decision, 'Used Postgres');
  assert.equal(normalizedFull.next_actions[0].priority, 'high');
});
