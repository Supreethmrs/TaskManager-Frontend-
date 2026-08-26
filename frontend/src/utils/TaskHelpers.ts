import type { Task } from '../Dashboard';

/**
 * AI Quest Decomposer / Sub-task Generator
 * Parses any goal and suggests structured action items, estimated duration, and priority.
 */
export function generateAiSubtasks(title: string, _category?: string) {
  const lower = title.toLowerCase();

  let steps: string[] = [];
  let suggestedMins = 25;
  let suggestedPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

  if (lower.includes('code') || lower.includes('bug') || lower.includes('feature') || lower.includes('app') || lower.includes('api') || lower.includes('build')) {
    steps = [
      'Analyze requirements & edge cases',
      'Implement core logic & tests',
      'Refactor & verify clean code standards',
      'Commit, test build & deploy',
    ];
    suggestedMins = 45;
    suggestedPriority = 'HIGH';
  } else if (lower.includes('study') || lower.includes('exam') || lower.includes('read') || lower.includes('learn') || lower.includes('chapter')) {
    steps = [
      'Review high-yield concepts & definitions',
      'Practice active recall flashcards',
      'Solve sample questions / exercises',
      'Summarize key takeaways in notes',
    ];
    suggestedMins = 35;
    suggestedPriority = 'MEDIUM';
  } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('run') || lower.includes('fitness') || lower.includes('exercise')) {
    steps = [
      '5-minute dynamic warm-up & stretching',
      'Primary workout sets (focused intensity)',
      'Core & accessory burnout circuit',
      'Cool-down stretch & post-workout hydration',
    ];
    suggestedMins = 45;
    suggestedPriority = 'HIGH';
  } else if (lower.includes('clean') || lower.includes('organize') || lower.includes('room') || lower.includes('desk')) {
    steps = [
      'Declutter surface areas & discard waste',
      'Wipe down and sanitize desk/workspace',
      'Organize wires, cables & accessories',
      'Final ambient lighting & atmosphere reset',
    ];
    suggestedMins = 20;
    suggestedPriority = 'LOW';
  } else if (lower.includes('meeting') || lower.includes('call') || lower.includes('presentation') || lower.includes('pitch')) {
    steps = [
      'Prepare slide deck & talking points',
      'Review attendee list & key objectives',
      'Execute meeting & record action items',
      'Send post-call follow-up email',
    ];
    suggestedMins = 30;
    suggestedPriority = 'CRITICAL';
  } else {
    // Default smart decomposition
    steps = [
      `Outline initial scope for "${title}"`,
      'Draft primary deliverables & action points',
      'Review and refine final output',
      'Verify completion and claim victory',
    ];
    suggestedMins = 25;
    suggestedPriority = 'MEDIUM';
  }

  return {
    steps,
    estimatedMinutes: suggestedMins,
    suggestedPriority,
  };
}

/**
 * Export helpers for CSV, Markdown, and JSON
 */
export function exportTasksToCsv(tasks: Task[]) {
  const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Created At', 'Steps'];
  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${typeof t.category === 'object' && t.category ? t.category.name : t.category || 'Other'}"`,
    `"${t.priority || 'MEDIUM'}"`,
    `"${t.completed ? 'CLEARED' : 'ACTIVE'}"`,
    `"${t.dueDate ? new Date(t.dueDate).toLocaleString() : 'N/A'}"`,
    `"${t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}"`,
    `"${t.steps?.map((s) => `${s.completed ? '[x]' : '[ ]'} ${s.title}`).join('; ') || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csvContent, `taskforge-export-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportTasksToMarkdown(tasks: Task[]) {
  const completed = tasks.filter((t) => t.completed);
  const active = tasks.filter((t) => !t.completed);

  const lines = [
    `# ⚡ TaskForge HQ Mission Report`,
    `*Generated on: ${new Date().toLocaleString()}*`,
    ``,
    `## 📊 Summary`,
    `- **Total Quests:** ${tasks.length}`,
    `- **Cleared Quests:** ${completed.length}`,
    `- **Active Quests:** ${active.length}`,
    ``,
    `## 🎯 Active Missions`,
    ...(active.length === 0 ? ['*No active missions! All clear!*'] : active.map((t) => {
      const steps = t.steps && t.steps.length > 0 ? `\n  - Steps: ${t.steps.map((s) => `${s.completed ? '[x]' : '[ ]'} ${s.title}`).join(', ')}` : '';
      return `- **${t.title}** [${t.priority || 'MEDIUM'}] (Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'})${steps}`;
    })),
    ``,
    `## ✅ Cleared Missions`,
    ...(completed.length === 0 ? ['*No missions cleared yet.*'] : completed.map((t) => `- [x] ~~${t.title}~~ (${typeof t.category === 'object' && t.category ? t.category.name : t.category || 'Other'})`)),
  ];

  downloadFile(lines.join('\n'), `taskforge-report-${Date.now()}.md`, 'text/markdown;charset=utf-8;');
}

export function exportTasksToJson(tasks: Task[]) {
  const jsonContent = JSON.stringify({ exportDate: new Date().toISOString(), totalCount: tasks.length, tasks }, null, 2);
  downloadFile(jsonContent, `taskforge-backup-${Date.now()}.json`, 'application/json;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
