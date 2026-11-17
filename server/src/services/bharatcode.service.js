import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { analyzeContextOffline } from './offlineAi.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is always loaded
const possibleEnvPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env')
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    if (process.env.BHARATCODE_API_KEY && process.env.BHARATCODE_API_KEY !== 'your_bharatcode_api_key_here') {
      break;
    }
  }
}

const SYSTEM_PROMPT = `You are EchoMind's project analyst engine. Your job is to extract structured project memory from raw notes, work logs, bug dumps, or task updates.

STRICT PRINCIPLES:
1. Act like a careful, objective project analyst—never an overconfident assistant.
2. Distinguish facts explicitly stated by the user from assumptions or suggestions.
3. If information is missing or not provided in the input, do NOT invent details, dates, people, technologies, or decisions. Use "Not specified" or leave the array empty.
4. Do NOT claim any task is completed unless the user explicitly indicates it is done.
5. Keep next actions concrete, bite-sized, and prioritized (high, medium, or low).
6. OUTPUT ONLY VALID JSON. No markdown code blocks, no backticks, no explanatory commentary.

JSON Output Schema:
{
  "project_summary": "Short summary of the project and current state based strictly on provided notes",
  "status": "not_started | in_progress | blocked | completed",
  "completed": ["Items explicitly reported as done"],
  "pending": ["Work explicitly reported as remaining or in progress"],
  "decisions": [
    {
      "decision": "Concrete decision made",
      "reason": "Reason for decision if stated, otherwise 'Not specified'"
    }
  ],
  "blockers": ["Known blockers or obstacles explicitly mentioned"],
  "risks_and_unknowns": ["Risks, missing dependencies, or open questions"],
  "next_actions": [
    {
      "task": "Specific actionable next step",
      "priority": "high",
      "reason": "Why this should be tackled next"
    }
  ],
  "assumptions": ["Any cautious assumptions made; keep array empty [] if none"]
}`;

/**
 * Validate and normalize the structured output to ensure no fields are missing.
 */
export function normalizeProjectMemory(data) {
  const validStatuses = ['not_started', 'in_progress', 'blocked', 'completed'];
  const status = validStatuses.includes(data?.status) ? data.status : 'in_progress';

  return {
    project_summary: typeof data?.project_summary === 'string' && data.project_summary.trim()
      ? data.project_summary.trim()
      : 'No summary available.',
    status,
    completed: Array.isArray(data?.completed) ? data.completed.filter(Boolean) : [],
    pending: Array.isArray(data?.pending) ? data.pending.filter(Boolean) : [],
    decisions: Array.isArray(data?.decisions)
      ? data.decisions.map(d => ({
          decision: typeof d === 'string' ? d : (d?.decision || 'Not specified'),
          reason: typeof d === 'string' ? 'Not specified' : (d?.reason || 'Not specified')
        }))
      : [],
    blockers: Array.isArray(data?.blockers) ? data.blockers.filter(Boolean) : [],
    risks_and_unknowns: Array.isArray(data?.risks_and_unknowns) ? data.risks_and_unknowns.filter(Boolean) : [],
    next_actions: Array.isArray(data?.next_actions)
      ? data.next_actions.map(a => ({
          task: typeof a === 'string' ? a : (a?.task || 'Next step'),
          priority: ['high', 'medium', 'low'].includes(a?.priority) ? a.priority : 'medium',
          reason: typeof a === 'string' ? 'Required to advance the project' : (a?.reason || 'Required to advance the project')
        }))
      : [],
    assumptions: Array.isArray(data?.assumptions) ? data.assumptions.filter(Boolean) : []
  };
}

/**
 * Clean model output string by stripping markdown fences if present
 */
export function cleanJsonOutput(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

/**
 * Main analyze context function
 * Automatically falls back to the local offline AI engine when upstream
 * quota, subscription, or network issues occur.
 */
export async function analyzeContext({ projectTitle, inputText }) {
  const forceOffline = process.env.USE_OFFLINE_AI === 'true';
  const apiKey = process.env.BHARATCODE_API_KEY;
  const baseUrl = (process.env.BHARATCODE_BASE_URL || 'https://bharatcode.ai/api/model/v1').replace(/\/$/, '');
  const model = process.env.BHARATCODE_MODEL || 'glm-5.3-flash';

  // If forced offline or no API key, use Offline AI Engine immediately
  if (forceOffline || !apiKey || apiKey === 'your_bharatcode_api_key_here') {
    console.log('[EchoMind Engine] Using local Offline AI Engine');
    const offlineResult = analyzeContextOffline({ projectTitle, inputText });
    return {
      ...normalizeProjectMemory(offlineResult),
      _engine: 'EchoMind Offline AI Engine'
    };
  }

  const userContent = `Project Title: ${projectTitle || 'Untitled Project'}

Raw Project Notes and Updates:
"""
${inputText}
"""

Analyze this input and extract structured project memory according to the required JSON schema. Output pure JSON only.`;

  const controller = new AbortController();
  const timeoutMs = 25000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = `${baseUrl}/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // If upstream requires subscription (402) or is rate limited (429) or fails, fallback to Offline AI
    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[EchoMind Engine] BharatCode upstream returned HTTP ${response.status}. Engaging local Offline AI Engine fallback.`);
      const offlineResult = analyzeContextOffline({ projectTitle, inputText });
      return {
        ...normalizeProjectMemory(offlineResult),
        _engine: `EchoMind Offline AI (Fallback from HTTP ${response.status})`
      };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.warn('[EchoMind Engine] Model returned empty content. Falling back to local engine.');
      const offlineResult = analyzeContextOffline({ projectTitle, inputText });
      return {
        ...normalizeProjectMemory(offlineResult),
        _engine: 'EchoMind Offline AI (Fallback)'
      };
    }

    const cleanedText = cleanJsonOutput(rawContent);

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        parsed = JSON.parse(cleanedText.substring(firstBrace, lastBrace + 1));
      } else {
        const offlineResult = analyzeContextOffline({ projectTitle, inputText });
        return {
          ...normalizeProjectMemory(offlineResult),
          _engine: 'EchoMind Offline AI (Fallback)'
        };
      }
    }

    return {
      ...normalizeProjectMemory(parsed),
      _engine: `BharatCode Cloud AI (${model})`
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[EchoMind Engine] Upstream request failed: ${error.message}. Engaging local Offline AI Engine.`);
    const offlineResult = analyzeContextOffline({ projectTitle, inputText });
    return {
      ...normalizeProjectMemory(offlineResult),
      _engine: 'EchoMind Offline AI (Local Mode)'
    };
  }
}
