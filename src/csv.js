export function parseCsv(source) {
  const rows = [];
  let cell = '';
  let row = [];
  let quoted = false;
  const text = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if (char === '\n' && !quoted) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  if (quoted) throw new Error('CSV 따옴표가 닫히지 않았습니다.');

  const headers = (rows.shift() || []).map(value => value.trim());
  const data = rows
    .filter(values => values.some(value => value.trim() !== ''))
    .map(values => Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()])));
  return { headers, rows: data };
}

export function toCsv(rows, headers) {
  const escape = value => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(','), ...rows.map(row => headers.map(header => escape(row[header])).join(','))].join('\n');
}
