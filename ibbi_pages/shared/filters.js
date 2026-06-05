// ══════════════════ FILTERS ═══════════════════════════════════════════════

function filterInfluencers() {
  const selects = document.querySelectorAll('#biz-content .filter-bar select');
  const searchInput = document.querySelector('#biz-content .filter-bar input');
  if (!selects.length) return;
  const niche    = selects[0]?.selectedIndex > 0 ? selects[0].value : null;
  const size     = selects[1]?.selectedIndex > 0 ? selects[1].value : null;
  const platform = selects[2]?.selectedIndex > 0 ? selects[2].value : null;
  const sortBy   = selects[3]?.value || '';
  const search   = (searchInput?.value || '').toLowerCase();

  let filtered = INFLUENCERS.filter(infl => {
    if (niche && infl.niche !== niche) return false;
    if (platform) {
      const pMap = {Instagram:'ig',TikTok:'tt',YouTube:'yt',Facebook:'fb'};
      if (!infl.platforms.includes(pMap[platform])) return false;
    }
    if (size) {
      const followers = parseFloat(infl.followers) * (infl.followers.includes('K') ? 1000 : 1000000);
      if (size.includes('Nano')  && (followers < 1000   || followers >= 10000))  return false;
      if (size.includes('Micro') && (followers < 10000  || followers >= 100000)) return false;
      if (size.includes('Macro') && (followers < 100000 || followers >= 1000000))return false;
      if (size.includes('Mega')  && followers < 1000000) return false;
    }
    if (search && !infl.name.toLowerCase().includes(search) && !infl.handle.toLowerCase().includes(search)) return false;
    return true;
  });

  if (sortBy.includes('ER'))         filtered.sort((a,b) => parseFloat(b.er)-parseFloat(a.er));
  else if (sortBy.includes('Rating')) filtered.sort((a,b) => b.rating-a.rating);
  else if (sortBy.includes('Price'))  filtered.sort((a,b) => parseInt(a.price.replace(/[^\d]/g,''))-parseInt(b.price.replace(/[^\d]/g,'')));
  else filtered.sort((a,b) => parseFloat(b.followers)-parseFloat(a.followers));

  const grid = document.getElementById('infl-grid');
  const countEl = document.querySelector('#biz-content p');
  if (countEl) countEl.textContent = `${filtered.length} ${t('dis-infls-sub')}`;
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-mid)"><div style="width:56px;height:56px;border-radius:16px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="28" height="28" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-search"/></svg></div><div style="font-weight:700;color:var(--navy);margin-bottom:6px">${t('dis-no-infls')}</div><div style="font-size:.9rem">${t('dis-no-infls-sub')}</div></div>`;
    return;
  }
  grid.innerHTML = filtered.map(infl => {
    const match = calcMatch(infl);
    return `
    <div class="infl-card" style="cursor:pointer" onclick="showInflModal(${infl.id})" data-name="${h(infl.handle || infl.name)}">
      ${infl.banner_url ? `<div class="infl-banner" style="background-image:url('${h(infl.banner_url)}');background-size:cover;background-position:center"></div>` : '<div class="infl-banner"></div>'}
      <div style="padding:0 16px 16px;text-align:center">
        <div style="position:relative;display:inline-block;margin:-30px auto 10px">
          ${infl.avatar_url ? `<div style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:3px solid white;font-size:1rem"><img src="${h(infl.avatar_url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.background='linear-gradient(135deg,var(--blue),#7c3aed)';this.parentNode.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:700\\'>${infl.avatar}</span>'"></div>` : `<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;border:3px solid white;font-size:1rem">${infl.avatar}</div>`}
          <div style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;border-radius:50%;background:${matchColor(match)};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:900;color:white">${match>85?'★':''}</div>
        </div>
        <div style="font-weight:800;color:var(--navy)">${h(infl.handle || infl.name)} ${infl.verified?'<span style="color:var(--blue)">✓</span>':''}</div>
        <div style="font-size:.78rem;color:var(--text-mid);margin:1px 0 2px">${h(infl.name)}</div>
        <div style="font-size:.8rem;color:var(--text-mid);margin-bottom:8px">${h(infl.niche)}</div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:.72rem;margin-bottom:3px"><span style="color:var(--text-mid);font-weight:600">SMART MATCH</span><span style="font-weight:800;color:${matchColor(match)}">${match}%</span></div>
          <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:${match}%;background:${matchColor(match)};border-radius:3px"></div></div>
        </div>
        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <span class="badge badge-blue">${infl.followers}</span>
          <span class="badge badge-green">ER ${infl.er}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:.82rem">
          <div style="background:var(--blue-soft);border-radius:8px;padding:8px"><div style="font-weight:700;color:var(--navy)">${infl.campaigns}</div><div style="color:var(--text-mid)">${t('ic-campaigns')}</div></div>
          <div style="background:var(--blue-soft);border-radius:8px;padding:8px"><div style="font-weight:700;color:var(--navy)">${infl.rating}${starSvg()}</div><div style="color:var(--text-mid)">${t('ic-rating')}</div></div>
        </div>
        <div style="font-size:.8rem;color:var(--text-mid);margin-bottom:12px">${infl.price}</div>
        <div style="display:flex;gap:8px">
          <button onclick="event.stopPropagation();openChatWith('${infl.id}',${h(JSON.stringify(infl.handle||infl.name))},'biz')" class="btn btn-primary" style="flex:1;padding:8px;font-size:.82rem">${t('ic-message')}</button>
          <button onclick="event.stopPropagation();openInviteModal('biz','${infl.id}',this.closest('.infl-card').dataset.name)" style="flex:1;padding:8px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:8px;font-size:.82rem;cursor:pointer;color:var(--blue);font-weight:600">${t('ic-invite')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterBrands() {
  const data = APP.brands.length ? APP.brands : _BRANDS_DEMO;
  const _indEl = document.getElementById('brand-industry-filter');
  const industry = _indEl?.selectedIndex > 0 ? _indEl.value : null;
  const search = (document.getElementById('brand-search-input')?.value || '').toLowerCase();
  const filtered = data.filter(b => {
    if (industry && b.industry !== industry) return false;
    if (search && !b.name.toLowerCase().includes(search)) return false;
    return true;
  });
  const grid = document.getElementById('brand-grid');
  const countEl = document.getElementById('brand-count');
  if (countEl) countEl.textContent = `${filtered.length} ${t('dis-brands-found')}`;
  if (!grid) return;
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-mid)"><div style="width:56px;height:56px;border-radius:16px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="28" height="28" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-search"/></svg></div><div style="font-weight:700;color:var(--navy);margin-bottom:6px">${t('dis-no-brands')}</div><div style="font-size:.9rem">${t('dis-no-brands-sub')}</div></div>`;
    return;
  }
  grid.innerHTML = filtered.map(_brandCard).join('');
}
