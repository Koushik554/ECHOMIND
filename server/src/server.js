import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[EchoMind Backend] Server running on http://localhost:${PORT}`);
  console.log(`[EchoMind Backend] Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`[EchoMind Backend] AI Model configured: ${process.env.BHARATCODE_MODEL || 'qwen-3.8-27b'}`);
});

