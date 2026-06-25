import { $, escapeHtml } from './dom.js';
import { isoDate, value } from './normalise.js';

export function filterCounts(rows) {
  return {
    all: rows.length,
    'needs-check': rows.filter(row => row['확인필요'] === '예').length,
    duplicate: rows.filter(row => row['중복여부'] === '예').length,
    'due-missing': rows.filter(row => !value(row['처리기한'])).length,
    'date-format': rows.filter(row => value(row['처리기한']) && !isoDate(row['처리기한'])).length
  };
}

export function filteredRows(rows, filter) {
  const checks = {
    all: () => true,
    'needs-check': row => row['확인필요'] === '예',
    duplicate: row => row['중복여부'] === '예',
    'due-missing': row => !value(row['처리기한']),
    'date-format': row => value(row['처리기한']) && !isoDate(row['처리기한'])
  };
  return rows.filter(checks[filter] || checks.all);
}

export function renderFilters(rows, activeFilter) {
  const counts = filterCounts(rows);
  document.querySelectorAll('[data-filter]').forEach(button => {
    const filter = button.dataset.filter;
    button.disabled = !rows.length;
    button.setAttribute('aria-pressed', String(filter === activeFilter));
    button.querySelector('[data-filter-count]').textContent = counts[filter] || 0;
  });
}

export function renderResults(rows, activeFilter) {
  const visible = filteredRows(rows, activeFilter);
  const tbody = $('#resultTable');
  const label = document.querySelector(`[data-filter="${activeFilter}"]`)?.textContent.trim() || '전체';
  $('#resultCaption').textContent = rows.length ? `${label} 기준 ${visible.length}개 행을 표시합니다. 상세 버튼을 눌러 원본 내용을 확인하세요.` : '결과 행을 선택해 상세 내용을 확인하세요.';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><strong>아직 결과가 없습니다.</strong>업로드 목록에 파일을 추가한 뒤 규칙을 적용하세요.</div></td></tr>';
    return;
  }
  if (!visible.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><strong>이 조건에 맞는 행이 없습니다.</strong>다른 필터를 선택해 전체 결과를 확인하세요.</div></td></tr>';
    return;
  }
  tbody.innerHTML = visible.map(row => `
    <tr class="${row['확인필요'] === '예' ? 'row-needs-check' : ''}">
      <td>${escapeHtml(row['팀명'])}</td>
      <td>${escapeHtml(row['부서명'])}</td>
      <td>${escapeHtml(row['제목'])}</td>
      <td class="numeric">${escapeHtml(row['처리기한'] || '-')}</td>
      <td>${escapeHtml(row['우선순위'])}</td>
      <td><span class="tag ${row['확인필요'] === '예' ? 'needs-check' : 'complete'}">${escapeHtml(row['확인필요'])}</span></td>
      <td>${escapeHtml(row['정리메모'])}</td>
      <td><button class="button secondary small-button" type="button" data-row-number="${Number(row._row)}">상세</button></td>
    </tr>
  `).join('');
}

export function renderDetail(row) {
  const panel = $('#detailPanel');
  const fields = [['팀명', '팀명'], ['제출자', '제출자'], ['부서명', '부서명'], ['업무유형', '업무유형'], ['제목', '제목'], ['원본 파일', '원본파일'], ['처리상태', '처리상태'], ['처리기한', '처리기한'], ['우선순위', '우선순위'], ['중복 여부', '중복여부'], ['확인 필요', '확인필요'], ['정리 메모', '정리메모'], ['내용', '내용']];
  $('#detailContent').innerHTML = `<dl class="detail-grid">${fields.map(([label, key]) => `<div class="${key === '내용' ? 'wide' : ''}"><dt>${label}</dt><dd class="${key === '처리기한' ? 'numeric' : ''}">${escapeHtml(row[key] || '-')}</dd></div>`).join('')}</dl>`;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function hideDetail() {
  $('#detailPanel').hidden = true;
  $('#detailContent').innerHTML = '';
}
