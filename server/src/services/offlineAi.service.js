/**
 * EchoMind Offline AI Context Engine
 * Provides deterministic, intelligent natural language context extraction
 * without requiring external paid APIs or internet access.
 * Fully conforms to the Hackathon JSON contract.
 */

export function analyzeContextOffline({ projectTitle, inputText }) {
  const text = inputText.trim();
  const title = (projectTitle || 'Untitled Project').trim();

  // Normalize and split into granular clauses (handling compound sentences with "but", "and", commas)
  const rawSegments = text
    .split(/[\r\n]+/)
    .flatMap(line => 
      line.split(/(?<=[.!?])\s+|;\s*|,\s*(?=but|however|still|need to|yet|and\s|connected|created|implemented|works|login)|\s+but\s+/i)
    )
    .map(s => s.trim().replace(/^[-*•\d.)\]\s]+/, '').trim())
    .filter(s => s.length > 3);

  const completed = [];
  const pending = [];
  const blockers = [];
  const decisions = [];
  const risks = [];
  const nextActions = [];

  // Keywords
  const completedKeywords = /\b(created|built|implemented|finished|completed|added|configured|connected|setup|set up|works|working|migrated|fixed|resolved|tested|passed|done)\b/i;
  const pendingKeywords = /\b(need to|have to|must|todo|to do|still pending|remaining|plan to|planning to|working on|in progress|will add|will fix|next step|improve)\b/i;
  const blockerKeywords = /\b(blocker|blocked|stuck|fails|failing|failed|isn't returning|is not returning|bug|issue|error|broken|exception|missing credentials|waiting for)\b/i;
  const decisionKeywords = /\b(decided|decision|chose|chosen|switched to|opted for|using .* instead of|architecture)\b/i;
  const riskKeywords = /\b(risk|risky|unknown|not sure|unclear|untested|benchmark|concern|open question)\b/i;

  for (const segment of rawSegments) {
    // 1. Check decisions
    if (decisionKeywords.test(segment)) {
      let decisionText = segment;
      let reason = 'Not specified';
      const reasonMatch = segment.match(/(?:because|since|due to|reason:|for)\s+([^,.]+)/i);
      if (reasonMatch) {
        reason = reasonMatch[1].trim();
      }
      decisions.push({
        decision: capitalize(decisionText.replace(/^decision:\s*/i, '')),
        reason: capitalize(reason)
      });
      continue;
    }

    // 2. Check blockers
    if (blockerKeywords.test(segment)) {
      blockers.push(capitalize(segment.replace(/^blocker:\s*/i, '')));
      continue;
    }

    // 3. Check risks
    if (riskKeywords.test(segment)) {
      risks.push(capitalize(segment));
      continue;
    }

    // 4. Check completed work
    if (completedKeywords.test(segment) && !pendingKeywords.test(segment)) {
      completed.push(capitalize(segment));
      continue;
    }

    // 5. Check pending work
    if (pendingKeywords.test(segment) || segment.toLowerCase().startsWith('improve') || segment.toLowerCase().startsWith('fix ')) {
      const cleanTask = segment.replace(/^(i need to|we need to|need to|have to|still have to|todo:?)\s*/i, '');
      pending.push(capitalize(cleanTask));
      continue;
    }
  }

  // Deduplicate items
  const uniqueCompleted = [...new Set(completed)];
  const uniquePending = [...new Set(pending)];
  const uniqueBlockers = [...new Set(blockers)];
  const uniqueRisks = [...new Set(risks)];

  // Fallback if clauses were ambiguous
  if (uniqueCompleted.length === 0 && uniquePending.length === 0 && uniqueBlockers.length === 0) {
    uniquePending.push(capitalize(text.slice(0, 120)));
  }

  // Determine Project Status
  let status = 'in_progress';
  if (uniqueBlockers.length > 0) {
    status = 'blocked';
  } else if (uniqueCompleted.length > 0 && uniquePending.length === 0) {
    status = 'completed';
  } else if (uniqueCompleted.length === 0 && uniquePending.length > 0) {
    status = 'in_progress';
  }

  // Generate Prioritized Next Actions
  // A. Blocker resolutions take top priority (HIGH)
  uniqueBlockers.forEach((b) => {
    nextActions.push({
      task: `Resolve blocker: ${b}`,
      priority: 'high',
      reason: 'Critical impediment currently blocking project execution'
    });
  });

  // B. Pending items prioritized by urgency keywords
  uniquePending.forEach((p, idx) => {
    const isUrgent = /\b(api|auth|database|fix|critical|bug|security)\b/i.test(p);
    nextActions.push({
      task: p,
      priority: isUrgent ? 'high' : (idx === 0 ? 'medium' : 'low'),
      reason: isUrgent
        ? 'Core architecture dependency required for operational stability'
        : 'Scheduled work item to maintain implementation velocity'
    });
  });

  // Synthesize Project Summary
  let summaryParts = [];
  if (uniqueCompleted.length > 0) {
    summaryParts.push(`Completed ${uniqueCompleted.length} task${uniqueCompleted.length > 1 ? 's' : ''} including ${uniqueCompleted[0].toLowerCase()}`);
  }
  if (uniqueBlockers.length > 0) {
    summaryParts.push(`currently blocked by ${uniqueBlockers[0].toLowerCase()}`);
  } else if (uniquePending.length > 0) {
    summaryParts.push(`actively working towards ${uniquePending[0].toLowerCase()}`);
  }

  const projectSummary = summaryParts.length > 0
    ? `${title}: ${summaryParts.join('; ')}.`
    : `${title}: Context captured and analyzed. ${text.slice(0, 100)}...`;

  return {
    project_summary: projectSummary,
    status,
    completed: uniqueCompleted,
    pending: uniquePending,
    decisions,
    blockers: uniqueBlockers,
    risks_and_unknowns: uniqueRisks,
    next_actions: nextActions.slice(0, 5),
    assumptions: []
  };
}

function capitalize(str) {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
