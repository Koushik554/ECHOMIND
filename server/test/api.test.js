import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health returns HTTP 200 with service metadata', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'EchoMind Backend API');
  assert.equal(data.model, 'qwen-3.8-27b');
  assert.equal(typeof data.hasApiKey, 'boolean');
  assert.ok(data.timestamp);
});

test('POST /api/analyze fails with 400 when inputText is missing', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectTitle: 'Test' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error.code, 'VALIDATION_ERROR');
});

test('POST /api/analyze fails with 400 when inputText is shorter than 10 characters', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectTitle: 'Test', inputText: 'short' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error.code, 'INPUT_TOO_SHORT');
});

test('POST /api/analyze fails with 413 when inputText exceeds 50,000 characters', async () => {
  const hugeText = 'a'.repeat(50001);
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectTitle: 'Huge', inputText: hugeText })
  });

  assert.equal(res.status, 413);
  const data = await res.json();
  assert.equal(data.error.code, 'PAYLOAD_TOO_LARGE');
});

test('GET /api/nonexistent returns structured 404 error without leaking internals', async () => {
  const res = await fetch(`${baseUrl}/api/nonexistent-route-for-testing`);
  assert.equal(res.status, 404);

  const data = await res.json();
  assert.equal(data.error.code, 'NOT_FOUND');
  assert.ok(data.error.message.includes('/api/nonexistent-route-for-testing'));
});

