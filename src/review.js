import { duplicateKey, isoDate, priority, status, value } from './normalise.js';

export function applyReviewRules(rows) {
  const counts = new Map();
  rows.forEach(row => counts.set(duplicateKey(row), (counts.get(duplicateKey(row)) || 0) + 1));

  return rows.map((row, index) => {
    const nextStatus = status(row['처리상태']);
    const nextPriority = priority(row['우선순위']);
    const duplicate = counts.get(duplicateKey(row)) > 1;
    const notes = issues(row, nextStatus, nextPriority, duplicate);
    return {
      ...row,
      처리상태: nextStatus,
      우선순위: nextPriority,
      중복여부: duplicate ? '예' : '아니오',
      확인필요: notes.length ? '예' : '아니오',
      정리메모: notes.length ? notes.join(', ') : '자동 정리 완료',
      _row: index + 1
    };
  });
}

export function issues(row, nextStatus, nextPriority, duplicate) {
  const notes = [];
  const due = value(row['처리기한']);
  if (!due) notes.push('처리기한 누락');
  else if (!isoDate(due)) notes.push('처리기한 형식 확인');
  if (nextStatus === '확인필요') notes.push('처리상태 확인');
  if (nextPriority === '확인필요') notes.push('우선순위 확인');
  if (duplicate) notes.push('중복 의심');
  return notes;
}

export function makeSummary(source, rows, requested) {
  const data = source && typeof source === 'object' ? source : {};
  const number = (candidate, fallback) => Number.isFinite(Number(candidate)) ? Number(candidate) : fallback;
  return {
    total: number(data.total, rows.length || requested || 0),
    needsCheck: number(data.needsCheck, rows.filter(row => row['확인필요'] === '예').length),
    duplicates: number(data.duplicates, rows.filter(row => row['중복여부'] === '예').length)
  };
}
