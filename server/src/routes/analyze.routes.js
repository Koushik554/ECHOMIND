import express from 'express';
import { analyzeContext } from '../services/bharatcode.service.js';

const router = express.Router();

router.post('/analyze', async (req, res, next) => {
  try {
    const { projectTitle, inputText } = req.body;

    // Validation
    if (!inputText || typeof inputText !== 'string' || !inputText.trim()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input notes or work log text is required.',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (inputText.trim().length < 10) {
      return res.status(400).json({
        error: {
          code: 'INPUT_TOO_SHORT',
          message: 'Please provide at least 10 characters of project notes or work updates for analysis.',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (inputText.length > 50000) {
      return res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Input text exceeds maximum allowable limit of 50,000 characters.',
          timestamp: new Date().toISOString()
        }
      });
    }

    const title = typeof projectTitle === 'string' && projectTitle.trim()
      ? projectTitle.trim().slice(0, 100)
      : 'Untitled Project';

    const memory = await analyzeContext({ projectTitle: title, inputText: inputText.trim() });

    res.json({
      success: true,
      data: memory,
      metadata: {
        analyzed_at: new Date().toISOString(),
        character_count: inputText.trim().length,
        project_title: title
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
