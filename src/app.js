import { SAMPLE_FILES, RESULT_HEADERS } from './constants.js';
import { toCsv } from './csv.js';
import { $, renderDashboard, renderUploads, setStatus, setWorkflow } from './dom.js';
import { applyFallbackRules, applyServerRules } from './process.js';
import { hideDetail, renderDetail, renderFilters, renderResults } from './results-view.js';
import { state } from './state.js';
import { addUpload, allRows, clearUploads } from './uploads.js';

const refs = { team: $('#teamName'), submitter: $('#submitter'), file: $('#csvFile'), apply: $('#applyRulesBtn'), download: $('#downloadBtn'), summary: $('#summary') };

function redraw() {
  renderUploads(state.uploads);
  renderDashboard(state.uploads, state.summary);
  setWorkflow(state.uploads, state.rows, state.downloaded);
  renderFilters(state.rows, state.filter);
  renderResults(state.rows, state.filter);
  refs.download.disabled = !state.rows.length;
  refs.summary.textContent = state.rows.length
    ? `${state.uploads.length}개 CSV를 통합했습니다. 총 ${state.summary.total}행, 확인 필요 ${state.summary.needsCheck}행, 중복 의심 ${state.summary.duplicates}행.${state.warnings.length ? ` ${state.warnings.join(' ')}` : ''}`
    : state.uploads.length ? '파일을 추가했습니다. 규칙 적용을 눌러 결과와 검토 우선순위를 만드세요.' : '규칙 적용 후, 확인이 필요한 행부터 검토할 수 있습니다.';
}

function invalidate(keys) {
  [['team', refs.team], ['submitter', refs.submitter], ['file', refs.file]].forEach(([key, input]) => {
    if (keys.includes(key)) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  });
}

$('#uploadBtn').addEventListener('click', async () => {
  const team = refs.team.value.trim();
  const submitter = refs.submitter.value.trim();
  const file = refs.file.files[0];
  const missing = [!team && 'team', !submitter && 'submitter', !file && 'file'].filter(Boolean);
  invalidate(missing);
  if (missing.length) return setStatus('warn', '팀명, 제출자, CSV 파일을 모두 입력하세요.');
  try {
    addUpload(file.name, await file.text(), team, submitter);
    refs.team.value = ''; refs.submitter.value = ''; refs.file.value = '';
    hideDetail(); redraw();
    setStatus('ok', `${file.name} 파일을 업로드 목록에 추가했습니다. 규칙 적용을 눌러 결과를 갱신하세요.`);
  } catch (error) {
    setStatus('error', `CSV 파일을 읽지 못했습니다: ${error.message}`);
  }
});

$('#loadSamplesBtn').addEventListener('click', () => {
  SAMPLE_FILES.forEach(([name, text]) => addUpload(name, text, '', ''));
  hideDetail(); redraw();
  setStatus('ok', '샘플 CSV 3개를 업로드 목록에 추가했습니다. 규칙 적용을 눌러 오류·중복 후보를 확인하세요.');
});

$('#clearBtn').addEventListener('click', () => {
  clearUploads(); hideDetail(); redraw();
  setStatus('', '목록을 비웠습니다. 샘플 CSV를 불러오거나 새 CSV를 추가하세요.');
});

refs.apply.addEventListener('click', async () => {
  const rows = allRows();
  if (!state.uploads.length) return setStatus('warn', '규칙을 적용할 CSV가 없습니다. 샘플 CSV를 불러오거나 파일을 추가하세요.');
  if (!rows.length) return setStatus('warn', '규칙을 적용할 유효한 CSV 행이 없습니다. 업로드 목록의 필수 열 누락 여부를 확인하세요.');
  refs.apply.disabled = true;
  refs.apply.setAttribute('aria-busy', 'true');
  setStatus('', `${rows.length}개 행의 상태·기한·중복 규칙을 확인하고 있습니다.`);
  try {
    await applyServerRules(rows);
    setStatus('ok', `규칙 적용을 완료했습니다. 총 ${state.summary.total}행, 확인 필요 ${state.summary.needsCheck}행입니다.`);
  } catch (error) {
    applyFallbackRules(rows, error.message);
    setStatus('warn', `서버 연결에 실패해 브라우저 내 규칙으로 처리했습니다. 총 ${state.summary.total}행, 확인 필요 ${state.summary.needsCheck}행입니다.`);
  } finally {
    refs.apply.disabled = false;
    refs.apply.removeAttribute('aria-busy');
  }
  state.filter = state.summary.needsCheck ? 'needs-check' : 'all';
  state.selectedRow = null;
  hideDetail(); redraw();
});

$('#resultFilters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button || button.disabled) return;
  state.filter = button.dataset.filter;
  state.selectedRow = null;
  hideDetail(); redraw();
});

$('#resultTable').addEventListener('click', event => {
  const button = event.target.closest('[data-row-number]');
  if (!button) return;
  const row = state.rows.find(item => Number(item._row) === Number(button.dataset.rowNumber));
  if (row) { state.selectedRow = Number(row._row); renderDetail(row); }
});

$('#closeDetailBtn').addEventListener('click', () => { state.selectedRow = null; hideDetail(); });

refs.download.addEventListener('click', () => {
  if (!state.rows.length) return setStatus('warn', '다운로드할 결과가 없습니다. 규칙 적용을 먼저 누르세요.');
  const blob = new Blob(['\ufeff' + toCsv(state.rows, RESULT_HEADERS)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'team-upload-merged-result.csv';
  document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  state.downloaded = true;
  setWorkflow(state.uploads, state.rows, true);
  setStatus('ok', 'team-upload-merged-result.csv 파일을 생성했습니다.');
});

redraw();
