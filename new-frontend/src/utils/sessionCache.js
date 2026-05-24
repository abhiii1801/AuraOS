const PAGES = ['overview','feed','finance','health','vault'];

export function markVisited(page) {
  try {
    const raw = sessionStorage.getItem('visited_pages') || '[]';
    const arr = JSON.parse(raw);
    if (!arr.includes(page)) {
      arr.push(page);
      sessionStorage.setItem('visited_pages', JSON.stringify(arr));
    }
  } catch (e) {
    sessionStorage.setItem('visited_pages', JSON.stringify([page]));
  }
}

export function hasVisitedAll() {
  try {
    const raw = sessionStorage.getItem('visited_pages') || '[]';
    const arr = JSON.parse(raw);
    return PAGES.every(p => arr.includes(p));
  } catch (e) {
    return false;
  }
}

export function resetVisited() {
  sessionStorage.removeItem('visited_pages');
}

export default { markVisited, hasVisitedAll, resetVisited };
