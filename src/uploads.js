import { REQUIRED_HEADERS } from './constants.js';
import { parseCsv } from './csv.js';
import { state, resetResults } from './state.js';

export function addUpload(fileName, source, fallbackTeam, fallbackSubmitter) {
  const parsed = parseCsv(source);
  const missing = REQUIRED_HEADERS.filter(header => !parsed.headers.includes(header));

  if (missing.length) {
    state.uploads.push({
      teamName: fallbackTeam || '-',
      submitter: fallbackSubmitter || '-',
      fileName,
      rows: [],
      rowCount: 0,
      status: `필수 열 누락: ${missing.join(', ')}`
    });
  } else {
    const rows = parsed.rows.map(row => ({
      ...row,
      팀명: row['팀명'] || fallbackTeam,
      제출자: row['제출자'] || fallbackSubmitter,
      원본파일: fileName
    }));
    state.uploads.push({
      teamName: rows[0]?.['팀명'] || fallbackTeam || '-',
      submitter: rows[0]?.['제출자'] || fallbackSubmitter || '-',
      fileName,
      rows,
      rowCount: rows.length,
      status: rows.length ? '읽기 완료' : '읽기 완료: 행 없음'
    });
  }
  resetResults();
}

export function clearUploads() {
  state.uploads.length = 0;
  resetResults();
}

export function allRows() {
  return state.uploads.flatMap(item => item.rows);
}
