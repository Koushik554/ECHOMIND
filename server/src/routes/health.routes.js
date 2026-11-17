import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EchoMind Backend API',
    version: '1.0.0',
    model: process.env.BHARATCODE_MODEL || 'glm-5.3-flash',
    offlineEngine: 'Active (Always Ready)',
    hasApiKey: Boolean(process.env.BHARATCODE_API_KEY && process.env.BHARATCODE_API_KEY !== 'your_bharatcode_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

export default router;
