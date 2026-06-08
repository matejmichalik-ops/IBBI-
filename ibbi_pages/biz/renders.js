// ══════════════════ BUSINESS RENDER FUNCTIONS ═════════════════════════════════

function renderBizDashboard() {
  const active = BIZ_CAMPAIGNS.filter(c => c.status === 'active').length;
  const totalReach = BIZ_CAMPAIGNS.reduce((s, c) => s + (parseInt(String(c.reach).replace(/[KM,]/g, '')) * (String(c.reach).includes('M') ? 1000 : 1) || 0), 0);
  const totalConv = BIZ_CAMPAIGNS.reduce((s, c) => s + (Number(c.conversions) || 0), 0);
  const totalSpent = BIZ_CAMPAIGNS.reduce((s, c) => s + (parseInt(String(c.spent).replace(/[€,]/g, '')) || 0), 0);
  return `
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px">
    ${statCard(t('d-active-camps'), active || '0', `${BIZ_CAMPAIGNS.length} ${t('c-total-label')}`, active ? 'up' : '', 'megaphone')}
    ${statCard(t('d-total-reach'), totalReach >= 1000 ? (totalReach / 1000).toFixed(1).replace('.0', '') + 'M' : (totalReach || '—'), t('d-across-camps'), totalReach ? 'up' : '', 'eye')}
    ${statCard(t('d-conversions'), totalConv ? totalConv.toLocaleString() : '—', t('d-all-time'), totalConv ? 'up' : '', 'bolt')}
    ${statCard(t('d-total-spent'), totalSpent ? `€${totalSpent.toLocaleString()}` : '€0', t('d-camp-spend'), '', 'bill')}
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:28px">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h3 style="color:var(--navy);margin:0">${t('d-recent-camps')}</h3>
        <button class="btn btn-primary" style="padding:8px 16px;font-size:.85rem" onclick="bizPage('campaigns')">${t('d-view-all')}</button>
      </div>
      <table class="data-table">
        <thead><tr><th>${t('th-campaign')}</th><th>${t('th-type')}</th><th>${t('th-status')}</th><th>${t('th-reach')}</th><th>${t('th-spent')}</th></tr></thead>
        <tbody>
          ${BIZ_CAMPAIGNS.slice(0, 4).map(c => `<tr onclick="bizPage('campaigns')">
            <td style="font-weight:600">${h(c.name)}</td>
            <td>${typeBadge(c.type)}</td>
            <td>${statusBadge(c.status)}</td>
            <td>${c.reach}</td>
            <td style="font-weight:700;color:var(--blue)">${c.spent}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px">
      <div class="card">
        <h4 style="margin:0 0 16px;color:var(--navy)">${t('d-quick-actions')}</h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-secondary" style="width:100%;justify-content:flex-start;gap:10px" onclick="showCreateCampaign()"><svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><use href="#ico-campaigns"/></svg> ${t('d-create-camp')}</button>
          <button class="btn btn-secondary" style="width:100%;justify-content:flex-start;gap:10px" onclick="bizPage('discover')"><svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><use href="#ico-discover"/></svg> ${t('d-discover-infls')}</button>
          <button class="btn btn-secondary" style="width:100%;justify-content:flex-start;gap:10px" onclick="bizPage('analytics')"><svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><use href="#ico-analytics"/></svg> ${t('d-view-analytics')}</button>
        </div>
      </div>
      <div class="card">
        <h4 style="margin:0 0 14px;color:var(--navy)">${t('d-wallet-bal')}</h4>
        <div style="font-size:2rem;font-weight:800;color:var(--navy)">${APP.bizWallet?.balance !== undefined ? '€' + Number(APP.bizWallet.balance).toLocaleString() : '€0'}</div>
        <div style="font-size:.82rem;color:var(--text-mid);margin:4px 0 14px">${t('d-avail-bal')}</div>
        <button class="btn btn-secondary" style="width:100%;padding:9px" onclick="bizPage('wallet')">${t('d-top-up')}</button>
      </div>
    </div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <h3 style="color:var(--navy);margin:0">${t('d-top-infls')}</h3>
      <button class="btn btn-secondary" style="padding:7px 14px;font-size:.85rem" onclick="bizPage('discover')">${t('d-discover-more')}</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
      ${INFLUENCERS.slice(0, 4).map(infl => `
      <div class="infl-card" onclick="bizPage('discover')">
        <div class="infl-banner"></div>
        <div style="padding:12px;padding-top:0;text-align:center">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;margin:-24px auto 8px;border:3px solid white;font-size:.9rem">${infl.avatar}</div>
          <div style="font-weight:700;font-size:.9rem;color:var(--navy)">${h(infl.handle || infl.name)}</div>
          <div style="font-size:.78rem;color:var(--text-mid);margin-bottom:8px">${h(infl.niche)} · ${h(infl.followers)}</div>
          <div class="badge badge-blue" style="font-size:.72rem">ER ${infl.er}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderBizCampaigns() {
  const _campFilter = S._bizCampFilter || 'active';
  const visibleCamps = _campFilter === 'all'
    ? BIZ_CAMPAIGNS
    : _campFilter === 'archived'
    ? BIZ_CAMPAIGNS.filter(c => c.status === 'ended' || c.status === 'completed')
    : BIZ_CAMPAIGNS.filter(c => c.status !== 'ended' && c.status !== 'completed');
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
    <div>
      <h2 style="color:var(--navy);margin:0 0 4px">${t('c-my-camps')}</h2>
      <p style="color:var(--text-mid);margin:0;font-size:.9rem">${BIZ_CAMPAIGNS.length} ${t('c-total-label')}</p>
    </div>
    <button class="btn btn-primary" style="gap:8px" onclick="showCreateCampaign()">+ ${t('c-new')}</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:20px">
    ${['active','archived','all'].map(f => `
      <button onclick="S._bizCampFilter='${f}';bizPage('campaigns')"
        class="btn ${_campFilter===f ? 'btn-primary' : 'btn-secondary'}"
        style="padding:7px 16px;font-size:.85rem">
        ${f === 'active'   ? t('c-filter-active')
        : f === 'archived' ? t('c-filter-archived')
        :                    t('c-filter-all')}
      </button>`).join('')}
  </div>
  <div id="biz-camp-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">
    ${visibleCamps.map(c => bizCampCard(c)).join('')}
  </div>
  <div id="applications-drawer" class="hidden" style="margin-top:28px">
    <div class="card" style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h3 id="apps-drawer-title" style="color:var(--navy);margin:0">${t('c-applications')}</h3>
        <button onclick="document.getElementById('applications-drawer').classList.add('hidden')" style="background:none;border:none;color:var(--text-mid);cursor:pointer;font-size:1.2rem">✕</button>
      </div>
      <div id="apps-drawer-content"><p style="color:var(--text-mid)">${t('c-loading')}</p></div>
    </div>
  </div>`;
}

function renderBizDiscover() {
  const cards = INFLUENCERS.map(infl => {
    const match = calcMatch(infl);
    return `
    <div class="infl-card" style="cursor:pointer" onclick="showInflModal(${infl.id})" data-name="${h(infl.handle || infl.name)}">
      ${infl.banner_url ? `<div class="infl-banner" style="background-image:url('${h(infl.banner_url)}');background-size:cover;background-position:center"></div>` : '<div class="infl-banner"></div>'}
      <div style="padding:0 16px 16px;text-align:center">
        <div style="position:relative;display:inline-block;margin:-30px auto 10px">
          ${infl.avatar_url ? `<div style="width:60px;height:60px;border-radius:50%;overflow:hidden;border:3px solid white;font-size:1rem"><img src="${h(infl.avatar_url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.background='linear-gradient(135deg,var(--blue),#7c3aed)';this.parentNode.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:700\\'>${infl.avatar}</span>'"></div>` : `<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;border:3px solid white;font-size:1rem">${infl.avatar}</div>`}
          <div style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;border-radius:50%;background:${matchColor(match)};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:900;color:white">${match >= 85 ? '★' : ''}</div>
        </div>
        <div style="font-weight:800;color:var(--navy)">${h(infl.handle || infl.name)} ${infl.verified ? '<span style="color:var(--blue)">✓</span>' : ''}</div>
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
          <button onclick="event.stopPropagation();openChatWith('${infl.id}',${h(JSON.stringify(infl.handle || infl.name))},'biz')" class="btn btn-primary" style="flex:1;padding:8px;font-size:.82rem">${t('ic-message')}</button>
          <button onclick="event.stopPropagation();openInviteModal('biz','${infl.id}',this.closest('.infl-card').dataset.name)" style="flex:1;padding:8px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:8px;font-size:.82rem;cursor:pointer;color:var(--blue);font-weight:600">${t('ic-invite')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
  return `
  <div style="margin-bottom:24px">
    <h2 style="color:var(--navy);margin:0 0 4px">${t('dis-infls-title')}</h2>
    <p style="color:var(--text-mid);margin:0;font-size:.9rem">${INFLUENCERS.length} ${t('dis-infls-sub')}</p>
  </div>
  <div class="filter-bar">
    <select onchange="filterInfluencers()"><option>${t('f-all-niches')}</option><option>Fashion</option><option>Beauty</option><option>Fitness</option><option>Food</option><option>Tech</option><option>Travel</option><option>Gaming</option></select>
    <select onchange="filterInfluencers()"><option>${t('f-all-sizes')}</option><option>Nano (1K-10K)</option><option>Micro (10K-100K)</option><option>Macro (100K-1M)</option><option>Mega (1M+)</option></select>
    <select onchange="filterInfluencers()"><option>${t('f-any-platform')}</option><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Facebook</option></select>
    <select onchange="filterInfluencers()"><option>${t('f-sort-followers')}</option><option>${t('f-sort-er')}</option><option>${t('f-sort-rating')}</option><option>${t('f-sort-price')}</option></select>
    <input type="text" placeholder="${t('f-search-infls')}" style="min-width:200px" oninput="filterInfluencers()">
  </div>
  <div id="infl-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px">${cards}</div>`;
}

function openDiscoverInvite(inflId, inflName) {
  const camps = BIZ_CAMPAIGNS.filter(c => c.status === 'active');
  if (!camps.length) {
    toast(t('dis-no-active-camps'), 'info'); return;
  }
  const overlay = document.createElement('div');
  overlay.id = 'discover-invite-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(13,27,62,.5);'
    +'z-index:8000;display:flex;align-items:center;'
    +'justify-content:center;padding:20px;backdrop-filter:blur(4px)';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:white;border-radius:20px;
      width:100%;max-width:460px;padding:28px;
      box-shadow:0 24px 64px rgba(0,0,0,.2)">
      <div style="display:flex;justify-content:space-between;
        align-items:center;margin-bottom:20px">
        <h3 style="margin:0;color:var(--navy)">
          ${t('ci-modal-title') || 'Pozvať do kampane'}
        </h3>
        <button onclick="document.getElementById('discover-invite-overlay').remove()"
          style="background:none;border:none;font-size:1.2rem;
            cursor:pointer;color:var(--text-mid)">✕</button>
      </div>
      <p style="color:var(--text-mid);font-size:.9rem;margin:0 0 16px">
        ${t('dis-invite-to-camp')} <strong>${h(String(inflName||''))}</strong>:
      </p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${camps.map(c => `
          <button onclick="sendDiscoverInvite(${inflId},'${h(String(inflName||''))}','${c.id}','${h(c.name)}')"
            style="text-align:left;padding:12px 16px;
              border:1.5px solid var(--border);border-radius:10px;
              background:var(--blue-soft);cursor:pointer;
              font-weight:600;font-size:.9rem;color:var(--navy);transition:.15s"
            onmouseover="this.style.borderColor='var(--blue)'"
            onmouseout="this.style.borderColor='var(--border)'">
            ${h(c.name)}
            <span style="font-size:.78rem;font-weight:400;
              color:var(--text-mid);margin-left:6px">
              ${typeBadge(c.type)}
            </span>
          </button>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

async function sendDiscoverInvite(inflId, inflName, campId, campName) {
  document.getElementById('discover-invite-overlay')?.remove();
  await openChatWith(inflId, inflName, 'biz');
  setTimeout(() => {
    if (typeof openInviteModal === 'function') openInviteModal('biz');
    toast(`${h(String(inflName||''))} ${t('ic-invited-toast')}`, 'success');
  }, 300);
}

function renderBizMessages() {
  const filtered = filterMsgConvs(MESSAGES_BIZ);
  const partner = MESSAGES_BIZ.find(m => m.convId === S.chatPartner) || null;
  const chatMsgs = buildChatMsgs(partner, APP.user, 'biz');
  return `<div class="msg-layout">
    <div class="msg-convlist">
      <div class="msg-cl-header">
        <span class="msg-cl-title">${t('msg-conversations') || 'Messages'}</span>
        <button class="msg-find-btn" onclick="openFindUser('biz')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          ${t('msg-new-chat')||'New'} <kbd>⌘K</kbd>
        </button>
      </div>
      <div class="msg-search-wrap">
        <svg class="msg-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="msg-search-input" id="msg-search" placeholder="${t('f-search-infls')}" value="${h(S.msgSearch)}" oninput="setMsgSearch(this.value,'biz')">
      </div>
      <div class="msg-tabs">
        ${['all','unread','starred','creators'].map(f => `<button class="msg-tab${S.msgFilter === f ? ' active' : ''}" onclick="setMsgFilter('${f}','biz')">${msgFilterLabel(f)}</button>`).join('')}
      </div>
      <div class="msg-cl-list">${renderMsgConvList(MESSAGES_BIZ, filtered, 'biz')}</div>
    </div>
    <div class="msg-chatview">
      ${partner ? `
      <div class="msg-cv-header">
        <div class="msg-cv-avatar" style="background:${partner.color}">${partner.avatar}</div>
        <div>
          <div class="msg-cv-name">${h(partner.name)}</div>
          <div class="msg-cv-sub">${t('msg-active-infl') || 'Influencer'}</div>
        </div>
        <div class="msg-cv-actions">
          <button class="msg-cv-btn${S.msgInfoOpen ? ' active' : ''}" onclick="toggleMsgInfo('biz')" title="Info">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
        </div>
      </div>
      <div class="msg-cv-msgs" id="chat-msgs">${chatMsgs}</div>
      <div class="msg-composer">
        <input type="file" id="chat-attach-biz" class="msg-attach-input" multiple>
        <button class="msg-attach-btn" onclick="document.getElementById('chat-attach-biz').click()" title="${t('msg-attach-title')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <input class="msg-composer-input" id="chat-in" placeholder="${t('msg-placeholder')}" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg('biz')}">
        <button class="msg-collab-btn" onclick="openInviteModal('biz')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 0 12 0A6 6 0 0 0 6 9"/><path d="M12 3v2M12 13v8M8.5 6.5L7 5M15.5 6.5L17 5M4 15l2-1M20 15l-2-1"/></svg>
          ${t('msg-collaborate')}
        </button>
        <button class="btn btn-primary" style="padding:10px 20px;border-radius:12px;font-size:.88rem;flex-shrink:0" onclick="sendMsg('biz')">${t('msg-send')}</button>
      </div>` : `<div class="msg-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="1.5"><path d="M4 5H20C21.1 5 22 5.9 22 7V16C22 17.1 21.1 18 20 18H7L4 21V5Z"/></svg>
        <span>${t('msg-select-conv') || 'Select a conversation'}</span>
      </div>`}
    </div>
    ${S.msgInfoOpen && partner ? `
    <div class="msg-infopanel">
      <div class="msg-info-header">
        <div class="msg-info-avatar" style="background:${partner.color}">${partner.avatar}</div>
        <div class="msg-info-name">${h(partner.name)}</div>
        <div class="msg-info-handle">${t('msg-active-infl') || 'Influencer'}</div>
      </div>
      <div class="msg-info-section">
        <div class="msg-info-label">${t('msg-info-details')||'Details'}</div>
        ${partner.niche ? `<div class="msg-info-row"><span class="msg-info-key">${t('msg-info-niche')||'Niche'}</span><span class="msg-info-val">${h(partner.niche)}</span></div>` : ''}
        ${partner.followers ? `<div class="msg-info-row"><span class="msg-info-key">${t('msg-info-followers')||'Followers'}</span><span class="msg-info-val">${h(partner.followers)}</span></div>` : ''}
      </div>
    </div>` : ''}
  </div>`;
}

function renderBizAnalytics() {
  const tab = S.bizAnalyticsTab;
  const totalConv = BIZ_CAMPAIGNS.reduce((s, c) => s + (Number(c.conversions) || 0), 0);
  const totalSpent = BIZ_CAMPAIGNS.reduce((s, c) => s + (parseInt(String(c.spent).replace(/[€,]/g, '')) || 0), 0);
  const totalReach = BIZ_CAMPAIGNS.reduce((s, c) => {
    const r = String(c.reach); if (r === '—') return s;
    if (r.includes('M')) return s + parseFloat(r) * 1000000;
    if (r.includes('K')) return s + parseFloat(r) * 1000;
    return s + (parseInt(r) || 0);
  }, 0);
  const roas = totalSpent > 0 && totalConv > 0 ? (totalConv / totalSpent * 3).toFixed(1) + '×' : '—';
  return `
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px">
    ${statCard(t('an-total-reach'), totalReach >= 1000000 ? (totalReach / 1000000).toFixed(1).replace('.0', '') + 'M' : totalReach >= 1000 ? Math.round(totalReach / 1000) + 'K' : (totalReach || '—'), t('d-across-camps'), totalReach ? 'up' : '', 'eye')}
    ${statCard(t('an-total-convs'), totalConv ? totalConv.toLocaleString() : '—', t('d-all-time'), totalConv ? 'up' : '', 'bolt')}
    ${statCard(t('an-total-spent'), totalSpent ? `€${totalSpent.toLocaleString()}` : '€0', t('d-camp-budget'), '', 'bar-chart')}
    ${statCard(t('an-roas'), roas, t('d-roas'), roas !== '—' ? 'up' : '', 'coin')}
  </div>
  <div class="card" style="margin-bottom:24px">
    <div class="tab-bar">
      ${['performance', 'campaigns', 'collaboration'].map(tb => `<button class="tab-btn ${tab === tb ? 'active' : ''}" onclick="setBizAnalyticsTab('${tb}')">${t('tab-' + tb)}</button>`).join('')}
    </div>
    ${tab === 'performance' ? `
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('an-perf-title')}</h4><div class="chart-wrap"><canvas id="biz-perf-chart"></canvas></div></div>
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('an-mix-title')}</h4><div class="chart-wrap"><canvas id="biz-mix-chart"></canvas></div></div>
      </div>` : ''}
    ${tab === 'campaigns' ? `
      <h4 style="color:var(--navy);margin:0 0 12px">${t('an-camp-title')}</h4>
      <div class="chart-wrap"><canvas id="biz-camp-chart"></canvas></div>
      <table class="data-table" style="margin-top:20px">
        <thead><tr><th>${t('th-campaign')}</th><th>${t('th-type')}</th><th>${t('th-reach')}</th><th>${t('th-conversions')}</th><th>${t('th-spent')}</th><th>${t('th-roas')}</th></tr></thead>
        <tbody>
          ${BIZ_CAMPAIGNS.filter(c => c.status !== 'draft').map(c => `<tr>
            <td style="font-weight:600">${h(c.name)}</td>
            <td>${typeBadge(c.type)}</td>
            <td>${c.reach}</td>
            <td>${c.conversions.toLocaleString()}</td>
            <td>${c.spent}</td>
            <td class="badge badge-green">${c.conversions > 0 ? (c.conversions / (parseInt(c.spent.replace(/[€,]/g, '')) || 1) * 3).toFixed(1) + '×' : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : ''}
    ${tab === 'collaboration' ? `
      <h4 style="color:var(--navy);margin:0 0 12px">${t('an-infl-title')}</h4>
      <div class="chart-wrap"><canvas id="biz-collab-chart"></canvas></div>` : ''}
  </div>`;
}

function renderBizWallet() {
  const tab = S.bizWalletTab;
  const bw = APP.bizWallet;
  const balance = bw ? `€${Number(bw.balance || 0).toLocaleString()}` : '€0';
  const totalSpent = bw ? `€${Number(bw.total_spent || 0).toLocaleString()}` : '€0';
  const totalTopup = bw ? `€${Number(bw.total_topup || 0).toLocaleString()}` : '€0';
  const activeCamps = BIZ_CAMPAIGNS.filter(c => c.status === 'active').length;
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px">
    <div class="wallet-card">
      <div style="font-size:.85rem;opacity:.7;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">${t('w-avail-bal')}</div>
      <div style="font-size:3rem;font-weight:900;margin-bottom:4px">${balance}</div>
      <div style="font-size:.88rem;opacity:.7">${t('w-total-topped')} ${totalTopup}</div>
      ${Number(bw?.balance || 0) < 100 && Number(bw?.balance || 0) > 0 ? `<div style="margin-top:10px;padding:7px 12px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.4);border-radius:8px;font-size:.8rem;color:#f59e0b;font-weight:600">${t('w-low-balance')}</div>` : ''}
      <div style="display:flex;gap:10px;margin-top:20px">
        <button onclick="showBizTopupModal()" style="padding:10px 20px;background:rgba(255,255,255,.2);color:white;border:1.5px solid rgba(255,255,255,.3);border-radius:10px;font-weight:700;cursor:pointer;font-size:.9rem">${t('w-top-up-btn')}</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${statCard(t('w-total-spent-lbl'), totalSpent, t('w-lifetime'), '', 'bill')}
      ${statCard(t('w-total-topup-lbl'), totalTopup, t('w-all-time'), '', 'coin')}
      ${statCard(t('w-active-camps'), String(activeCamps), t('w-funded'), '', 'megaphone')}
      ${statCard(t('w-camps-run'), String(BIZ_CAMPAIGNS.length), t('w-all-time'), '', 'bar-chart')}
    </div>
  </div>
  <div class="card">
    <div class="tab-bar">
      ${['overview', 'transactions'].map(tb => `<button class="tab-btn ${tab === tb ? 'active' : ''}" onclick="setBizWalletTab('${tb}')">${t('tab-' + tb)}</button>`).join('')}
    </div>
    ${tab === 'overview' ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('w-monthly-spend')}</h4><div class="chart-wrap"><canvas id="biz-spend-chart"></canvas></div></div>
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('w-spend-by-type')}</h4><div class="chart-wrap"><canvas id="biz-spend-type-chart"></canvas></div></div>
      </div>` : ''}
    ${tab === 'transactions' ? `
      <table class="data-table">
        <thead><tr><th>${t('w-date')}</th><th>${t('w-description')}</th><th>${t('w-amount')}</th></tr></thead>
        <tbody>
          ${BIZ_TRANSACTIONS.map(tr => `<tr>
            <td style="color:var(--text-mid);font-size:.85rem">${tr.date}</td>
            <td>${tr.desc}</td>
            <td style="font-weight:700;color:${tr.type === 'credit' ? '#10b981' : '#ef4444'}">${tr.amount}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : ''}
  </div>`;
}

// ── Profile image helpers ─────────────────────────────────────────────────────
function previewBanner(input, targetId) {
  if (!input.files?.[0]) return;
  const reader = new FileReader();
  reader.onload = e => { const el = document.getElementById(targetId); if (el) el.style.backgroundImage = `url('${e.target.result}')`; };
  reader.readAsDataURL(input.files[0]);
}
function previewAvatar(input, targetId) {
  if (!input.files?.[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById(targetId); if (!el) return;
    el.style.backgroundImage = `url('${e.target.result}')`;
    el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center';
    const svg = el.querySelector('svg'); if (svg) svg.style.display = 'none';
  };
  reader.readAsDataURL(input.files[0]);
}

async function uploadBizAvatar(file) {
  if (!file) return;
  const allowed = ['image/jpeg','image/png','image/webp'];
  if (!allowed.includes(file.type)) { toast(t('upload-allowed-formats'), 'error'); return; }
  if (file.size > 5*1024*1024) { toast(t('upload-max-size-avatar'), 'error'); return; }

  const loading = document.getElementById('biz-avatar-loading');
  const hover   = document.getElementById('biz-avatar-hover');
  if (loading) loading.style.display = 'flex';
  if (hover)   hover.style.opacity = '0';

  const uid = APP.user?.id;
  if (!uid) { toast(t('upload-not-logged-in'), 'error'); if (loading) loading.style.display = 'none'; return; }

  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${uid}/avatar.${ext}`;

  const { error: upErr } = await _sb.storage.from('avatars').upload(path, file, { upsert: true });
  if (upErr) { toast(t('upload-failed') + upErr.message, 'error'); if (loading) loading.style.display = 'none'; return; }

  const { data: urlData } = _sb.storage.from('avatars').getPublicUrl(path);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) { toast(t('upload-avatar-url-fail'), 'error'); if (loading) loading.style.display = 'none'; return; }

  const cacheBusted = publicUrl + '?t=' + Date.now();
  await _sb.from('business_profiles').update({ avatar_url: publicUrl }).eq('user_id', uid);
  APP.profile = Object.assign(APP.profile || {}, { avatar_url: publicUrl });

  const imgEl = document.getElementById('biz-avatar-img');
  if (imgEl) { imgEl.style.background = `url('${cacheBusted}') center/cover no-repeat`; imgEl.innerHTML = ''; }

  const topbarAv = document.getElementById('biz-topbar-avatar');
  if (topbarAv) topbarAv.innerHTML = `<img src="${cacheBusted}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;

  if (loading) loading.style.display = 'none';
  toast(t('upload-avatar-success'), 'success');
}

async function uploadBizBanner(file) {
  if (!file) return;
  const allowed = ['image/jpeg','image/png','image/webp'];
  if (!allowed.includes(file.type)) {
    toast(t('upload-allowed-formats'), 'error'); return;
  }
  if (file.size > 5*1024*1024) {
    toast(t('upload-max-size-banner'), 'error'); return;
  }
  const uid = APP.user?.id;
  if (!uid) { toast(t('upload-not-logged-in'), 'error'); return; }

  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${uid}/banner.${ext}`;
  const { error: upErr } = await _sb.storage
    .from('banners').upload(path, file, { upsert: true });
  if (upErr) { toast(t('upload-failed') + upErr.message, 'error'); return; }

  const { data: urlData } = _sb.storage
    .from('banners').getPublicUrl(path);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) { toast(t('upload-failed'), 'error'); return; }

  await _sb.from('business_profiles')
    .update({ banner_url: publicUrl }).eq('user_id', uid);
  APP.profile = Object.assign(APP.profile || {}, { banner_url: publicUrl });
  const bannerEl = document.getElementById('biz-banner');
  if (bannerEl) bannerEl.style.backgroundImage =
    `url('${publicUrl}?t=${Date.now()}')`;
  toast(t('upload-banner-success'), 'success');
}

function toggleBizProfileEdit() {
  S._bizProfileEdit = !S._bizProfileEdit;
  const content = document.getElementById('biz-content');
  if (content) content.innerHTML = renderBizProfile();
}

function saveBizProfileInline() {
  const p = {
    company_name: document.getElementById('biz-prof-company')?.value.trim(),
    industry:     document.getElementById('biz-prof-industry')?.value.trim(),
    website:      document.getElementById('biz-prof-website')?.value.trim() || null,
    country:      document.getElementById('biz-prof-country')?.value.trim() || null,
    region:       document.getElementById('biz-prof-region')?.value || null,
    city:         document.getElementById('biz-prof-city')?.value || null,
    phone: (() => { const prefix = document.getElementById('biz-prof-phone-prefix')?.value||''; const num = document.getElementById('biz-prof-phone')?.value.trim()||''; return prefix && num ? prefix+' '+num : num||null; })(),
    about:        document.getElementById('biz-prof-about')?.value.trim() || null,
    description:  document.getElementById('biz-prof-about')?.value.trim() || null,
  };
  if (!p.company_name) { toast(t('toast-company-req'), 'error'); return; }
  _sb.from('business_profiles').update(p).eq('user_id', APP.user.id).then(({ error }) => {
    if (error) { toast(error.message, 'error'); return; }
    APP.profile = Object.assign(APP.profile || {}, p);
    S._bizProfileEdit = false;
    const content = document.getElementById('biz-content');
    if (content) content.innerHTML = renderBizProfile();
    toast(t('toast-profile-saved'), 'success');
  });
}

function renderBizProfile() {
  if (APP.user && !APP.profile) return `<div style="display:flex;align-items:center;justify-content:center;height:260px;color:var(--text-mid)"><div style="text-align:center"><div style="width:48px;height:48px;border:3px solid var(--blue-mid);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div>${t('prof-loading')}</div></div>`;
  const pd = renderBizProfileData();
  const campCount = BIZ_CAMPAIGNS.length;
  const acceptedTotal = BIZ_CAMPAIGNS.reduce((s, c) => s + (c.accepted || 0), 0);
  const editing = S._bizProfileEdit;
  const p = APP.profile || {};
  return `
  <div style="max-width:760px">
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
      <div class="profile-banner" style="position:relative">
        <label title="Upload banner" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.4);color:#fff;padding:5px 10px;border-radius:8px;cursor:pointer;font-size:.78rem;font-weight:600">📷 Banner<input type="file" accept="image/*" style="display:none" onchange="uploadBizBanner(this.files[0])"></label>
        <div id="biz-banner" style="position:absolute;inset:0;background-size:cover;background-position:center;border-radius:inherit${APP.profile?.banner_url ? `;background-image:url('${APP.profile.banner_url}')` : ''}"></div>
        <div id="biz-avatar-area"
             style="position:absolute;bottom:-45px;left:28px;width:90px;height:90px;border-radius:18px;border:4px solid white;box-shadow:0 4px 16px rgba(0,0,0,.12);overflow:hidden;cursor:pointer"
             onclick="document.getElementById('biz-avatar-input').click()"
             onmouseover="document.getElementById('biz-avatar-hover').style.opacity='1'"
             onmouseout="document.getElementById('biz-avatar-hover').style.opacity='0'">
          <input type="file" id="biz-avatar-input" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="uploadBizAvatar(this.files[0])">
          <div id="biz-avatar-img" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.3rem;${APP.profile?.avatar_url ? `background:url('${APP.profile.avatar_url}?t=${Date.now()}') center/cover no-repeat` : 'background:linear-gradient(135deg,var(--blue),var(--blue-dark))'}">
            ${APP.profile?.avatar_url ? '' : '<svg width="44" height="44" viewBox="0 0 24 24" style="color:white"><use href="#ico-building"/></svg>'}
          </div>
          <div id="biz-avatar-hover" style="position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;pointer-events:none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="13" r="4"/><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>
          </div>
          <div id="biz-avatar-loading" style="position:absolute;inset:0;background:rgba(13,27,62,.6);display:none;align-items:center;justify-content:center">
            <div style="width:24px;height:24px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite"></div>
          </div>
        </div>
      </div>
      <div style="padding:60px 28px 28px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <h2 style="color:var(--navy);margin:0 0 4px">${h(pd.name)}${APP.profile?.verified ? ` <span style="color:var(--blue);font-size:.9rem;font-weight:600">${t('prof-verified')}</span>` : ''}</h2>
            <div style="color:var(--text-mid);margin-bottom:12px;font-size:.9rem">${h(pd.industry)}${pd.country ? ` · <svg width="13" height="13" viewBox="0 0 24 24" style="color:var(--text-mid);vertical-align:middle"><use href="#ico-pin"/></svg> ${h(pd.country)}` : ''}${pd.website ? ` · <a href="${h(pd.website.startsWith('http') ? pd.website : 'https://' + pd.website)}" target="_blank" rel="noopener noreferrer" style="color:var(--blue);font-weight:600;text-decoration:none" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><use href="#ico-globe"/></svg>${h(pd.website.replace(/^https?:\/\//, ''))}</a>` : ''}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${pd.industry ? `<span class="badge badge-blue">${h(pd.industry)}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-primary" style="padding:9px 18px" onclick="toggleBizProfileEdit()">${t('prof-edit-btn')}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px">
          ${miniStat(t('prof-camps-run'), campCount)} ${miniStat(t('prof-infls-worked'), acceptedTotal)} ${miniStat(t('prof-rating-label'), APP.profile?.avg_rating ? APP.profile.avg_rating.toFixed(1) + ' ★' : (APP.profile?.rating ? APP.profile.rating.toFixed(1) + ' ★' : '—'))} ${miniStat(t('prof-reviews-count'), (APP.profile?.rating_count || 0).toString())}
        </div>
        ${editing ? `
        <div style="margin-top:22px;border-top:1px solid var(--border);padding-top:22px">
          <h4 style="color:var(--navy);margin:0 0 16px">${t('prof-edit-biz')}</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            ${settingField(t('fld-company-name'), p.company_name || '', 'biz-prof-company')}
            ${settingSelect(t('fld-industry'), p.industry || '', 'biz-prof-industry', INDUSTRIES)}
            ${settingField(t('fld-website'), p.website || '', 'biz-prof-website')}
            ${settingCountry(t('fld-country')||'Krajina', p.country||'', 'biz-prof-country', p.region||'', 'biz-prof-region', p.city||'', 'biz-prof-city')}
            ${settingPhone(t('fld-phone')||'Telefón', (p.phone||'').replace(/^\+\d+\s*/,''), (p.phone||'').match(/^\+\d+/)?.[0]||'+421', 'biz-prof-phone', 'biz-prof-phone-prefix')}
          </div>
          <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-top:14px;margin-bottom:6px">${t('prof-about')}</label>
          <textarea id="biz-prof-about" rows="3" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;resize:vertical">${h(p.about || p.description || '')}</textarea>
          <div style="display:flex;gap:10px;margin-top:14px">
            <button class="btn btn-primary" onclick="saveBizProfileInline()">${t('prof-save')}</button>
            <button class="btn btn-secondary" onclick="toggleBizProfileEdit()">${t('prof-cancel')}</button>
          </div>
        </div>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-about')}</h4>
        <p style="color:var(--text-mid);font-size:.9rem;line-height:1.6;margin:0">${h(pd.about) || t('prof-about-placeholder')}</p>
      </div>
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-active-camps')}</h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${BIZ_CAMPAIGNS.filter(c => c.status === 'active').length ? BIZ_CAMPAIGNS.filter(c => c.status === 'active').map(c => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--blue-soft);border-radius:10px">
            <div>
              <div style="font-weight:700;font-size:.88rem;color:var(--navy)">${h(c.name)}</div>
              <div style="font-size:.78rem;color:var(--text-mid);margin-top:2px">${c.type} · ${c.apps} ${t('c-applicants')}</div>
            </div>
            ${statusBadge(c.status)}
          </div>`).join('') : `<div style="color:var(--text-mid);font-size:.88rem">${t('prof-no-active-camps')}</div>`}
        </div>
      </div>
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-reviews')}</h4>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${APP._bizReviews?.length ? APP._bizReviews.map(r => `
          <div style="padding:12px 14px;background:var(--blue-soft);border-radius:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <div style="font-weight:700;font-size:.85rem;color:var(--navy)">${h(r.name)}</div>
              <div style="display:flex;align-items:center;gap:1px">${starRating(r.stars)}</div>
            </div>
            <div style="font-size:.82rem;color:var(--text-mid)">${h(r.text)}</div>
          </div>`).join('') : `<div style="color:var(--text-mid);font-size:.88rem">${t('prof-no-reviews')}</div>`}
        </div>
      </div>
    </div>
  </div>`;
}

function renderBizSettings() {
  if (APP.user && !APP.profile) return `<div style="display:flex;align-items:center;justify-content:center;height:260px;color:var(--text-mid)"><div style="text-align:center"><div style="width:48px;height:48px;border:3px solid var(--blue-mid);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div>${t('set-loading')}</div></div>`;
  const p = APP.profile || {};
  const sub = APP.bizSubscription;
  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('sk', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const campCount = BIZ_CAMPAIGNS.length;
  const activeCampCount = BIZ_CAMPAIGNS.filter(c => c.status === 'active').length;
  const intervalLabel = sub?.interval === 'year' ? t('sub-annual-label') : t('sub-monthly-label');

  const subCard = sub?.status === 'active' ? `
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 16px">${t('sub-section-title')}</h3>
      <div class="pu-settings-card pu-active-card">
        <div class="pu-card-head">
          <div class="pu-plan-row">
            <div class="pu-plan-icon">⚡</div>
            <div>
              <div class="pu-plan-name">Pro Plan <span style="font-size:.7rem;font-weight:600;color:var(--text-mid);margin-left:4px">${intervalLabel}</span></div>
              <div class="pu-plan-renewal">${sub.status === 'canceling' ? `⚠ ${t('sub-canceling-on')} ${renewalDate}` : `${t('sub-renewal')} ${renewalDate}`}${sub.stripe_last4 ? ` · •••• ${h(sub.stripe_last4)}` : ''}</div>
            </div>
          </div>
          <span class="pu-pro-badge">⚡ ${t('sub-pro-badge')}</span>
        </div>
        <div class="pu-active-metric-grid">
          <div class="pu-metric-cell">
            <div class="pu-metric-val">€${Number(sub.plan_price || 0).toLocaleString()}</div>
            <div class="pu-metric-lbl">${t('sub-per-month').replace('/', '')}</div>
          </div>
          <div class="pu-metric-cell">
            <div class="pu-metric-val">${activeCampCount}</div>
            <div class="pu-metric-lbl">${t('d-active-camps')}</div>
          </div>
          <div class="pu-metric-cell">
            <div class="pu-metric-val">${campCount}</div>
            <div class="pu-metric-lbl">${t('c-total-label')}</div>
          </div>
        </div>
        <div class="pu-card-actions">
          <button class="pu-btn-secondary" onclick="_handleManagePayment()">${t('sub-manage-payment')}</button>
          ${sub.status === 'canceling'
            ? `<button class="pu-btn-danger" disabled
                 style="opacity:.5;cursor:not-allowed">
                 ${t('sub-cancel')}
               </button>`
            : `<button class="pu-btn-danger" onclick="_handleCancelSub()">
                 ${t('sub-cancel')}
               </button>`
          }
        </div>
      </div>
    </div>` : `
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 16px">${t('sub-section-title')}</h3>
      <div class="pu-upsell-card">
        <div class="pu-upsell-head">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <div class="pu-upsell-icon">⚡</div>
              <div>
                <div class="pu-upsell-title">${t('sub-upgrade-title')}</div>
                <div class="pu-upsell-sub">${t('sub-upgrade-sub')}</div>
              </div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div class="pu-upsell-price">€6,67<span>${t('sub-per-month')}</span></div>
            <div style="font-size:.72rem;color:rgba(255,255,255,.5)">${t('sub-annual-save')}</div>
          </div>
        </div>
        <div class="pu-upsell-features">
          ${['sub-feat-1','sub-feat-2','sub-feat-3','sub-feat-4','sub-feat-5','sub-feat-6'].map(k =>
            `<div class="pu-upsell-feat"><div class="pu-upsell-feat-dot"></div>${t(k)}</div>`
          ).join('')}
        </div>
        <button class="pu-upsell-cta" onclick="showSubscriptionModal()">${t('sub-get-pro')} →</button>
      </div>
    </div>`;

  return `
  <div style="max-width:700px">
    <h2 style="color:var(--navy);margin:0 0 24px">${t('set-title')}</h2>
    ${subCard}
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">${t('set-company-profile')}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        ${settingField(t('fld-company-name'), p.company_name || '', 'set-company')}
        ${settingSelect(t('fld-industry'), p.industry || '', 'set-industry', INDUSTRIES)}
        ${settingField(t('fld-work-email'), APP.user?.email || p.email || '', 'set-email')}
        ${settingField(t('fld-website'), p.website || '', 'set-website')}
        ${settingCountry(t('fld-country')||'Krajina', p.country||'', 'bset-country', p.region||'', 'bset-region', p.city||'', 'bset-city')}
        ${settingPhone(t('fld-phone')||'Telefón', (p.phone||'').replace(/^\+\d+\s*/,''), (p.phone||'').match(/^\+\d+/)?.[0]||'+421', 'set-phone', 'set-phone-prefix')}
      </div>
      <div style="margin-top:4px;font-size:.82rem;color:var(--text-mid)">${t('fld-about-company')}</div>
      <textarea id="set-about" rows="3" style="width:100%;margin-top:8px;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;resize:vertical">${p.about || ''}</textarea>
      <div id="set-biz-err" style="color:#ef4444;font-size:.85rem;margin-top:6px;display:none"></div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="saveBizProfile()">${t('prof-save')}</button>
    </div>
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">${t('set-notifications')}</h3>
      ${toggle(t('notif-new-apps'), t('notif-new-apps-desc'), true)}
      ${toggle(t('notif-milestones'), t('notif-milestones-desc'), true)}
      ${toggle(t('notif-messages'), t('notif-msg-biz-desc'), true)}
      ${toggle(t('notif-weekly'), t('notif-weekly-desc'), false)}
    </div>
    <div class="card" style="padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">${t('set-security')}</h3>
      <button class="btn btn-secondary" style="margin-right:12px" onclick="showChangePassword()">${t('set-change-pwd')}</button>
      <button class="btn btn-secondary" id="btn-2fa" onclick="show2FASetup()">${t('set-enable-2fa')}</button>
      <div style="margin-top:20px;padding:14px;background:#fff5f5;border-radius:10px;border:1px solid #fecaca">
        <div style="font-weight:700;color:#991b1b;margin-bottom:4px">${t('set-danger-zone')}</div>
        <div style="font-size:.88rem;color:#b91c1c;margin-bottom:10px">${t('set-delete-warn-biz')}</div>
        <button style="padding:8px 16px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:.85rem">${t('set-delete-account')}</button>
      </div>
    </div>
  </div>`;
}

// ── Business topup modal (standalone, appended to body) ──────────────────
function showBizTopupModal() {
  document.getElementById('biz-topup-modal')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'biz-topup-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:36px;width:100%;max-width:380px;box-shadow:0 24px 80px rgba(0,0,0,.25)" onclick="event.stopPropagation()">
      <h3 style="margin:0 0 6px;color:var(--navy)">${t('w-top-up-title')}</h3>
      <p style="font-size:.88rem;color:var(--text-mid);margin-bottom:22px">${t('w-topup-sub')}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        ${[50, 100, 200, 500, 1000, 2000].map(a => `<button onclick="document.getElementById('topup-amount').value=${a}" style="padding:10px;border:1.5px solid var(--border);border-radius:10px;font-weight:700;cursor:pointer;background:#fff;color:var(--navy);font-size:.9rem;transition:all .15s" onmouseover="this.style.borderColor='var(--blue)'" onmouseout="this.style.borderColor='var(--border)'">€${a}</button>`).join('')}
      </div>
      <input id="topup-amount" type="number" min="10" placeholder="${t('w-custom-amount')}" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.95rem;outline:none;margin-bottom:14px;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <button class="btn btn-primary" style="width:100%;padding:13px;font-size:1rem;margin-bottom:10px" onclick="topUpBizWallet()">${t('w-pay-card')}</button>
      <button style="width:100%;padding:10px;background:none;border:none;color:var(--text-mid);cursor:pointer;font-size:.88rem" onclick="document.getElementById('biz-topup-modal').remove()">${t('w-cancel')}</button>
    </div>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

// ── Subscription modal ────────────────────────────────────────────────────────
let _subBillingAnnual = true;

function showSubscriptionModal() {
  document.getElementById('sub-modal')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'sub-modal';
  overlay.className = 'pu-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  _renderPricingModal();
}

function _renderPricingModal() {
  const overlay = document.getElementById('sub-modal');
  if (!overlay) return;
  const annual = _subBillingAnnual;
  const monthlyPrice = 8;
  const annualPrice = 6.67;
  const annualTotal = 80;
  const price = annual ? annualPrice : monthlyPrice;
  const billedNote = annual
    ? `€${annualTotal} ${t('sub-annual-label').toLowerCase()}`
    : `€${monthlyPrice} ${t('sub-monthly-label').toLowerCase()}`;

  overlay.innerHTML = `
    <div class="pu-modal" onclick="event.stopPropagation()">
      <div class="pu-modal-head">
        <button class="pu-modal-close" onclick="document.getElementById('sub-modal').remove()">✕</button>
        <div class="pu-modal-icon">⚡</div>
        <h2 class="pu-modal-title">${t('sub-modal-title')}</h2>
        <p class="pu-modal-sub">${t('sub-upgrade-sub')}</p>
      </div>
      <div class="pu-billing-wrap">
        <span class="pu-billing-label${!annual ? ' pu-active' : ''}">${t('sub-monthly-label')}</span>
        <button class="pu-billing-toggle${annual ? ' pu-active' : ''}" onclick="toggleSubBilling()" aria-label="Toggle billing period">
          <span class="pu-toggle-knob"></span>
        </button>
        <span class="pu-billing-label${annual ? ' pu-active' : ''}">${t('sub-annual-label')}</span>
        ${annual ? `<span class="pu-save-pill">${t('sub-annual-save')}</span>` : ''}
      </div>
      <div class="pu-price-wrap">
        <div class="pu-price-card pu-featured">
          <div class="pu-price-num">€${price}<span>${t('sub-per-month')}</span></div>
          <div class="pu-price-billed">
            ${annual ? `<span class="pu-price-orig">€8${t('sub-per-month')}</span>` : ''}
            ${billedNote}
          </div>
          <button id="pu-cta-btn" class="pu-cta-btn" onclick="startCheckout('${annual ? 'annual' : 'monthly'}')">${t('sub-get-pro')}</button>
        </div>
      </div>
      <div class="pu-features">
        <div class="pu-features-title">What's included</div>
        <div class="pu-features-grid">
          ${['sub-feat-1','sub-feat-2','sub-feat-3','sub-feat-4','sub-feat-5','sub-feat-6','sub-feat-7'].map(k =>
            `<div class="pu-feat-item"><div class="pu-feat-icon">✓</div>${t(k)}</div>`
          ).join('')}
        </div>
      </div>
      <div class="pu-modal-footer">
        <div class="pu-secure-note">🔒 ${t('sub-secure-stripe')}</div>
        <div style="font-size:.78rem;color:var(--text-faint);margin-bottom:14px">${t('sub-no-commitment')}</div>
        <button class="pu-close-link" onclick="document.getElementById('sub-modal').remove()">${t('prof-cancel')}</button>
      </div>
    </div>`;
}

function toggleSubBilling() {
  _subBillingAnnual = !_subBillingAnnual;
  _renderPricingModal();
}

// ── Subscription actions ──────────────────────────────────────────────────────
async function startCheckout(plan) {
  const btn = document.getElementById('pu-cta-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('sub-processing'); }
  try {
    const { data, error } = await _sb.functions.invoke('create-checkout-session', {
      body: {
        plan,
        business_id: APP.profileId,
        success_url: `${location.origin}${location.pathname}?sub=success`,
        cancel_url: `${location.origin}${location.pathname}?sub=cancel`,
      },
    });
    if (error) throw error;
    if (data?.url) { window.location.href = data.url; return; }
    throw new Error('No checkout URL returned');
  } catch (err) {
    console.error('startCheckout:', err);
    toast(t('sub-checkout-unavailable'), 'info');
    if (btn) { btn.disabled = false; btn.textContent = t('sub-get-pro'); }
  }
}

async function _handleManagePayment() {
  try {
    const { data, error } = await _sb.functions.invoke('create-portal-session', {
      body: {
        business_id: APP.profileId,
        return_url: `${location.origin}${location.pathname}#settings`,
      },
    });
    if (error) throw error;
    if (data?.url) { window.location.href = data.url; return; }
    throw new Error('No portal URL returned');
  } catch (err) {
    console.error('_handleManagePayment:', err);
    toast(t('sub-portal-error'), 'error');
  }
}

async function _handleCancelSub() {
  if (!confirm(t('sub-cancel-confirm'))) return;
  if (!APP.profileId) return;
  try {
    const { error } = await _sb.functions.invoke('cancel-subscription', {
      body: { business_id: APP.profileId },
    });
    if (error) throw error;
    if (APP.bizSubscription) APP.bizSubscription.status = 'canceling';
    updateTopbar();
    bizPage('settings');
    toast(t('sub-canceled-toast'), 'info');
  } catch (err) {
    console.error('_handleCancelSub:', err);
    toast(t('sub-cancel-error'), 'error');
  }
}
