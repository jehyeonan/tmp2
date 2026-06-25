const text = value => String(value == null ? '' : value).trim();
const compact = value => text(value).toLowerCase().replace(/\s+/g, '');

export function status(value) {
  const map = {
    '진행': '진행', '진행중': '진행', inprogress: '진행', doing: '진행',
    '완료': '완료', '처리완료': '완료', done: '완료', finished: '완료',
    '대기': '미확인', '미처리': '미확인', todo: '미확인',
    '보류': '확인필요', hold: '확인필요'
  };
  return map[compact(value)] || '확인필요';
}

export function priority(value) {
  const map = {
    '긴급': '높음', '상': '높음', '높음': '높음', high: '높음',
    '중': '보통', '보통': '보통', normal: '보통', medium: '보통',
    '하': '낮음', '낮음': '낮음', low: '낮음'
  };
  return map[compact(value)] || '확인필요';
}

export function isoDate(value) {
  const raw = text(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}` === raw;
}

export function duplicateKey(row) {
  return ['부서명', '업무유형', '제목', '처리기한', '내용'].map(key => compact(row[key])).join('|');
}

export function value(value) { return text(value); }
