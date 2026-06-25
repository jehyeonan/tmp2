export const $ = selector => document.querySelector(selector);

export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function setStatus(kind, message) {
  const node = $('#apiStatus');
  node.className = `status ${kind}`.trim();
  node.textContent = message;
}

export function renderUploads(uploads) {
  const tbody = $('#uploadList');
  tbody.innerHTML = uploads.length ? uploads.map(item => `
    <tr>
      <td>${escapeHtml(item.teamName)}</td>
      <td>${escapeHtml(item.submitter)}</td>
      <td>${escapeHtml(item.fileName)}</td>
      <td class="numeric">${item.rowCount}</td>
      <td><span class="tag ${item.rowCount ? 'complete' : 'needs-check'}">${escapeHtml(item.status)}</span></td>
    </tr>
  `).join('') : '<tr><td colspan="5"><div class="empty-state"><strong>아직 업로드된 파일이 없습니다.</strong>샘플 CSV를 불러오거나 팀명·제출자·CSV 파일을 입력하세요.</div></td></tr>';
}

export function renderDashboard(uploads, summary) {
  const total = uploads.reduce((sum, item) => sum + item.rowCount, 0);
  const stats = summary || { total, needsCheck: 0, duplicates: 0 };
  $('#fileCount').textContent = uploads.length;
  $('#rowCount').textContent = stats.total || 0;
  $('#needsCheckCount').textContent = stats.needsCheck || 0;
  $('#duplicateCount').textContent = stats.duplicates || 0;
}

export function setWorkflow(uploads, rows, downloaded) {
  const hasUploads = uploads.length > 0;
  const hasRows = uploads.some(item => item.rowCount > 0);
  const states = {
    upload: hasUploads ? 'done' : 'active',
    validate: !hasUploads ? 'idle' : hasRows ? 'done' : 'active',
    apply: !hasRows ? 'idle' : rows.length ? 'done' : 'active',
    review: rows.length ? downloaded ? 'done' : 'active' : 'idle',
    download: rows.length ? downloaded ? 'done' : 'active' : 'idle'
  };
  document.querySelectorAll('[data-workflow]').forEach(item => {
    item.classList.remove('done', 'active');
    if (states[item.dataset.workflow] === 'done') item.classList.add('done');
    if (states[item.dataset.workflow] === 'active') item.classList.add('active');
  });
}
