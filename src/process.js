import { applyReviewRules, makeSummary } from './review.js';
import { state } from './state.js';

export async function applyServerRules(rows) {
  const response = await fetch('/api/apply-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows, source: 'starter-template' })
  });
  const body = await response.text();
  let data = {};
  if (body) {
    try { data = JSON.parse(body); } catch { throw new Error('API 응답을 JSON으로 읽지 못했습니다.'); }
  }
  if (!response.ok) throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
  if (!Array.isArray(data.rows)) throw new Error('API 응답에 rows 배열이 없습니다.');

  state.rows = data.rows.map(row => ({ ...row }));
  state.summary = makeSummary(data.summary, state.rows, rows.length);
  state.warnings = Array.isArray(data.warnings) ? data.warnings.map(String) : [];
  state.downloaded = false;
}

export function applyFallbackRules(rows, reason) {
  state.rows = applyReviewRules(rows);
  state.summary = makeSummary(null, state.rows, rows.length);
  state.warnings = [`API를 사용할 수 없어 브라우저 fallback 규칙을 사용했습니다: ${reason}`];
  state.downloaded = false;
}
