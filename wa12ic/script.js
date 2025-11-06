const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const STORE_KEY = 'book_finder_favorites_v1';

function loadFavs() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function saveFavs(favs) {
  localStorage.setItem(STORE_KEY, JSON.stringify(favs));
}
function coverURL(doc) {
  if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160"><rect width="100%" height="100%" fill="#f6f2f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7c6f7a" font-family="Inter,system-ui" font-size="12">no cover</text></svg>`
  );
}
function bookId(doc) {
  return doc.key || (doc.edition_key && doc.edition_key[0]) || doc.title;
}
function flash(msg) {
  const s = $('#status');
  if (s) s.textContent = msg || '';
}

function renderResults(docs) {
  const list = $('#results');
  if (!list) return;
  list.innerHTML = '';
  const tpl = $('#card-tpl');
  docs.forEach(doc => {
    const node = tpl.content.cloneNode(true);
    $('.cover', node).src = coverURL(doc);
    $('.cover', node).alt = `cover of ${doc.title || 'untitled'}`;
    $('.title', node).textContent = doc.title || 'untitled';
    const authors = (doc.author_name || []).join(', ');
    const year = doc.first_publish_year ? ` • ${doc.first_publish_year}` : '';
    $('.byline', node).textContent = [authors, year].filter(Boolean).join('');
    const link = doc.key ? `https://openlibrary.org${doc.key}` : '#';
    $('.more', node).href = link;
    $('.add', node).addEventListener('click', () => addFavorite({
      id: bookId(doc),
      title: doc.title || 'untitled',
      authors,
      year: doc.first_publish_year || null,
      cover: coverURL(doc),
      link
    }));
    list.appendChild(node);
  });
}

function renderFavorites() {
  const list = $('#favorites');
  if (!list) return;
  const favs = loadFavs();
  list.innerHTML = '';
  if (!favs.length) {
    list.innerHTML = '<div class="status">no favorites yet. add from search.</div>';
    return;
  }
  const tpl = $('#fav-tpl');
  favs.forEach(item => {
    const node = tpl.content.cloneNode(true);
    $('.cover', node).src = item.cover;
    $('.cover', node).alt = `cover of ${item.title}`;
    $('.title', node).textContent = item.title;
    $('.byline', node).textContent = [item.authors, item.year ? ` • ${item.year}` : ''].filter(Boolean).join('');
    $('.remove', node).addEventListener('click', () => {
      const next = loadFavs().filter(f => f.id !== item.id);
      saveFavs(next);
      renderFavorites();
      flash('removed.');
    });
    list.appendChild(node);
  });
}

function addFavorite(item) {
  const favs = loadFavs();
  if (favs.some(f => f.id === item.id)) {
    flash('already saved.');
    return;
  }
  favs.unshift(item);
  saveFavs(favs);
  flash('saved locally.');
}

function fetchWithTimeout(url, ms=8000) {
  return Promise.race([
    fetch(url),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  ]);
}

async function search(q) {
  if (!q) return;
  const list = $('#results');
  if (list) list.setAttribute('aria-busy','true');
  flash('searching…');
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '20');
  url.searchParams.set('fields', 'key,title,author_name,first_publish_year,cover_i');
  url.searchParams.set('lang', 'en');
  try {
    const res = await fetchWithTimeout(url.toString(), 8000);
    if (!res.ok) throw new Error('api');
    const data = await res.json();
    const docs = data.docs || [];
    if (!docs.length) {
      flash('no results. try a different search.');
      if (list) list.innerHTML = '';
    } else {
      flash(`found ${docs.length} results.`);
      renderResults(docs);
    }
  } catch (e) {
    if (list) list.innerHTML = '';
    flash(e.message === 'timeout' ? 'request timed out. try again.' : 'the api seems slow or unavailable.');
  } finally {
    if (list) list.setAttribute('aria-busy','false');
  }
}

function exportJSON() {
  const favs = loadFavs();
  const blob = new Blob([JSON.stringify(favs, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'favorites.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  flash('exported.');
}

function wireIndex() {
  const form = $('#searchForm');
  if (!form) return;
  const q = $('#q');
  form.addEventListener('submit', e => {
    e.preventDefault();
    search(q.value.trim());
  });
  $('#clearBtn').addEventListener('click', () => {
    const list = $('#results');
    if (list) list.innerHTML = '';
    flash('cleared.');
  });
  window.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== q) {
      e.preventDefault();
      q.focus();
    }
  });
}

function wireFavorites() {
  const exp = $('#exportBtn');
  const del = $('#deleteAllBtn');
  if (!exp || !del) return;
  exp.addEventListener('click', exportJSON);
  del.addEventListener('click', () => {
    if (confirm('delete all favorites from this device?')) {
      localStorage.setItem(STORE_KEY, JSON.stringify([]));
      renderFavorites();
      flash('all favorites deleted.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireIndex();
  wireFavorites();
  renderFavorites();
});