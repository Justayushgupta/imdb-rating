const $ = id => document.getElementById(id);
const store = {
  get(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
};
let KEY = store.get('omdb_key');
$('k').value = KEY;

$('savekey').onclick = () => {
  KEY = $('k').value.trim();
  store.set('omdb_key', KEY);
  setMsg(KEY ? 'API key saved.' : 'Key cleared.');
};

function setMsg(t, err){ const m=$('msg'); m.textContent=t; m.className=err?'err':''; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function api(params){
  const url = 'https://www.omdbapi.com/?' + new URLSearchParams({apikey:KEY, ...params});
  const res = await fetch(url);
  return res.json();
}

$('f').addEventListener('submit', async e => {
  e.preventDefault();
  KEY = $('k').value.trim() || KEY;
  if(!KEY){ setMsg('Add your free OMDb API key first (field below the search box).', true); return; }
  store.set('omdb_key', KEY);
  const q = $('q').value.trim();
  setMsg('Searching…'); $('out').innerHTML=''; $('picks').innerHTML='';
  try{
    const s = await api({s:q, type:'movie'});
    if(s.Response === 'False'){ setMsg(s.Error === 'Movie not found!' ? 'No movie found for “'+q+'”. Check the spelling.' : s.Error, true); return; }
    $('msg').textContent='';
    $('picks').innerHTML = s.Search.slice(0,8).map(m =>
      `<button data-id="${esc(m.imdbID)}">${esc(m.Title)} (${esc(m.Year)})</button>`).join('');
    $('picks').querySelectorAll('button').forEach(b => b.onclick = () => load(b.dataset.id));
    load(s.Search[0].imdbID);
  }catch(err){ setMsg('Could not reach OMDb. Check your internet connection.', true); }
});

async function load(id){
  document.querySelectorAll('#picks button').forEach(b => b.setAttribute('aria-current', b.dataset.id===id));
  try{
    const m = await api({i:id, plot:'full'});
    if(m.Response==='False'){ setMsg(m.Error, true); return; }
    render(m);
  }catch(err){ setMsg('Could not load details.', true); }
}

function ratingCard(name, value, pct, color, note){
  if(!value) return `<div class="r"><span>${name}</span><b>–</b><span>No rating</span></div>`;
  return `<div class="r"><span>${name}</span><b>${esc(value)}</b><span>${note||''}</span>
    <div class="bar"><i style="width:${pct}%;background:${color}"></i></div></div>`;
}

function render(m){
  const R = {}; (m.Ratings||[]).forEach(r => R[r.Source]=r.Value);
  const na = v => v && v!=='N/A' ? v : '';
  const imdb = na(m.imdbRating), mc = na(m.Metascore), rt = R['Rotten Tomatoes'];
  const poster = na(m.Poster);
  const row = (k,v) => na(v) ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '';
  $('out').innerHTML = `
  <article class="movie">
    ${poster ? `<img class="poster" src="${esc(poster)}" alt="Poster of ${esc(m.Title)}">` : '<div class="poster"></div>'}
    <div>
      <h2>${esc(m.Title)}</h2>
      <div class="meta">${[na(m.Year),na(m.Rated),na(m.Runtime)].filter(Boolean).map(esc).join('  |  ')}</div>
      <p class="plot">${esc(na(m.Plot)||'No plot available.')}</p>
      <dl>
        ${row('Genre',m.Genre)}${row('Director',m.Director)}${row('Writer',m.Writer)}
        ${row('Cast',m.Actors)}${row('Language',m.Language)}${row('Country',m.Country)}
        ${row('Released',m.Released)}${row('Awards',m.Awards)}${row('Box office',m.BoxOffice)}
      </dl>
      <div class="ratings">
        ${ratingCard('IMDb', imdb && imdb+' / 10', parseFloat(imdb)*10, 'var(--imdb)', na(m.imdbVotes) ? esc(m.imdbVotes)+' votes' : '')}
        ${ratingCard('Rotten Tomatoes', rt, parseInt(rt), 'var(--rt)', 'Tomatometer')}
        ${ratingCard('Metacritic', mc && mc+' / 100', parseInt(mc), 'var(--mc)', 'Metascore')}
      </div>
    </div>
  </article>`;
}
