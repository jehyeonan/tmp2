export const state = {
  uploads: [],
  rows: [],
  summary: null,
  warnings: [],
  filter: 'all',
  selectedRow: null,
  downloaded: false
};

export function resetResults() {
  state.rows = [];
  state.summary = null;
  state.warnings = [];
  state.filter = 'all';
  state.selectedRow = null;
  state.downloaded = false;
}
