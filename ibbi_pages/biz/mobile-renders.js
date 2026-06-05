// biz/mobile-renders.js — Phase 2: Dashboard + Campaigns (D2A reference)

// ── Local helpers ─────────────────────────────────────────────────────────────

function deadlineColor(deadline) {
  if (!deadline) return 'var(--text-light)';
  const days = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (days < 0) return '#ef4444';
  if (days <= 3) return '#f59e0b';
  return 'var(--text-mid)';
}

function deadlineDays(deadline) {
  if (!deadline) return '—';
  const days = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (days < 0) return t('c-expired') || 'Expired';
  if (days === 0) return t('c-today') || 'Today';
  return `${days}d left`;
}

function budgetPct(c) {
  const spent  = parseInt(String(c.spent).replace(/[€,]/g, '')) || 0;
  const budget = parseInt(String(c.budget).replace(/[€,]/g, '')) || 1;
  return Math.min(Math.round(spent / budget * 100), 100);
}

// Maps campaign status → D2A badge class
function _bizStatusBadgeClass(status) {
  const map = { active:'b-active', paused:'b-paused', completed:'b-comp', draft:'b-draft', in_review:'b-review' };
  return map[status] || 'b-paused';
}

function _bizStatusLabel(status) {
  return t('status-' + status) || (status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : '—');
}

function openMobCampMenu(campId) {
  if (typeof toast === 'function') toast('Campaign menu — coming soon', 'info');
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function renderMobBizDashboard() {
  const camps = typeof BIZ_CAMPAIGNS !== 'undefined' ? BIZ_CAMPAIGNS : [];

  // KPI calculations (same logic as renderBizDashboard)
  const activeCamps = camps.filter(c => c.status === 'active').length;
  const totalSpent  = camps.reduce((s, c) => s + (parseInt(String(c.spent).replace(/[€,]/g, '')) || 0), 0);
  const totalConv   = camps.reduce((s, c) => s + (Number(c.conversions) || 0), 0);
  const totalReachRaw = camps.reduce((s, c) => {
    const r = String(c.reach);
    if (r === '—') return s;
    if (r.includes('M')) return s + parseFloat(r) * 1000000;
    if (r.includes('K')) return s + parseFloat(r) * 1000;
    return s + (parseInt(r) || 0);
  }, 0);
  const totalReach = totalReachRaw >= 1000000
    ? (totalReachRaw / 1000000).toFixed(1).replace('.0', '') + 'M'
    : totalReachRaw >= 1000
      ? Math.round(totalReachRaw / 1000) + 'K'
      : (totalReachRaw || '0');
  const spentFmt = totalSpent >= 1000
    ? '€' + (totalSpent / 1000).toFixed(1).replace('.0', '') + 'K'
    : '€' + totalSpent;

  const recentCamps = camps.slice(0, 3);
  const infls = typeof INFLUENCERS !== 'undefined' ? INFLUENCERS.slice(0, 4) : [];
  const balance = (APP.bizWallet?.balance || 0).toFixed(2);

  return `<div class="pad" style="display:flex;flex-direction:column;gap:18px;padding-bottom:24px">

  <!-- Greeting -->
  <div>
    <div class="small muted" style="font-weight:600">${t('dash-good-day') || 'Welcome back,'}</div>
    <h1 style="font-size:24px">${h(APP.profile?.company_name || '')}</h1>
  </div>

  <!-- Stats 2×2 -->
  <div class="stat-grid">
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg></div>
      <div class="v">${activeCamps}</div>
      <div class="l">${t('d-active-camps') || 'Active campaigns'}</div>
    </div>
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-eye"/></svg></div>
      <div class="v">${totalReach}</div>
      <div class="l">${t('d-total-reach') || 'Total reach'}</div>
    </div>
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-bolt"/></svg></div>
      <div class="v">${totalConv ? totalConv.toLocaleString() : '—'}</div>
      <div class="l">${t('d-conversions') || 'Conversions'}</div>
    </div>
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-coin"/></svg></div>
      <div class="v">${spentFmt}</div>
      <div class="l">${t('d-total-spent') || 'Total spent'}</div>
    </div>
  </div>

  <!-- Quick actions -->
  <div class="qa-row">
    <button class="qa primary" onclick="showCreateCampaign()">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
      ${t('camp-new') || 'New campaign'}
    </button>
    <button class="qa" onclick="mobNav('discover')">
      <svg viewBox="0 0 24 24"><use href="#ico-discover"/></svg>
      ${t('nav-discover') || 'Find creators'}
    </button>
    <button class="qa" onclick="mobNav('analytics')">
      <svg viewBox="0 0 24 24"><use href="#ico-analytics"/></svg>
      ${t('nav-analytics') || 'Analytics'}
    </button>
  </div>

  <!-- Wallet compact -->
  <div class="wallet-bar">
    <div style="flex:1">
      <div class="wl">${t('w-balance') || 'Wallet balance'}</div>
      <div class="wv">€${balance}</div>
    </div>
    <button class="btn btn-white" style="width:auto;height:42px;padding:0 18px;flex-shrink:0"
      onclick="mobNav('wallet')">
      ${t('w-top-up-btn') || 'Top up'}
    </button>
  </div>

  <!-- Recent campaigns -->
  ${recentCamps.length ? `
  <div>
    <div class="page-h">
      <h2>${t('d-recent-camps') || 'Recent campaigns'}</h2>
      <button class="see-all" onclick="mobNav('campaigns')">${t('d-view-all') || 'See all'}</button>
    </div>
    <div class="clist">
      ${recentCamps.map(c => `
        <div class="ccard" onclick="mobNav('campaigns')">
          <div class="ccard-top">
            <div class="ccard-logo">
              <svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg>
            </div>
            <div class="ccard-tt">
              <div class="ccard-name">${h(c.name)}</div>
              <div class="ccard-host">${h(c.niche || c.type || '—')}</div>
              <div class="badges">
                <span class="b b-type">${h(c.type || '—')}</span>
                <span class="b ${_bizStatusBadgeClass(c.status)}">${_bizStatusLabel(c.status)}</span>
              </div>
            </div>
          </div>
          <div class="camp-metrics">
            <div class="camp-metric"><div class="mv">${c.apps || 0}</div><div class="ml">Applied</div></div>
            <div class="camp-metric"><div class="mv">${c.reach || '—'}</div><div class="ml">${t('d-total-reach')||'Reach'}</div></div>
            <div class="camp-metric"><div class="mv">${c.spent || '€0'}</div><div class="ml">${t('d-total-spent')||'Spent'}</div></div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  <!-- Top creators -->
  ${infls.length ? `
  <div>
    <div class="page-h">
      <h2>${t('d-top-infls') || 'Top creators'}</h2>
      <button class="see-all" onclick="mobNav('discover')">${t('d-discover-more') || 'Discover'}</button>
    </div>
    <div class="inf-row">
      ${infls.map(infl => `
        <div class="inf-mini">
          <div class="av">${h(infl.avatar || (infl.name || '?').slice(0,2).toUpperCase())}</div>
          <div class="nm">${h(infl.handle || infl.name)}</div>
          <div class="ni">${h(infl.niche)}</div>
          <div class="row3">
            <div><div class="v">${h(infl.followers)}</div><div class="l">Foll.</div></div>
            <div><div class="v">${h(infl.er)}</div><div class="l">ER</div></div>
          </div>
          <button class="btn btn-soft" style="height:34px;font-size:13px"
            onclick="event.stopPropagation();toast('${h(infl.handle || infl.name)} invited','success')">
            ${t('ic-invite') || 'Invite'}
          </button>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

</div>`;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

function renderMobBizCampaigns() {
  const camps = typeof BIZ_CAMPAIGNS !== 'undefined' ? BIZ_CAMPAIGNS : [];
  const active    = camps.filter(c => c.status === 'active').length;
  const paused    = camps.filter(c => c.status === 'paused').length;
  const completed = camps.filter(c => c.status === 'completed').length;

  return `<div class="pad" style="padding-bottom:90px">

  <!-- Filter chips -->
  <div class="chips">
    <button class="chip2 on">All · ${camps.length}</button>
    ${active    ? `<button class="chip2">Active · ${active}</button>` : ''}
    ${paused    ? `<button class="chip2">Paused · ${paused}</button>` : ''}
    ${completed ? `<button class="chip2">Done · ${completed}</button>` : ''}
  </div>

  ${camps.length === 0
    ? `<div class="mob-empty"><div class="mob-empty-icon">📣</div>
        <h3>${t('camp-empty') || 'Žiadne kampane'}</h3></div>`
    : `<div class="clist">
        ${camps.map(c => {
          const pct  = budgetPct(c);
          const dl   = deadlineDays(c.deadline);
          const dlC  = deadlineColor(c.deadline);
          return `
          <div class="ccard">
            <div class="ccard-top">
              <div class="ccard-logo">
                <svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg>
              </div>
              <div class="ccard-tt">
                <div class="ccard-name">${h(c.name)}</div>
                <div class="ccard-host" style="color:${dlC}">${dl}</div>
                <div class="badges">
                  <span class="b b-type">${h(c.type || '—')}</span>
                  <span class="b ${_bizStatusBadgeClass(c.status)}">${_bizStatusLabel(c.status)}</span>
                </div>
              </div>
            </div>
            <div class="prog-wrap">
              <div class="prog-top">
                <span>${t('c-spent-lbl') || 'Budget used'}</span>
                <span><b>${h(c.spent)}</b> / ${h(c.budget)}</span>
              </div>
              <div class="prog"><i style="width:${pct}%"></i></div>
            </div>
            <div class="camp-metrics">
              <div class="camp-metric"><div class="mv">${c.apps || 0}</div><div class="ml">Applied</div></div>
              <div class="camp-metric"><div class="mv">${c.accepted || 0}</div><div class="ml">Accepted</div></div>
              <div class="camp-metric"><div class="mv">${c.reach || '—'}</div><div class="ml">${t('d-total-reach')||'Reach'}</div></div>
            </div>
            <div class="cacts">
              <button class="cact primary" onclick="viewApplications('${c.id}')">
                ${t('c-applications') || 'Applicants'}
              </button>
              <button class="cact" onclick="S.mobBizPage='campaign-detail';viewCampaignDetail('${c.id}')">
                Stats
              </button>
              <button class="cact" style="flex:0 0 44px" onclick="openMobCampMenu('${c.id}')">⋯</button>
            </div>
          </div>`;
        }).join('')}
      </div>`}

</div>
<button class="fab" onclick="showCreateCampaign()">+</button>`;
}

// ── Discover ──────────────────────────────────────────────────────────────────

const _MOB_DISC_COLORS = ['#2079FF','#7c3aed','#db2777','#059669','#f59e0b','#0891b2','#dc2626','#0d9488'];

function _mobInflSizeKey(followers) {
  const s = String(followers || '0').toUpperCase().replace(/,/g, '');
  let num = 0;
  if (s.includes('M')) num = parseFloat(s) * 1000000;
  else if (s.includes('K')) num = parseFloat(s) * 1000;
  else num = parseInt(s) || 0;
  if (num < 10000) return 'nano';
  if (num < 100000) return 'micro';
  if (num < 1000000) return 'macro';
  return 'mega';
}

function _renderMobDiscoverFilters() {
  return `<div style="padding:0 20px 20px">
    <h3 style="margin-bottom:16px">${t('f-filters')||'Filtre'}</h3>
    <div class="field">
      <label>${t('f-niche')||'Niche'}</label>
      <select class="select" id="mob-f-niche">
        <option value="">${t('f-all-niches')||'Všetky niche'}</option>
        <option>Fashion</option><option>Beauty</option><option>Fitness</option>
        <option>Food</option><option>Tech</option><option>Travel</option><option>Gaming</option>
      </select>
    </div>
    <div class="field">
      <label>${t('f-size')||'Veľkosť'}</label>
      <select class="select" id="mob-f-size">
        <option value="">${t('f-all-sizes')||'Všetky veľkosti'}</option>
        <option value="nano">Nano (1K–10K)</option>
        <option value="micro">Micro (10K–100K)</option>
        <option value="macro">Macro (100K–1M)</option>
        <option value="mega">Mega (1M+)</option>
      </select>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-blue" style="flex:1"
        onclick="applyMobFilters();closeMobFilterSheet()">
        ${t('f-apply')||'Aplikovať'}
      </button>
      <button class="btn btn-outline" style="flex:1" onclick="resetMobFilters()">
        ${t('f-reset')||'Resetovať'}
      </button>
    </div>
  </div>`;
}

function renderMobBizDiscover() {
  const infls = typeof INFLUENCERS !== 'undefined' ? INFLUENCERS : [];

  const inflCards = infls.map((infl, i) => {
    const matchScore = typeof calcMatch === 'function' ? calcMatch(infl) : 70;
    const mc = typeof matchColor === 'function' ? matchColor(matchScore) : '#94a3b8';
    const initials = infl.avatar || (infl.name || '?').slice(0, 2).toUpperCase();
    const inflColor = _MOB_DISC_COLORS[i % _MOB_DISC_COLORS.length];
    return `
    <div class="card" style="margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;padding:14px"
         data-name="${h((infl.handle||infl.name||'').toLowerCase())}"
         data-niche="${h((infl.niche||'').toLowerCase())}"
         data-size="${_mobInflSizeKey(infl.followers||'0')}">
      <div style="width:48px;height:48px;background:${inflColor};font-size:16px;font-weight:800;
        color:#fff;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center">
        ${h(initials)}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800">${h(infl.handle||infl.name)}</div>
        <div class="small muted">${h(infl.niche||'—')} · ${h(String(infl.followers||'—'))} followers</div>
        <div class="small muted">ER: ${h(String(infl.er||'—'))} · Match: ${matchScore}%</div>
        <div style="height:3px;background:var(--border);border-radius:2px;margin:6px 0">
          <div style="height:3px;border-radius:2px;width:${matchScore}%;background:${mc}"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <button class="btn btn-outline"
          style="font-size:11px;padding:6px 10px;min-height:44px;white-space:nowrap;border-radius:10px"
          onclick="mobOpenChatWith(${infl.id},'${h((infl.handle||infl.name||'').replace(/'/g,"\\'"))}','biz')">
          ${t('msg-write')||'Napísať'}
        </button>
      </div>
    </div>`;
  }).join('');

  return `<div class="pad" style="padding-bottom:20px">
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <input class="input" placeholder="${t('f-search')||'Hľadať...'}"
        id="mob-infl-search" oninput="mobBizFilterInfluencers(this.value)" style="flex:1">
      <button class="btn btn-outline" style="width:auto;padding:0 14px;flex-shrink:0"
        onclick="openMobFilterSheet()">
        ⊞ ${t('f-filters')||'Filtre'}
      </button>
    </div>
    <div id="mob-infl-list">${inflCards}</div>
  </div>`;
}

function mobBizFilterInfluencers(query) {
  const list = document.getElementById('mob-infl-list');
  if (!list) return;
  const q = (query || '').toLowerCase().trim();
  list.querySelectorAll('[data-name]').forEach(card => {
    const name = card.dataset.name || '';
    const niche = card.dataset.niche || '';
    card.style.display = (!q || name.includes(q) || niche.includes(q)) ? '' : 'none';
  });
}

function applyMobFilters() {
  const nicheVal = (document.getElementById('mob-f-niche')?.value || '').toLowerCase().trim();
  const sizeVal = (document.getElementById('mob-f-size')?.value || '').trim();
  const searchVal = (document.getElementById('mob-infl-search')?.value || '').toLowerCase().trim();
  const list = document.getElementById('mob-infl-list');
  if (!list) return;
  list.querySelectorAll('[data-name]').forEach(card => {
    const nicheOk = !nicheVal || card.dataset.niche === nicheVal;
    const sizeOk = !sizeVal || card.dataset.size === sizeVal;
    const searchOk = !searchVal || (card.dataset.name || '').includes(searchVal) || (card.dataset.niche || '').includes(searchVal);
    card.style.display = (nicheOk && sizeOk && searchOk) ? '' : 'none';
  });
}

function resetMobFilters() {
  ['mob-f-niche', 'mob-f-size', 'mob-infl-search'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const list = document.getElementById('mob-infl-list');
  if (list) list.querySelectorAll('[data-name]').forEach(card => card.style.display = '');
  closeMobFilterSheet();
}

// ── Messages ──────────────────────────────────────────────────────────────────

function renderMobBizMessages() {
  const convs = typeof MESSAGES_BIZ !== 'undefined' ? MESSAGES_BIZ : [];

  if (S.mobMsgView === 'chat') {
    const partner = convs.find(m => m.convId === S.chatPartner);
    const chatHtml = typeof buildChatMsgs === 'function'
      ? buildChatMsgs(partner, APP.user, 'biz') : '';
    return `<div style="display:flex;flex-direction:column;height:100%">
      <div class="mob-chat-messages" id="chat-msgs" style="flex:1;overflow-y:auto">${chatHtml}</div>
      <div class="mob-composer">
        <input class="mob-composer-input" id="chat-in"
          placeholder="${t('msg-placeholder')||'Správa...'}"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg('biz')}">
        <button onclick="sendMsg('biz')" class="btn btn-blue"
          style="padding:0 14px;min-height:44px;border-radius:12px;flex-shrink:0">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <use href="#ico-send"/>
          </svg>
        </button>
      </div>
    </div>`;
  }

  // List view
  const filtered = typeof filterMsgConvs === 'function' ? filterMsgConvs(convs) : convs;
  const convRows = filtered.length
    ? filtered.map(conv => `
      <div class="list-item" style="padding:12px 0;cursor:pointer"
        onclick="S.mobMsgView='chat';S.chatPartner='${conv.convId}';mobBizPage('messages')">
        <div class="avatar" style="width:46px;height:46px;background:${conv.color};flex-shrink:0;
          border-radius:14px;color:#fff;font-weight:800;font-size:15px;
          display:flex;align-items:center;justify-content:center">
          ${h(conv.avatar)}
        </div>
        <div class="list-item-body">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:700">${h(conv.name)}</span>
            <span class="small muted">${conv.time||''}</span>
          </div>
          <div class="small muted">${h(conv.preview||'…')}</div>
        </div>
        ${conv.unread ? `<span class="tab-badge" style="position:static;background:var(--blue)">${conv.unread}</span>` : ''}
      </div>`).join('')
    : `<div class="mob-empty">
        <div class="mob-empty-icon">💬</div>
        <h3>${t('msg-no-convs-biz')||'Žiadne správy'}</h3>
        <p>${t('msg-start-conv')||'Nájdi influencera a začni konverzáciu'}</p>
      </div>`;

  return `<div class="pad">
    <input class="input" style="margin-bottom:12px" placeholder="${t('msg-search')||'Hľadať...'}">
    <div style="display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:2px">
      ${['all','unread','creators'].map(f => `
        <button class="chip ${S.msgFilter===f?'active':''}"
          onclick="S.msgFilter='${f}';mobBizPage('messages')">
          ${t('msg-filter-'+f)||f}
        </button>`).join('')}
    </div>
    <div id="mob-conv-list">${convRows}</div>
  </div>
  <button class="fab" style="bottom:80px;right:16px" onclick="openFindUser('biz')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`;
}

async function mobOpenChatWith(otherId, name, role) {
  const isDemoMode = !APP.user || (APP.user.id && String(APP.user.id).startsWith('demo-'));

  if (isDemoMode) {
    const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
    const demoId = 'demo-' + otherId;
    if (!arr.find(m => m.convId === demoId)) {
      arr.unshift({
        id: arr.length, convId: demoId, name,
        avatar: (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        color: '#2079FF', preview: '…', time: 'now', unread: 0, messages: [], otherId,
      });
    }
    S.chatPartner = demoId;
    S.mobMsgView = 'chat';
    mobNav('messages');
    return;
  }

  if (!APP.profileId) { toast(t('msg-login-required') || 'Prihlás sa', 'error'); return; }
  const myField = role === 'biz' ? 'business_id' : 'influencer_id';
  const otherField = role === 'biz' ? 'influencer_id' : 'business_id';
  const { data: existing } = await _sb.from('conversations').select('id')
    .eq(myField, APP.profileId).eq(otherField, otherId).maybeSingle();
  let convId = existing?.id;
  if (!convId) {
    const payload = { [myField]: APP.profileId, [otherField]: otherId };
    const { data: newConv, error } = await _sb.from('conversations').insert(payload).select('id').single();
    if (error) { toast(error.message, 'error'); return; }
    convId = newConv?.id;
  }
  if (!convId) { toast(t('msg-open-chat-error') || 'Chyba pri otváraní chatu', 'error'); return; }
  await loadConversations(role);
  S.chatPartner = convId;
  S.mobMsgView = 'chat';
  mobNav('messages');
}

// ── Analytics ─────────────────────────────────────────────────────────────────

function renderMobBizAnalytics() {
  const totalConv   = BIZ_CAMPAIGNS.reduce((s, c) => s + (Number(c.conversions) || 0), 0);
  const totalSpent  = BIZ_CAMPAIGNS.reduce((s, c) => s + (parseInt(String(c.spent).replace(/[€,]/g, '')) || 0), 0);
  const totalReach  = BIZ_CAMPAIGNS.reduce((s, c) => {
    const r = String(c.reach);
    if (r === '—') return s;
    if (r.includes('M')) return s + parseFloat(r) * 1000000;
    if (r.includes('K')) return s + parseFloat(r) * 1000;
    return s + (parseInt(r) || 0);
  }, 0);
  const er       = totalReach > 0 ? (totalConv / totalReach * 100).toFixed(2) + '%' : '—';
  const fmtReach = totalReach >= 1000000
    ? (totalReach / 1000000).toFixed(1).replace('.0', '') + 'M'
    : totalReach >= 1000 ? Math.round(totalReach / 1000) + 'K' : String(totalReach || '—');

  const topCamps = [...BIZ_CAMPAIGNS]
    .filter(c => c.status !== 'draft')
    .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
    .slice(0, 3);

  return `
<div class="pad">
  <div style="display:flex;gap:8px;margin-bottom:16px">
    ${['7d','30d','90d','1y'].map(p => `
      <button class="btn ${S.mobAnalyticsPeriod === p ? 'btn-blue' : 'btn-outline'}"
        style="flex:1;font-size:12px;padding:0;height:36px"
        onclick="S.mobAnalyticsPeriod='${p}';mobBizPage('analytics')">
        ${p.toUpperCase()}
      </button>`).join('')}
  </div>

  <div class="metric-2col" style="margin-bottom:16px">
    <div class="stat-card-m">
      <div class="eyebrow">Reach</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${fmtReach}</div>
      <div class="small muted">Across campaigns</div>
    </div>
    <div class="stat-card-m">
      <div class="eyebrow">Conversions</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${totalConv.toLocaleString()}</div>
      <div class="small muted">All time</div>
    </div>
    <div class="stat-card-m">
      <div class="eyebrow">Spent</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">€${totalSpent.toLocaleString()}</div>
      <div class="small muted">Campaign budget</div>
    </div>
    <div class="stat-card-m">
      <div class="eyebrow">Eng. Rate</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${er}</div>
      <div class="small muted">Conv / Reach</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:12px">
    <div class="eyebrow" style="margin-bottom:8px">Reach</div>
    <canvas id="mob-biz-reach" style="width:100%;height:200px"></canvas>
  </div>

  <div class="card" style="margin-bottom:12px">
    <div class="eyebrow" style="margin-bottom:8px">Conversions</div>
    <canvas id="mob-biz-conv" style="width:100%;height:200px"></canvas>
  </div>

  <div class="section-label">Top performers</div>
  ${topCamps.map((c, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;
      border-bottom:1px solid var(--border)">
      <div style="width:28px;height:28px;border-radius:8px;background:var(--blue-light);
        display:flex;align-items:center;justify-content:center;
        font-size:12px;font-weight:800;color:var(--blue);flex-shrink:0">${i + 1}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis">${h(c.name)}</div>
        <div class="small muted">${c.reach} reach</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-weight:800;font-size:14px">${c.conversions.toLocaleString()}</div>
        <div class="small muted">conv</div>
      </div>
    </div>`).join('')}
</div>`;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

function renderMobBizWallet() {
  const bw         = APP.bizWallet;
  const balance    = Number(bw?.balance  || 0);
  const totalSpent = Number(bw?.total_spent || 0);
  const totalTopup = Number(bw?.total_topup || 0);
  const txs        = BIZ_TRANSACTIONS;

  const isTopup = tx => tx.type === 'topup' || tx.type === 'credit';
  const txLabel = tx => tx.description || tx.desc || tx.type;
  const txDate  = tx => tx.date || (tx.created_at || '').slice(0, 10) || '';
  const txAmt   = tx => {
    if (typeof tx.amount === 'number') return tx.amount.toFixed(2);
    return String(tx.amount || '').replace(/[€+\-,\s]/g, '') || '0.00';
  };

  return `
<div class="pad">
  <div class="card" style="background:var(--navy);color:#fff;margin-bottom:16px;text-align:center">
    <div class="eyebrow" style="opacity:.6;margin-bottom:8px">${t('w-balance') || 'Zostatok'}</div>
    <div style="font-size:40px;font-weight:900;margin-bottom:16px">€${balance.toFixed(2)}</div>
    <button class="btn btn-glass" style="width:100%" onclick="openMobTopupSheet()">
      ${t('w-top-up-btn') || 'Top Up'}
    </button>
  </div>

  <div style="display:flex;gap:12px;margin-bottom:16px">
    <div class="card" style="flex:1;text-align:center">
      <div class="eyebrow">Spent</div>
      <div style="font-weight:800;font-size:16px">€${totalSpent.toFixed(2)}</div>
    </div>
    <div class="card" style="flex:1;text-align:center">
      <div class="eyebrow">Topup</div>
      <div style="font-weight:800;font-size:16px">€${totalTopup.toFixed(2)}</div>
    </div>
  </div>

  <div class="section-label">Transakcie</div>
  ${txs.map(tx => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;
      border-bottom:1px solid var(--border)">
      <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;
        background:${isTopup(tx) ? '#e6f7ee' : '#fff0f0'};
        display:flex;align-items:center;justify-content:center;font-size:18px">
        ${isTopup(tx) ? '↑' : '↓'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis">${h(txLabel(tx))}</div>
        <div class="small muted">${txDate(tx)}</div>
      </div>
      <div style="font-weight:700;flex-shrink:0;
        color:${isTopup(tx) ? 'var(--green,#22c55e)' : 'var(--text)'}">
        ${isTopup(tx) ? '+' : '-'}€${txAmt(tx)}
      </div>
    </div>`).join('')}
</div>

<div class="sheet-backdrop" id="mob-topup-bd" onclick="closeMobTopupSheet()"></div>
<div class="sheet" id="mob-topup-sheet" style="padding:20px">
  <div class="sheet-grip"></div>
  <h3>${t('w-top-up-btn') || 'Top Up'}</h3>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0">
    ${[10,25,50,100].map(amt => `
      <button class="chip" onclick="document.getElementById('topup-amount').value=${amt}"
        style="min-height:44px;padding:0 16px;border-radius:50px;border:1.5px solid var(--border);
          background:#fff;font-size:14px;font-weight:700;cursor:pointer">
        €${amt}
      </button>`).join('')}
  </div>
  <input class="input" id="topup-amount" type="number" placeholder="Vlastná suma" min="10">
  <button class="btn btn-blue" style="margin-top:12px;width:100%"
    onclick="topUpBizWallet()">
    ${t('w-confirm') || 'Potvrdiť'}
  </button>
</div>`;
}

function openMobTopupSheet() {
  document.getElementById('mob-topup-bd')?.classList.add('open');
  document.getElementById('mob-topup-sheet')?.classList.add('open');
}

function closeMobTopupSheet() {
  document.getElementById('mob-topup-bd')?.classList.remove('open');
  document.getElementById('mob-topup-sheet')?.classList.remove('open');
}

// ── F3A: Profile + Settings + Campaign Detail ─────────────────────────────────

function _mobFmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('sk-SK', {day:'numeric',month:'short',year:'numeric'}); }
  catch(e) { return String(d).slice(0,10); }
}

function _mobCampDetailBack() {
  if (S._campDetail?._activityChannel) { try { S._campDetail._activityChannel.unsubscribe(); } catch(e) {} }
  if (S._campDetail?._appsChannel)     { try { S._campDetail._appsChannel.unsubscribe();     } catch(e) {} }
  S._campDetail = null;
  mobNav('campaigns');
}

// ── Profile ───────────────────────────────────────────────────────────────────

function renderMobBizProfile() {
  return `
<div>
  <div style="height:140px;position:relative;
    background:linear-gradient(135deg,var(--navy),var(--blue));
    cursor:pointer;overflow:hidden"
    onclick="document.getElementById('mob-biz-banner-in').click()">
    ${APP.profile?.banner_url
      ? `<img src="${h(APP.profile.banner_url)}" style="width:100%;height:100%;object-fit:cover">`
      : ''}
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.2);opacity:0;transition:opacity 200ms"
      onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <use href="#ico-camera"/></svg>
    </div>
  </div>
  <input type="file" id="mob-biz-banner-in" accept="image/*" style="display:none"
    onchange="uploadBizBanner(this)">

  <div style="position:relative;margin-top:-38px;padding:0 20px">
    <div style="width:72px;height:72px;border-radius:20px;border:3px solid #fff;cursor:pointer;
      overflow:hidden;background:var(--blue);display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:22px;font-weight:900"
      onclick="document.getElementById('mob-biz-avatar-in').click()">
      ${APP.profile?.avatar_url
        ? `<img src="${h(APP.profile.avatar_url)}" style="width:100%;height:100%;object-fit:cover">`
        : _mobInitials()}
    </div>
    <input type="file" id="mob-biz-avatar-in" accept="image/*" style="display:none"
      onchange="uploadBizAvatar(this)">
  </div>

  <div class="pad" style="padding-top:12px">
    <div style="margin-bottom:16px">
      <h2>${h(APP.profile?.company_name || '')}</h2>
      <div class="small muted">${h(APP.profile?.industry || '')}</div>
    </div>
    <button class="btn btn-outline" style="width:100%;margin-bottom:16px"
      onclick="S.mobProfileEdit=!S.mobProfileEdit;mobBizPage('profile')">
      ${S.mobProfileEdit ? '✕ ' + (t('prof-cancel')||'Zavrieť') : '✏ ' + (t('prof-edit-btn')||'Edit Profile')}
    </button>
    ${S.mobProfileEdit ? `
      <div class="card" style="margin-bottom:16px">
        <div class="field"><label>Názov firmy</label>
          <input class="input" id="mob-biz-company" value="${h(APP.profile?.company_name || '')}"></div>
        <div class="field"><label>Odvetvie</label>
          <input class="input" id="mob-biz-industry" value="${h(APP.profile?.industry || '')}"></div>
        <div class="field"><label>Web</label>
          <input class="input" id="mob-biz-website" value="${h(APP.profile?.website || '')}"></div>
        <button class="btn btn-blue" style="width:100%;margin-top:8px"
          onclick="saveBizProfile()">Uložiť</button>
      </div>
    ` : ''}
    ${APP.bizSubscription?.status === 'active' ? `
      <div class="card" style="margin-bottom:16px;border:1.5px solid var(--blue)">
        <div style="font-weight:800">⚡ Pro aktívne</div>
        <div class="small muted">Obnovenie: ${_mobFmtDate(APP.bizSubscription.current_period_end)}</div>
        <button class="btn btn-outline" style="margin-top:8px;width:100%"
          onclick="_handleManagePayment()">Spravovať platbu</button>
      </div>
    ` : `
      <div class="card" style="margin-bottom:16px;background:var(--navy);color:#fff">
        <div style="font-weight:800;margin-bottom:4px">⚡ Upgrade na Pro</div>
        <div style="font-size:13px;opacity:.7;margin-bottom:12px">Odomkni všetky funkcie</div>
        <button class="btn btn-glass" style="width:100%"
          onclick="showSubscriptionModal()">Získať Pro</button>
      </div>
    `}
  </div>
</div>`;
}

// ── Settings ──────────────────────────────────────────────────────────────────

function toggleMobSettings(s) {
  S.mobSettingsOpen = S.mobSettingsOpen === s ? null : s;
  mobBizPage('settings');
}

function mobSettingContent(id) {
  if (id === 'account') {
    return `
      <div class="field"><label>Názov firmy</label>
        <input class="input" id="sett-company" value="${h(APP.profile?.company_name || '')}"></div>
      <div class="field"><label>Email</label>
        <input class="input" id="sett-email" type="email" value="${h(APP.user?.email || '')}"></div>
      <div class="field"><label>IČO</label>
        <input class="input" id="sett-ico" value="${h(APP.profile?.ico || '')}"></div>
      <div class="field"><label>Web</label>
        <input class="input" id="sett-website" value="${h(APP.profile?.website || '')}"></div>
      <button class="btn btn-blue" style="width:100%;margin-top:8px"
        onclick="saveBizProfile()">Uložiť</button>`;
  }
  if (id === 'security') {
    return `
      <button class="btn btn-outline" style="width:100%;margin-bottom:12px"
        onclick="typeof showChangePassword==='function'?showChangePassword():toast('Coming soon','info')">
        Zmeniť heslo
      </button>
      ${toggle('2FA', 'Dvojfaktorová autentifikácia', false)}`;
  }
  if (id === 'notifs') {
    return `
      ${toggle(t('notif-campaigns') || 'Kampane', 'Nové aplikácie a aktualizácie', true)}
      ${toggle(t('notif-messages')  || 'Správy',  'Nové správy od influencerov',   true)}
      ${toggle(t('notif-payments')  || 'Platby',  'Transakcie a faktúry',           false)}`;
  }
  if (id === 'lang') {
    const cur = (typeof S !== 'undefined' && S.lang) || 'sk';
    return `
      <div style="display:flex;gap:8px">
        ${['sk', 'en'].map(l => `
          <button class="btn ${cur === l ? 'btn-blue' : 'btn-outline'}" style="flex:1"
            onclick="setLang('${l}');mobBizPage('settings')">${l.toUpperCase()}</button>
        `).join('')}
      </div>`;
  }
  if (id === 'danger') {
    return `
      <div style="font-size:14px;color:var(--text-mid,#64748b);margin-bottom:12px">
        Táto akcia je nevratná. Všetky údaje budú trvalo vymazané.
      </div>
      <button class="btn" style="width:100%;background:var(--red,#ef4444);color:#fff;border:none"
        onclick="if(confirm('Naozaj chceš vymazať účet?'))typeof deleteAccount==='function'?deleteAccount():toast('Coming soon','info')">
        Vymazať účet
      </button>`;
  }
  return '';
}

function renderMobBizSettings() {
  return `
<div class="pad">
  ${[
    {id:'account',  label: t('sett-account')  || 'Firemný účet'},
    {id:'security', label: t('sett-security') || 'Bezpečnosť'},
    {id:'notifs',   label: t('sett-notifs')   || 'Notifikácie'},
    {id:'lang',     label: t('lang-label')    || 'Jazyk'},
    {id:'danger',   label: t('sett-danger')   || 'Nebezpečná zóna', danger: true},
  ].map(sec => `
    <div style="border:1px solid var(--border);border-radius:12px;margin-bottom:8px;overflow:hidden">
      <button style="width:100%;padding:16px;display:flex;justify-content:space-between;
        align-items:center;font-weight:700;text-align:left;cursor:pointer;
        background:${sec.danger ? '#fff5f5' : '#fff'};
        color:${sec.danger ? 'var(--red,#ef4444)' : 'var(--text)'};border:none"
        onclick="toggleMobSettings('${sec.id}')">
        ${sec.label}
        <span>${S.mobSettingsOpen === sec.id ? '▲' : '▼'}</span>
      </button>
      ${S.mobSettingsOpen === sec.id ? `
        <div style="padding:16px;border-top:1px solid var(--border)">
          ${mobSettingContent(sec.id)}
        </div>
      ` : ''}
    </div>
  `).join('')}
</div>`;
}

// ── Campaign Detail ───────────────────────────────────────────────────────────

function setMobCampTab(tab) {
  S.mobCampTab = tab;
  mobBizPage('campaign-detail');
}

function mobCampTabContent(tab, camp) {
  if (tab === 'applications') {
    const apps = (S._campDetail?.applications || []).filter(a => !a.status || a.status === 'pending');
    if (!apps.length) return `<div class="mob-empty"><div class="mob-empty-icon">📋</div>
      <h3>Žiadne aplikácie</h3></div>`;
    return apps.map(a => `
      <div class="card" style="margin-bottom:8px;display:flex;gap:12px;align-items:center;padding:12px">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--blue-light);
          display:flex;align-items:center;justify-content:center;font-weight:800;
          color:var(--blue);flex-shrink:0;font-size:14px">
          ${h((a.name||a.influencer_name||'?').slice(0,2).toUpperCase())}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700">${h(a.name || a.influencer_name || '—')}</div>
          <div class="small muted">${h(a.niche || a.platform || '—')} · Score: ${a.match_score || a.score || '—'}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-blue" style="padding:0 10px;height:36px;font-size:12px"
            onclick="campDetailApprove('${a.id}','${camp.id}')">✓</button>
          <button class="btn btn-outline"
            style="padding:0 10px;height:36px;font-size:12px;color:var(--red,#ef4444);border-color:var(--red,#ef4444)"
            onclick="campDetailReject('${a.id}','${camp.id}')">✗</button>
        </div>
      </div>`).join('');
  }

  if (tab === 'approved') {
    const stages = ['approved','content','review','paid'];
    const apps = (S._campDetail?.applications || []).filter(a => stages.includes(a.status));
    if (!apps.length) return `<div class="mob-empty"><div class="mob-empty-icon">✅</div>
      <h3>Žiadni schválení</h3></div>`;
    return apps.map(a => {
      const si = stages.indexOf(a.status);
      return `
        <div class="card" style="margin-bottom:10px;padding:14px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:var(--blue-light);
              display:flex;align-items:center;justify-content:center;font-weight:800;
              color:var(--blue);font-size:13px;flex-shrink:0">
              ${h((a.name||a.influencer_name||'?').slice(0,2).toUpperCase())}
            </div>
            <div style="font-weight:700">${h(a.name || a.influencer_name || '—')}</div>
          </div>
          <div style="display:flex;gap:4px">
            ${stages.map((st, i) => `
              <div style="flex:1;text-align:center">
                <div style="height:4px;border-radius:2px;margin-bottom:4px;
                  background:${i <= si ? 'var(--blue)' : 'var(--border)'}"></div>
                <div style="font-size:10px;color:${i <= si ? 'var(--blue)' : 'var(--text-mid,#94a3b8)'}">
                  ${st}</div>
              </div>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  if (tab === 'content') {
    const items = S._campDetail?.content || [];
    if (!items.length) return `<div class="mob-empty"><div class="mob-empty-icon">🖼</div>
      <h3>Žiadny obsah</h3></div>`;
    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${items.map(cc => `
        <div class="card" style="padding:10px">
          <div style="width:100%;padding-top:66%;background:var(--border);border-radius:8px;
            position:relative;margin-bottom:8px;overflow:hidden">
            ${cc.thumbnail_url
              ? `<img src="${h(cc.thumbnail_url)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`
              : ''}
          </div>
          <div class="small" style="font-weight:600;margin-bottom:6px;white-space:nowrap;overflow:hidden;
            text-overflow:ellipsis">${h(cc.influencer_name || '—')}</div>
          <div style="display:flex;gap:4px">
            <button class="btn btn-blue" style="flex:1;height:32px;font-size:11px;padding:0"
              onclick="campDetailApproveContent('${cc.id}')">✓</button>
            <button class="btn btn-outline"
              style="flex:1;height:32px;font-size:11px;padding:0;color:var(--red,#ef4444)"
              onclick="campDetailRejectContent('${cc.id}')">✗</button>
          </div>
        </div>`).join('')}
    </div>`;
  }

  if (tab === 'analytics') {
    return `
      <div class="card" style="margin-bottom:12px">
        <div class="eyebrow" style="margin-bottom:8px">Reach</div>
        <canvas id="mob-cd-reach" style="width:100%;height:180px"></canvas>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:8px">Conversions</div>
        <canvas id="mob-cd-conv" style="width:100%;height:180px"></canvas>
      </div>`;
  }

  if (tab === 'settings') {
    return `
      <div class="field"><label>${t('c-name') || 'Názov kampane'}</label>
        <input class="input" id="cd-sett-name" value="${h(camp.name || '')}"></div>
      <div class="field"><label>${t('c-budget') || 'Rozpočet'}</label>
        <input class="input" id="cd-sett-budget" type="number"
          value="${camp.budget_total ?? camp.budget ?? ''}"></div>
      <div class="field"><label>${t('c-deadline') || 'Deadline'}</label>
        <input class="input" id="cd-sett-deadline" type="date"
          value="${(camp.deadline || '').slice(0,10)}"></div>
      <button class="btn btn-blue" style="width:100%;margin-top:8px"
        onclick="campDetailSaveSettings('${camp.id}')">
        ${t('cdp-save-settings') || 'Uložiť'}
      </button>`;
  }
  return '';
}

function renderMobBizCampaignDetail() {
  const camp = S._campDetail?.campaign
    || (typeof BIZ_CAMPAIGNS !== 'undefined'
        ? BIZ_CAMPAIGNS.find(c => c.id === S._campDetail?.campId)
        : null);

  if (!camp) {
    return `<div class="pad" style="text-align:center;padding:60px 20px">
      <div style="font-size:2.5rem;margin-bottom:12px">📋</div>
      <p class="muted">Vyber kampaň zo zoznamu</p>
      <button class="btn btn-outline" style="margin-top:12px"
        onclick="_mobCampDetailBack()">← ${t('back') || 'Späť'}</button>
    </div>`;
  }

  const spentNum  = parseInt(String(camp.budget_spent ?? camp.spent  ?? 0).replace(/[€,]/g, '')) || 0;
  const budgetNum = parseInt(String(camp.budget_total ?? camp.budget ?? 1).replace(/[€,]/g, '')) || 1;
  const pct       = Math.min(Math.round(spentNum / budgetNum * 100), 100);
  const apps      = S._campDetail?.applications || [];
  const approved  = apps.filter(a => a.status && a.status !== 'pending').length;

  return `
<div style="padding-bottom:20px">
  <div class="pad">
    <button class="btn btn-outline" style="margin-bottom:12px"
      onclick="_mobCampDetailBack()">
      ← ${t('back') || 'Späť'}
    </button>

    <div class="card" style="margin-bottom:12px">
      <h2 style="margin-bottom:8px">${h(camp.name)}</h2>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        ${statusBadge(camp.status)} ${typeBadge(camp.type)}
      </div>
      <div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:8px">
        <div style="height:4px;background:var(--blue);border-radius:2px;width:${pct}%"></div>
      </div>
      <div class="small muted" style="margin-bottom:12px">
        €${spentNum} / €${budgetNum}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline" style="flex:1"
          onclick="setCampaignStatus('${camp.id}','paused')">${t('camp-status-paused')||'Pozastaviť'}</button>
        <button class="btn btn-outline"
          style="flex:1;color:var(--red,#ef4444);border-color:var(--red,#ef4444)"
          onclick="campDetailEndCampaign('${camp.id}')">${t('camp-end-btn')||'Ukončiť'}</button>
      </div>
    </div>

    <div class="metric-2col" style="margin-bottom:12px">
      <div class="stat-card-m">
        <div class="eyebrow">${t('cdp-tab-apps')||'Applications'}</div>
        <div style="font-size:20px;font-weight:900;color:var(--navy)">${apps.length || camp.apps || 0}</div>
      </div>
      <div class="stat-card-m">
        <div class="eyebrow">${t('cdp-tab-approved')||'Approved'}</div>
        <div style="font-size:20px;font-weight:900;color:var(--navy)">${approved || camp.accepted || 0}</div>
      </div>
      <div class="stat-card-m">
        <div class="eyebrow">${t('d-total-reach')||'Reach'}</div>
        <div style="font-size:20px;font-weight:900;color:var(--navy)">${h(String(camp.reach || '—'))}</div>
      </div>
      <div class="stat-card-m">
        <div class="eyebrow">${t('d-total-spent')||'Spent'}</div>
        <div style="font-size:20px;font-weight:900;color:var(--navy)">€${spentNum}</div>
      </div>
    </div>

    <div style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;
      padding-bottom:8px;margin-bottom:12px">
      ${['applications','approved','content','analytics','settings'].map(tab => `
        <button class="btn ${S.mobCampTab === tab ? 'btn-blue' : 'btn-outline'}"
          style="white-space:nowrap;font-size:12px;flex-shrink:0"
          onclick="setMobCampTab('${tab}')">
          ${tab}
        </button>`).join('')}
    </div>

    ${mobCampTabContent(S.mobCampTab, camp)}
  </div>
</div>`;
}
