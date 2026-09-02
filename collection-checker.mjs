export function auditDescriptions(raw, limit = 10) {
  const lines = String(raw ?? '').split(/\r?\n/).slice(0, limit);
  const rows = lines.map((description, index) => ({
    row: index + 1,
    description: description.trim(),
  }));
  const counts = new Map();
  for (const item of rows) {
    const key = item.description.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return rows.map((item) => {
    const length = [...item.description].length;
    const key = item.description.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
    return {
      ...item,
      length,
      lengthQA: !item.description ? 'Missing' : length < 70 ? 'Review: under 70' : length > 160 ? 'Review: over 160' : 'Within 70–160 review band',
      duplicateQA: key && counts.get(key) > 1 ? 'Exact duplicate' : item.description ? 'Unique' : 'Not checked',
    };
  });
}

function render(rows) {
  const target = document.querySelector('#collection-checker-results');
  if (!target) return;
  target.replaceChildren();
  const summary = document.createElement('p');
  const flagged = rows.filter((row) => row.lengthQA !== 'Within 70–160 review band' || row.duplicateQA === 'Exact duplicate').length;
  summary.textContent = `${rows.length} row${rows.length === 1 ? '' : 's'} checked; ${flagged} flagged for review.`;
  target.append(summary);
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Row</th><th>Characters</th><th>Length QA</th><th>Duplicate QA</th></tr></thead>';
  const body = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const value of [row.row, row.length, row.lengthQA, row.duplicateQA]) {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.append(td);
    }
    body.append(tr);
  }
  table.append(body);
  target.append(table);
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#collection-checker-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const raw = document.querySelector('#collection-descriptions')?.value || '';
    render(auditDescriptions(raw));
  });
}
