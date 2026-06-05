// infl/mobile-renders.js — F3B: Influencer render functions

// ── Local data ────────────────────────────────────────────────────────────────

const _MOB_BRANDS_DEMO = [
  {name:'Zara Slovakia',  industry:'Fashion', campaigns:3, verified:true,  rating:4.5},
  {name:'FitTrack App',   industry:'Fitness', campaigns:2, verified:true,  rating:4.8},
  {name:'BeanBox Coffee', industry:'Food',    campaigns:1, verified:false, rating:4.2},
  {name:'SitPro Gaming',  industry:'Gaming',  campaigns:2, verified:true,  rating:4.6},
  {name:'NomadGear',      industry:'Travel',  campaigns:4, verified:true,  rating:4.7},
  {name:'GlowCo Beauty',  industry:'Beauty',  campaigns:3, verified:true,  rating:4.4},
];

const _MOB_BRAND_COLORS = {Fashion:'#1a1a1a',Fitness:'#10b981',Food:'#92400e',Gaming:'#7c3aed',Travel:'#2079FF',Beauty:'#db2777'};
function _mobBrandColor(industry) { return _MOB_BRAND_COLORS[industry] || '#4A6FA5'; }
function _mobBrandInits(name) { return (name||'?').split(/\s+/).map(n=>n[0]).join('').slice(0,2).toUpperCase(); }

// ── Upload + save helpers (mobile versions — renders.js not loaded here) ──────

async function uploadInflBanner(file) {
  if (!file) return;
  const uid = APP.user?.id;
  if (!uid || String(uid).startsWith('demo-')) { toast('Demo mode — upload disabled', 'info'); return; }
  const allowed = ['image/jpeg','image/png','image/webp'];
  if (!allowed.includes(file.type)) { toast(t('upload-allowed-formats'), 'error'); return; }
  if (file.size > 5*1024*1024) { toast(t('upload-max-size-banner'), 'error'); return; }
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${uid}/banner.${ext}`;
  const { error } = await _sb.storage.from('banners').upload(path, file, { upsert:true });
  if (error) { toast(t('upload-failed') + error.message, 'error'); return; }
  const { data } = _sb.storage.from('banners').getPublicUrl(path);
  if (data?.publicUrl) {
    await _sb.from('influencer_profiles').update({ banner_url: data.publicUrl }).eq('user_id', uid);
    APP.profile = Object.assign(APP.profile || {}, { banner_url: data.publicUrl });
    mobInflPage('profile');
    toast(t('upload-banner-success'), 'success');
  }
}

async function uploadInflAvatar(file) {
  if (!file) return;
  const uid = APP.user?.id;
  if (!uid || String(uid).startsWith('demo-')) { toast('Demo mode — upload disabled', 'info'); return; }
  const allowed = ['image/jpeg','image/png','image/webp'];
  if (!allowed.includes(file.type)) { toast(t('upload-allowed-formats'), 'error'); return; }
  if (file.size > 5*1024*1024) { toast(t('upload-max-size-avatar'), 'error'); return; }
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${uid}/avatar.${ext}`;
  const { error } = await _sb.storage.from('avatars').upload(path, file, { upsert:true });
  if (error) { toast(t('upload-failed') + error.message, 'error'); return; }
  const { data } = _sb.storage.from('avatars').getPublicUrl(path);
  if (data?.publicUrl) {
    await _sb.from('influencer_profiles').update({ avatar_url: data.publicUrl }).eq('user_id', uid);
    APP.profile = Object.assign(APP.profile || {}, { avatar_url: data.publicUrl });
    mobInflPage('profile');
    toast(t('upload-avatar-success'), 'success');
  }
}

function saveInflProfileInline() {
  const p = {
    full_name:   document.getElementById('mob-infl-name')?.value.trim()     || null,
    username:    document.getElementById('mob-infl-username')?.value.trim().replace(/^@/,'') || null,
    niche:       document.getElementById('mob-infl-niche')?.value.trim()     || null,
    bio:         document.getElementById('mob-infl-bio')?.value.trim()       || null,
  };
  const uid = APP.user?.id;
  if (!uid || String(uid).startsWith('demo-')) {
    APP.profile = Object.assign(APP.profile || {}, p);
    S.mobProfileEdit = false;
    mobInflPage('profile');
    toast(t('toast-profile-saved') || 'Profil uložený', 'success');
    return;
  }
  _sb.from('influencer_profiles').update(p).eq('user_id', uid).then(({ error }) => {
    if (error) { toast(error.message, 'error'); return; }
    APP.profile = Object.assign(APP.profile || {}, p);
    S.mobProfileEdit = false;
    mobInflPage('profile');
    toast(t('toast-profile-saved') || 'Profil uložený', 'success');
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function renderMobInflDashboard() {
  const pd         = renderInflProfileData();
  const activeCamps = INFL_CAMPAIGNS.filter(c => c.applied && c.status === 'active').length;
  const appliedCamps = INFL_CAMPAIGNS.filter(c => c.applied).length;
  const earnings   = Number(APP.profile?.total_earnings || 0);
  const balance    = Number(APP.wallet?.balance || 0);
  const recommended = INFL_CAMPAIGNS.filter(c => !c.applied).slice(0, 3);
  const myCamps    = INFL_CAMPAIGNS.filter(c => c.applied).slice(0, 3);

  const _campDeadline = c => {
    if (!c.deadline || c.deadline === '—') return {text:'', color:'var(--text-mid,#64748b)'};
    const days = Math.ceil((new Date(c.deadline) - Date.now()) / 86400000);
    return days <= 0
      ? {text: t('c-expired')||'Expired',  color:'#ef4444'}
      : {text: `${days}d left`,            color: days <= 14 ? '#ef4444' : 'var(--text-mid,#64748b)'};
  };

  return `
<div class="pad" style="display:flex;flex-direction:column;gap:18px;padding-bottom:24px">

  <div>
    <div class="small muted" style="font-weight:600">${t('dash-good-day')||'Welcome back,'}</div>
    <h1 style="font-size:24px">Ahoj, ${h(APP.profile?.full_name || APP.profile?.name || '')}!</h1>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-coin"/></svg></div>
      <div class="v">€${earnings.toLocaleString()}</div>
      <div class="l">${t('d-total-earnings')||'Zárobky'}</div>
    </div>
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg></div>
      <div class="v">${activeCamps || appliedCamps}</div>
      <div class="l">${t('d-active-camps')||'Aktívne kampane'}</div>
    </div>
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-eye"/></svg></div>
      <div class="v">${pd.followers}</div>
      <div class="l">${t('d-followers')||'Sledovatelia'}</div>
    </div>
    <div class="stat">
      <div class="ic"><svg viewBox="0 0 24 24"><use href="#ico-bar-chart"/></svg></div>
      <div class="v">${pd.er}</div>
      <div class="l">${t('d-avg-er')||'Priem. ER'}</div>
    </div>
  </div>

  ${recommended.length ? `
  <div>
    <div class="page-h">
      <h2>${t('d-rec-camps')||'Odporúčané kampane'}</h2>
      <button class="see-all" onclick="mobNav('campaigns')">${t('d-see-all')||'Zobraziť všetky'}</button>
    </div>
    <div class="clist">
      ${recommended.map(c => {
        const dl = _campDeadline(c);
        return `
        <div class="ccard">
          <div class="ccard-top">
            <div class="ccard-logo">
              <svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg>
            </div>
            <div class="ccard-tt">
              <div class="ccard-name">${h(c.name)}</div>
              <div class="ccard-host">${h(c.brand)}</div>
              <div class="badges">
                ${typeBadge(c.type)}
                ${dl.text ? `<span style="font-size:11px;color:${dl.color}">${dl.text}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
            <span style="font-weight:700;color:var(--blue)">${h(c.reward)}</span>
            <button class="btn btn-blue" style="height:36px;padding:0 14px;font-size:12px"
              onclick="applyToCampaign(${c.id})">
              ${t('d-apply-now')||'Pridať sa'}
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  ${myCamps.length ? `
  <div>
    <div class="page-h">
      <h2>${t('d-my-camps')||'Moje kampane'}</h2>
      <button class="see-all" onclick="mobNav('campaigns')">${t('d-view-all')||'Zobraziť všetky'}</button>
    </div>
    <div class="clist">
      ${myCamps.map(c => `
        <div class="ccard">
          <div class="ccard-top">
            <div class="ccard-logo">
              <svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg>
            </div>
            <div class="ccard-tt">
              <div class="ccard-name">${h(c.name)}</div>
              <div class="ccard-host">${h(c.brand)}</div>
              <div class="badges">${typeBadge(c.type)} ${statusBadge(c.status)}</div>
            </div>
          </div>
          <div style="font-weight:700;color:var(--blue);margin-top:8px">${h(c.reward)}</div>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <div class="wallet-bar">
    <div style="flex:1">
      <div class="wl">${t('w-balance')||'Zostatok'}</div>
      <div class="wv">€${balance.toFixed(2)}</div>
    </div>
    <button class="btn btn-white" style="width:auto;height:42px;padding:0 18px;flex-shrink:0"
      onclick="mobNav('wallet')">
      ${t('d-withdraw')||'Výplata'}
    </button>
  </div>

</div>`;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

function renderMobInflCampaigns() {
  const isBrandView = !!S._brandFilter;
  const camps = isBrandView ? S._brandCampaigns : INFL_CAMPAIGNS;

  const _dl = c => {
    if (!c.deadline || c.deadline === '—') return {text:'—', color:'var(--text-mid,#64748b)'};
    const days = Math.ceil((new Date(c.deadline) - Date.now()) / 86400000);
    return days <= 0
      ? {text: t('c-expired')||'Expired', color:'#ef4444'}
      : {text: `${days}d left`,           color: days <= 14 ? '#ef4444' : 'var(--text-mid,#64748b)'};
  };

  const campCards = camps.map(c => {
    const dl = _dl(c);
    return `
      <div class="ccard">
        <div class="ccard-top">
          <div class="ccard-logo">
            <svg viewBox="0 0 24 24"><use href="#ico-megaphone"/></svg>
          </div>
          <div class="ccard-tt">
            <div class="ccard-name">${h(c.name)}</div>
            <div class="ccard-host">${h(c.brand)}</div>
            <div class="badges">${typeBadge(c.type)} ${statusBadge(c.status)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
          <div>
            <div style="font-weight:700;color:var(--blue)">${h(c.reward)}</div>
            <div class="small" style="color:${dl.color}">${dl.text}</div>
          </div>
          <div style="display:flex;gap:6px">
            ${c.applied
              ? `<span style="display:inline-flex;align-items:center;padding:0 12px;height:36px;
                  border-radius:8px;background:#e6f9f0;color:#065f46;font-size:12px;font-weight:700">
                  ✓ Applied</span>`
              : `<button class="btn btn-blue" style="height:36px;padding:0 12px;font-size:12px"
                  onclick="applyToCampaign(${c.id})">
                  ${t('d-apply-now')||'Pridať sa'}
                </button>`}
            <button class="btn btn-outline" style="height:36px;padding:0 12px;font-size:12px"
              onclick="showCampDetail(${c.id})">Detail</button>
          </div>
        </div>
      </div>`;
  });

  return `
<div class="pad" style="padding-bottom:90px">
  ${isBrandView ? `
    <button class="btn btn-outline" style="margin-bottom:12px"
      onclick="S._brandFilter=null;S._brandCampaigns=[];mobNav('discover')">
      ← ${t('nav-sidebar-discover')||'Značky'}
    </button>
    <h2 style="margin-bottom:4px">${h(S._brandFilter?.name||'')}</h2>
    <div class="small muted" style="margin-bottom:12px">
      ${camps.length} ${t('c-infl-available')||'kampanií'} · ${camps.filter(c=>c.applied).length} ${t('c-applied-count')||'prihlásených'}
    </div>
  ` : `
    <input class="input" style="margin-bottom:12px"
      placeholder="${t('f-search')||'Hľadať kampane...'}"
      id="mob-infl-camp-search"
      oninput="mobInflFilterCamps(this.value)">
  `}
  <div id="mob-infl-camp-list">
    ${camps.length
      ? campCards.join('')
      : `<div class="mob-empty">
          <div class="mob-empty-icon">📣</div>
          <h3>${t('camp-empty')||'Žiadne kampane'}</h3>
          <p>Prehliadaj dostupné kampane v Objavovaní</p>
        </div>`}
  </div>
</div>`;
}

function mobInflFilterCamps(query) {
  const list = document.getElementById('mob-infl-camp-list');
  if (!list) return;
  const q = (query||'').toLowerCase().trim();
  list.querySelectorAll('.ccard').forEach(card => {
    card.style.display = (!q || card.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
}

// ── Discover ──────────────────────────────────────────────────────────────────

function renderMobInflDiscover() {
  const data = (APP.brands && APP.brands.length) ? APP.brands : _MOB_BRANDS_DEMO;

  const cards = data.map(b => `
    <div class="card" style="margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;padding:14px"
      data-bname="${h((b.name||'').toLowerCase())}">
      <div style="width:48px;height:48px;border-radius:14px;background:${_mobBrandColor(b.industry)};
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
        color:#fff;font-size:16px;font-weight:800">
        ${b.logo_url
          ? `<img src="${h(b.logo_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
          : _mobBrandInits(b.name)}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:4px;font-weight:800">
          ${h(b.name)}
          ${b.verified ? `<svg width="13" height="13" viewBox="0 0 24 24" style="color:var(--blue);flex-shrink:0"><use href="#ico-check-circle"/></svg>` : ''}
        </div>
        <div class="small muted">${h(b.industry||'General')}</div>
        <div class="small muted">${b.campaigns||0} ${t('brand-active-camps')||'aktívnych kampaní'}</div>
      </div>
      <button class="btn btn-outline"
        style="font-size:11px;padding:6px 10px;min-height:44px;white-space:nowrap;border-radius:10px;flex-shrink:0"
        onclick="mobViewBrandProfile('${h(b.id||'')}','${h((b.name||'').replace(/'/g,"\\'"))}')">
        ${t('c-view-profile')||'Profil'}
      </button>
    </div>`).join('');

  return `
<div class="pad" style="padding-bottom:20px">
  <input class="input" style="margin-bottom:14px"
    placeholder="${t('f-search-brands')||'Hľadať značku...'}"
    id="mob-brand-search"
    oninput="mobInflFilterBrands(this.value)">
  <div id="mob-brand-list">${cards}</div>
</div>`;
}

function mobInflFilterBrands(query) {
  const list = document.getElementById('mob-brand-list');
  if (!list) return;
  const q = (query||'').toLowerCase().trim();
  list.querySelectorAll('[data-bname]').forEach(card => {
    card.style.display = (!q || card.dataset.bname.includes(q)) ? '' : 'none';
  });
}

async function mobViewBrandProfile(bizId, bizName) {
  S._brandFilter = { id: bizId ? +bizId : null, name: bizName };
  S._brandCampaigns = [];
  S._brandProfileData = null;
  S.mobBrandTab = 'active';
  S.mobInflPage = 'brand-profile';
  mobInflPage('brand-profile');
  try {
    await _loadBrandProfileAll(bizId ? +bizId : null, bizName);
    if (S.mobInflPage === 'brand-profile') {
      const el = document.getElementById('mob-content');
      if (el) el.innerHTML = renderMobInflBrandProfile();
    }
  } catch(e) {
    console.error('[mobViewBrandProfile]', e);
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────

function renderMobInflMessages() {
  const convs = typeof MESSAGES_INFL !== 'undefined' ? MESSAGES_INFL : [];

  if (S.mobMsgView === 'chat') {
    const partner = convs.find(m => m.convId === S.chatPartner);
    const chatHtml = typeof buildChatMsgs === 'function'
      ? buildChatMsgs(partner, APP.user, 'infl') : '';
    return `<div style="display:flex;flex-direction:column;height:100%">
      <div class="mob-chat-messages" id="chat-msgs" style="flex:1;overflow-y:auto">${chatHtml}</div>
      <div class="mob-composer">
        <input class="mob-composer-input" id="chat-in"
          placeholder="${t('msg-placeholder')||'Správa...'}"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg('infl')}">
        <button onclick="sendMsg('infl')" class="btn btn-blue"
          style="padding:0 14px;min-height:44px;border-radius:12px;flex-shrink:0">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <use href="#ico-send"/>
          </svg>
        </button>
      </div>
    </div>`;
  }

  const filtered = typeof filterMsgConvs === 'function' ? filterMsgConvs(convs) : convs;
  const convRows = filtered.length
    ? filtered.map(conv => `
      <div class="list-item" style="padding:12px 0;cursor:pointer"
        onclick="S.mobMsgView='chat';S.chatPartner='${conv.convId}';mobInflPage('messages')">
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
        <h3>${t('msg-no-convs-infl')||'Žiadne správy'}</h3>
        <p>${t('msg-start-conv')||'Nájdi značku a začni konverzáciu'}</p>
      </div>`;

  return `<div class="pad">
    <input class="input" style="margin-bottom:12px" placeholder="${t('msg-search')||'Hľadať...'}">
    <div style="display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:2px">
      ${['all','unread','brands'].map(f => `
        <button class="chip ${S.msgFilter===f?'active':''}"
          onclick="S.msgFilter='${f}';mobInflPage('messages')">
          ${t('msg-filter-'+f)||f}
        </button>`).join('')}
    </div>
    <div id="mob-conv-list">${convRows}</div>
  </div>
  <button class="fab" style="bottom:80px;right:16px" onclick="openFindUser('infl')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

function renderMobInflAnalytics() {
  const pd      = renderInflProfileData();
  const done    = INFL_CAMPAIGNS.filter(c => c.applied && c.status === 'completed').length;
  const applied = INFL_CAMPAIGNS.filter(c => c.applied).length;
  const earnings = Number(APP.profile?.total_earnings || 0);
  const period   = S.mobAnalyticsPeriod || '30d';

  return `
<div class="pad">
  <div style="display:flex;gap:8px;margin-bottom:16px">
    ${['7d','30d','90d','1y'].map(p => `
      <button class="btn ${period === p ? 'btn-blue' : 'btn-outline'}"
        style="flex:1;font-size:12px;padding:0;height:36px"
        onclick="S.mobAnalyticsPeriod='${p}';mobInflPage('analytics')">
        ${p.toUpperCase()}
      </button>`).join('')}
  </div>

  <div class="metric-2col" style="margin-bottom:16px">
    <div class="stat-card-m">
      <div class="eyebrow">${t('d-total-earnings')||'Zárobky'}</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">€${earnings.toLocaleString()}</div>
      <div class="small muted">${t('d-lifetime')||'Celkovo'}</div>
    </div>
    <div class="stat-card-m">
      <div class="eyebrow">${t('d-total-reach')||'Dosah'}</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${pd.followers}</div>
      <div class="small muted">${t('d-across-plat')||'Platformy'}</div>
    </div>
    <div class="stat-card-m">
      <div class="eyebrow">${t('d-avg-er')||'Avg ER'}</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${pd.er}</div>
      <div class="small muted">${t('d-er-label')||'Engagement'}</div>
    </div>
    <div class="stat-card-m">
      <div class="eyebrow">${t('an-camps-done')||'Kampane'}</div>
      <div style="font-size:20px;font-weight:900;color:var(--navy)">${done || applied}</div>
      <div class="small muted">${t('an-total-collabs')||'Spolupráce'}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:12px">
    <div class="eyebrow" style="margin-bottom:8px">${t('an-monthly-earnings')||'Mesačné zárobky'}</div>
    <canvas id="mob-infl-earnings" style="width:100%;height:200px"></canvas>
  </div>

  <div class="card">
    <div class="eyebrow" style="margin-bottom:8px">${t('an-reach-er')||'Dosah & Engagement'}</div>
    <canvas id="mob-infl-reach" style="width:100%;height:200px"></canvas>
  </div>
</div>`;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

function renderMobInflWallet() {
  const w          = APP.wallet;
  const balance    = Number(w?.balance    || 0);
  const pending    = Number(w?.pending    || 0);
  const totalEarned = Number(w?.total_earned || APP.profile?.total_earnings || 0);
  const txs        = INFL_TRANSACTIONS;

  const isCredit = tx => tx.type === 'credit';
  const txLabel  = tx => tx.description || tx.desc || tx.type;
  const txDate   = tx => tx.date || (tx.created_at||'').slice(0,10) || '';
  const txAmt    = tx => {
    if (typeof tx.amount === 'number') return Math.abs(tx.amount).toFixed(2);
    return String(tx.amount||'').replace(/[€+\-,\s]/g,'') || '0.00';
  };

  return `
<div class="pad">

  <div class="card" style="background:linear-gradient(135deg,var(--navy),var(--blue));
    color:#fff;margin-bottom:16px;text-align:center">
    <div class="eyebrow" style="opacity:.6;margin-bottom:8px">${t('w-avail-bal')||'Dostupný zostatok'}</div>
    <div style="font-size:40px;font-weight:900;margin-bottom:4px">€${balance.toFixed(2)}</div>
    ${pending > 0
      ? `<div style="font-size:13px;opacity:.7;margin-bottom:16px">${t('w-pending-prefix')||'Čaká:'} €${pending.toFixed(2)}</div>`
      : '<div style="margin-bottom:16px"></div>'}
    <button class="btn btn-glass" style="width:100%" onclick="openMobInflWithdrawSheet()">
      ${t('w-withdraw-btn')||'Požiadať o výplatu'}
    </button>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:700">${t('w-iban')||'IBAN'}</div>
      <button class="btn btn-outline" style="height:34px;padding:0 12px;font-size:12px"
        onclick="S.mobIBANOpen=!S.mobIBANOpen;mobInflPage('wallet')">
        ${S.mobIBANOpen ? t('w-hide-iban')||'Skryť IBAN' : t('w-show-iban')||'Zobraziť IBAN'}
      </button>
    </div>
    ${S.mobIBANOpen ? `
      <div style="margin-top:12px">
        ${APP.profile?.iban
          ? `<div style="font-family:monospace;font-size:14px;padding:10px;
              background:var(--blue-light,#eef3ff);border-radius:8px;word-break:break-all">
              ${h(APP.profile.iban)}</div>`
          : `<div class="field" style="margin-top:8px">
              <label>${t('w-enter-iban')||'Zadaj IBAN'}</label>
              <input class="input" id="mob-infl-iban" placeholder="SK..." value="${h(APP.profile?.iban||'')}">
              <button class="btn btn-blue" style="margin-top:8px;width:100%"
                onclick="typeof saveInflProfile==='function'?saveInflProfile():toast('Coming soon','info')">
                ${t('prof-save')||'Uložiť'}
              </button>
            </div>`}
      </div>
    ` : ''}
  </div>

  <div style="display:flex;gap:12px;margin-bottom:16px">
    <div class="card" style="flex:1;text-align:center">
      <div class="eyebrow">${t('w-total-earned-lbl')||'Zarobené'}</div>
      <div style="font-weight:800;font-size:16px">€${totalEarned.toLocaleString()}</div>
    </div>
    <div class="card" style="flex:1;text-align:center">
      <div class="eyebrow">${t('w-pending-label')||'Čakajúce'}</div>
      <div style="font-weight:800;font-size:16px">€${pending.toFixed(2)}</div>
    </div>
  </div>

  <div class="section-label">${t('tab-transactions')||'Transakcie'}</div>
  ${txs.length ? txs.map(tx => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;
        background:${isCredit(tx) ? '#e6f7ee' : '#fff0f0'};
        display:flex;align-items:center;justify-content:center;font-size:18px">
        ${isCredit(tx) ? '↑' : '↓'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis">${h(txLabel(tx))}</div>
        <div class="small muted">${txDate(tx)}</div>
      </div>
      <div style="font-weight:700;flex-shrink:0;
        color:${isCredit(tx) ? 'var(--green,#22c55e)' : 'var(--text)'}">
        ${isCredit(tx) ? '+' : '-'}€${txAmt(tx)}
      </div>
    </div>`).join('')
  : `<div class="mob-empty"><div class="mob-empty-icon">💸</div>
      <h3>${t('w-no-transactions')||'Žiadne transakcie'}</h3></div>`}

</div>

<div class="sheet-backdrop" id="mob-infl-withdraw-bd" onclick="closeMobInflWithdrawSheet()"></div>
<div class="sheet" id="mob-infl-withdraw-sheet" style="padding:20px">
  <div class="sheet-grip"></div>
  <h3>${t('w-request-withdrawal')||'Požiadať o výplatu'}</h3>
  <div class="field" style="margin-top:16px">
    <label>${t('w-amount-label')||'Suma (min. €50)'}</label>
    <input class="input" id="mob-infl-withdraw-amt" type="number" min="50" placeholder="€">
  </div>
  ${APP.profile?.iban
    ? `<div class="small muted" style="margin-bottom:12px">IBAN: ${h(APP.profile.iban)}</div>`
    : `<div class="field">
        <label>IBAN</label>
        <input class="input" id="mob-infl-withdraw-iban" placeholder="SK...">
      </div>`}
  <button class="btn btn-blue" style="width:100%;margin-top:4px"
    onclick="requestWithdrawal(document.getElementById('mob-infl-withdraw-amt')?.value)">
    ${t('w-confirm')||'Potvrdiť'}
  </button>
</div>`;
}

function openMobInflWithdrawSheet() {
  document.getElementById('mob-infl-withdraw-bd')?.classList.add('open');
  document.getElementById('mob-infl-withdraw-sheet')?.classList.add('open');
}

function closeMobInflWithdrawSheet() {
  document.getElementById('mob-infl-withdraw-bd')?.classList.remove('open');
  document.getElementById('mob-infl-withdraw-sheet')?.classList.remove('open');
}

// ── Profile ───────────────────────────────────────────────────────────────────

function renderMobInflProfile() {
  const pd       = renderInflProfileData();
  const initials = pd.name.split(/\s+/).map(n=>n[0]).join('').slice(0,2).toUpperCase() || '??';
  const p        = APP.profile || {};
  const platforms = p.platforms || [];
  const _pmMap   = {ig:{name:'Instagram',color:'#e1306c'},tt:{name:'TikTok',color:'#010101'},yt:{name:'YouTube',color:'#ff0000'},fb:{name:'Facebook',color:'#1877f2'}};
  const reviews  = APP._bizReviews || [];

  return `
<div>
  <div style="height:140px;position:relative;
    background:linear-gradient(135deg,#7c3aed,var(--blue));
    cursor:pointer;overflow:hidden"
    onclick="document.getElementById('mob-infl-banner-in').click()">
    ${p.banner_url
      ? `<img src="${h(p.banner_url)}" style="width:100%;height:100%;object-fit:cover">`
      : ''}
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,.2);opacity:0;transition:opacity 200ms"
      onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <use href="#ico-camera"/></svg>
    </div>
  </div>
  <input type="file" id="mob-infl-banner-in" accept="image/*" style="display:none"
    onchange="uploadInflBanner(this.files[0])">

  <div style="position:relative;margin-top:-38px;padding:0 20px">
    <div style="width:72px;height:72px;border-radius:50%;border:3px solid #fff;cursor:pointer;
      overflow:hidden;background:linear-gradient(135deg,#7c3aed,var(--blue));
      display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900"
      onclick="document.getElementById('mob-infl-avatar-in').click()">
      ${p.avatar_url
        ? `<img src="${h(p.avatar_url)}" style="width:100%;height:100%;object-fit:cover">`
        : initials}
    </div>
    <input type="file" id="mob-infl-avatar-in" accept="image/*" style="display:none"
      onchange="uploadInflAvatar(this.files[0])">
  </div>

  <div class="pad" style="padding-top:12px">
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
        <h2>${h(pd.name)}</h2>
        ${p.verified ? `<svg width="16" height="16" viewBox="0 0 24 24" style="color:var(--blue);flex-shrink:0"><use href="#ico-check-circle"/></svg>` : ''}
      </div>
      <div class="small muted">${h(pd.handle)}</div>
      <div class="small muted">${h(pd.niche)}</div>
      ${pd.bio ? `<div style="font-size:13px;color:var(--text-mid,#64748b);margin-top:8px;line-height:1.5">${h(pd.bio)}</div>` : ''}
    </div>

    <button class="btn btn-outline" style="width:100%;margin-bottom:16px"
      onclick="S.mobProfileEdit=!S.mobProfileEdit;mobInflPage('profile')">
      ${S.mobProfileEdit ? '✕ ' + (t('prof-cancel')||'Zavrieť') : '✏ ' + (t('prof-edit-btn')||'Edit Profile')}
    </button>

    ${S.mobProfileEdit ? `
      <div class="card" style="margin-bottom:16px">
        <div class="field"><label>${t('fld-full-name')||'Celé meno'}</label>
          <input class="input" id="mob-infl-name" value="${h(p.full_name||p.name||'')}"></div>
        <div class="field"><label>${t('fld-username')||'Username'}</label>
          <input class="input" id="mob-infl-username" value="${h(p.username||(p.handle||'').replace(/^@/,''))}"></div>
        <div class="field"><label>${t('fld-niche')||'Niche'}</label>
          <input class="input" id="mob-infl-niche" value="${h(p.niche||'')}"></div>
        <div class="field"><label>${t('fld-bio')||'Bio'}</label>
          <textarea class="input" id="mob-infl-bio" rows="3">${h(p.bio||'')}</textarea></div>
        <button class="btn btn-blue" style="width:100%;margin-top:8px"
          onclick="saveInflProfileInline()">Uložiť</button>
      </div>
    ` : ''}

    ${platforms.length ? `
      <div class="section-label">${t('prof-connected-platforms')||'Platformy'}</div>
      ${platforms.map(pid => {
        const pm   = _pmMap[pid] || {name:pid, color:'var(--blue)'};
        const stat = (APP._platformStats||[]).find(s => s.platform === pid);
        const score = stat?.score || 0;
        return `
          <div class="card" style="margin-bottom:10px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-weight:700">${pm.name}</div>
                <div class="small muted">${t('ps-avg-views')||'Avg views'}: ${stat?.avg_views ? Number(stat.avg_views).toLocaleString() : '—'}</div>
                <div class="small muted">ER: ${stat?.engagement_rate ? stat.engagement_rate+'%' : pd.er}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:28px;font-weight:900;color:var(--blue);line-height:1">${score || '—'}</div>
                <div style="font-size:10px;color:var(--text-mid,#64748b);text-transform:uppercase">${t('ps-score')||'Score'}</div>
              </div>
            </div>
          </div>`;
      }).join('')}
    ` : ''}

    ${reviews.length ? `
      <div class="section-label">${t('prof-reviews')||'Hodnotenia'}</div>
      ${reviews.slice(0,3).map(r => `
        <div class="card" style="margin-bottom:8px;padding:12px">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px;color:#f59e0b">
            ${'★'.repeat(Math.min(r.stars||5, 5))}
          </div>
          <div style="font-size:13px;color:var(--text-mid,#64748b)">${h(r.comment||'')}</div>
        </div>`).join('')}
    ` : ''}
  </div>
</div>`;
}

// ── Settings ──────────────────────────────────────────────────────────────────

function toggleMobInflSettings(s) {
  S.mobInflSettingsOpen = S.mobInflSettingsOpen === s ? null : s;
  mobInflPage('settings');
}

function mobInflSettingContent(id) {
  const p = APP.profile || {};
  if (id === 'account') {
    return `
      <div class="field"><label>${t('fld-full-name')||'Celé meno'}</label>
        <input class="input" id="iset-name" value="${h(p.full_name||p.name||'')}"></div>
      <div class="field"><label>Bio</label>
        <textarea class="input" id="iset-bio" rows="3">${h(p.bio||'')}</textarea></div>
      <div class="field"><label>${t('fld-niche')||'Niche'}</label>
        <input class="input" id="iset-niche" value="${h(p.niche||'')}"></div>
      <button class="btn btn-blue" style="width:100%;margin-top:8px"
        onclick="saveInflProfileInline()">Uložiť</button>`;
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
      ${toggle(t('notif-campaigns')||'Kampane', 'Nové kampane a pozvánky', true)}
      ${toggle(t('notif-messages')||'Správy',   'Správy od značiek',       true)}
      ${toggle(t('notif-payments')||'Platby',   'Výplaty a zárobky',       true)}`;
  }
  if (id === 'lang') {
    const cur = (typeof S !== 'undefined' && S.lang) || 'sk';
    return `
      <div style="display:flex;gap:8px">
        ${['sk','en'].map(l => `
          <button class="btn ${cur === l ? 'btn-blue' : 'btn-outline'}" style="flex:1"
            onclick="setLang('${l}');mobInflPage('settings')">${l.toUpperCase()}</button>
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

function renderMobInflSettings() {
  return `
<div class="pad">
  ${[
    {id:'account',  label: t('sett-account')  || 'Môj účet'},
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
        onclick="toggleMobInflSettings('${sec.id}')">
        ${sec.label}
        <span>${S.mobInflSettingsOpen === sec.id ? '▲' : '▼'}</span>
      </button>
      ${S.mobInflSettingsOpen === sec.id ? `
        <div style="padding:16px;border-top:1px solid var(--border)">
          ${mobInflSettingContent(sec.id)}
        </div>
      ` : ''}
    </div>
  `).join('')}
</div>`;
}

// ── Brand Profile ─────────────────────────────────────────────────────────────

function renderMobInflBrandProfile() {
  if (!S._brandFilter) { mobInflPage('discover'); return '<div class="pad">Načítavam...</div>'; }

  const loading   = !S._brandProfileData;
  const brandName = S._brandFilter.name;
  const b         = S._brandProfileData?.brand || {};
  const activeCamps = S._brandCampaigns || [];
  const pastCamps   = S._brandProfileData?.pastCamps || [];
  const reviews     = S._brandProfileData?.reviews || [];
  const tab         = S.mobBrandTab || 'active';

  const _dl = c => {
    if (!c.deadline || c.deadline === '—') return null;
    const days = Math.ceil((new Date(c.deadline) - Date.now()) / 86400000);
    return {days, color: days <= 14 ? '#ef4444' : 'var(--text-mid,#64748b)', text: days <= 0 ? 'Expired' : `${days}d left`};
  };

  let tabContent = '';
  if (!loading) {
    if (tab === 'active') {
      tabContent = activeCamps.length
        ? activeCamps.map(c => {
            const dl = _dl(c);
            return `
              <div class="card" style="margin-bottom:10px;padding:14px">
                <div style="margin-bottom:8px">${typeBadge(c.type)}</div>
                <div style="font-weight:800;margin-bottom:4px">${h(c.name)}</div>
                <div style="font-weight:700;color:var(--blue);margin-bottom:8px">${h(c.reward)}</div>
                ${dl ? `<div class="small" style="color:${dl.color};margin-bottom:10px">${dl.text}</div>` : ''}
                ${c.applied
                  ? `<div style="text-align:center;padding:8px;background:#e6f9f0;border-radius:8px;
                      color:#065f46;font-weight:700;font-size:13px">✓ Applied</div>`
                  : `<button class="btn btn-blue" style="width:100%"
                      onclick="applyToCampaign(${c.id})">${t('d-apply-now')||'Pridať sa'}</button>`}
              </div>`;
          }).join('')
        : `<div class="mob-empty"><div class="mob-empty-icon">📣</div><h3>Žiadne aktívne kampane</h3></div>`;
    } else if (tab === 'past') {
      tabContent = pastCamps.length
        ? pastCamps.map(c => `
            <div class="card" style="margin-bottom:8px;padding:12px">
              <div style="font-weight:700">${h(c.name)}</div>
              <div class="small muted">${h(c.reward)} · ${c.participants||0} influencerov · ${h(c.reach||'—')} reach</div>
            </div>`).join('')
        : `<div class="mob-empty"><div class="mob-empty-icon">📋</div><h3>Žiadne predošlé kampane</h3></div>`;
    } else if (tab === 'reviews') {
      tabContent = reviews.length
        ? reviews.map(r => `
            <div class="card" style="margin-bottom:8px;padding:12px">
              <div style="color:#f59e0b;margin-bottom:6px">${'★'.repeat(Math.min(r.stars||5,5))}</div>
              <div style="font-size:13px;color:var(--text-mid,#64748b)">${h(r.comment||'—')}</div>
            </div>`).join('')
        : `<div class="mob-empty"><div class="mob-empty-icon">⭐</div><h3>Žiadne hodnotenia</h3></div>`;
    } else if (tab === 'about') {
      tabContent = `
        <div class="card" style="padding:14px">
          <div style="font-size:14px;color:var(--text-mid,#64748b);line-height:1.6">
            ${h(b.about || b.description || t('brand-no-desc') || 'Žiadny popis')}
          </div>
          ${b.website ? `<a href="${h(b.website)}" target="_blank" rel="noopener"
            style="display:inline-block;margin-top:12px;color:var(--blue);font-size:13px">
            ${h(b.website)}</a>` : ''}
          ${b.country ? `<div class="small muted" style="margin-top:8px">📍 ${h(b.country)}</div>` : ''}
        </div>`;
    }
  }

  return `
<div style="padding-bottom:20px">
  <div style="padding:16px 20px 0">
    <button class="btn btn-outline" style="margin-bottom:12px"
      onclick="S._brandFilter=null;S._brandCampaigns=[];S._brandProfileData=null;mobInflPage('discover')">
      ← ${t('back')||'Späť'}
    </button>
  </div>

  <div style="height:120px;background:${_mobBrandColor(b.industry||'')};position:relative;overflow:hidden">
    ${b.banner_url ? `<img src="${h(b.banner_url)}" style="width:100%;height:100%;object-fit:cover">` : ''}
  </div>
  <div style="padding:0 20px;margin-top:-28px;margin-bottom:12px">
    <div style="width:56px;height:56px;border-radius:14px;border:3px solid #fff;overflow:hidden;
      background:${_mobBrandColor(b.industry||'')};display:flex;align-items:center;
      justify-content:center;color:#fff;font-weight:800;font-size:16px">
      ${b.logo_url
        ? `<img src="${h(b.logo_url)}" style="width:100%;height:100%;object-fit:cover">`
        : _mobBrandInits(b.company_name || brandName)}
    </div>
  </div>

  <div class="pad" style="padding-top:0">
    <div style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
        <h2>${h(b.company_name || brandName)}</h2>
        ${b.verified ? `<svg width="16" height="16" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-check-circle"/></svg>` : ''}
      </div>
      <div class="small muted">${h(b.industry||'')}</div>
    </div>

    <div style="display:flex;gap:12px;overflow-x:auto;-webkit-overflow-scrolling:touch;
      padding-bottom:4px;margin-bottom:16px">
      <div class="card" style="flex-shrink:0;min-width:120px;text-align:center;padding:12px">
        <div style="font-size:20px;font-weight:900;color:var(--navy)">${activeCamps.length}</div>
        <div class="small muted">${t('brand-active-camps')||'Aktívne kampane'}</div>
      </div>
      ${b.rating ? `
        <div class="card" style="flex-shrink:0;min-width:120px;text-align:center;padding:12px">
          <div style="font-size:20px;font-weight:900;color:var(--navy)">★ ${Number(b.rating).toFixed(1)}</div>
          <div class="small muted">${t('brand-rating')||'Hodnotenie'}</div>
        </div>` : ''}
      ${b.response_time ? `
        <div class="card" style="flex-shrink:0;min-width:120px;text-align:center;padding:12px">
          <div style="font-size:20px;font-weight:900;color:var(--navy)">${h(b.response_time)}</div>
          <div class="small muted">${t('brand-response-time')||'Odpoveď'}</div>
        </div>` : ''}
    </div>

    ${loading ? `
      <div style="text-align:center;padding:40px;color:var(--text-mid,#64748b)">
        <div style="width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--blue);
          border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px"></div>
        Načítavam...
      </div>` : `
      <div style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;
        padding-bottom:8px;margin-bottom:12px">
        ${[
          {id:'active',  label: t('brand-tab-active') ||'Aktívne'},
          {id:'past',    label: t('brand-tab-past')   ||'Predošlé'},
          {id:'reviews', label: t('brand-tab-reviews')||'Recenzie'},
          {id:'about',   label: t('brand-tab-about')  ||'O značke'},
        ].map(tb => `
          <button class="btn ${tab === tb.id ? 'btn-blue' : 'btn-outline'}"
            style="white-space:nowrap;font-size:12px;flex-shrink:0"
            onclick="S.mobBrandTab='${tb.id}';mobInflPage('brand-profile')">
            ${tb.label}
          </button>`).join('')}
      </div>
      ${tabContent}

      ${activeCamps.length ? `
        <div class="card" style="margin-top:16px;border:1.5px solid var(--blue)">
          <div style="font-weight:800;margin-bottom:4px">${t('bp-brand-signals')||'Brand signals'}</div>
          <div class="small muted" style="margin-bottom:10px">${t('bp-match-desc')||'Súlad s tvojim profilom'}</div>
          <div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:6px">
            <div style="height:4px;background:var(--blue);border-radius:2px;
              width:${Math.min(70 + activeCamps.length*5, 95)}%"></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:var(--blue)">
            ${Math.min(70 + activeCamps.length*5, 95)}% Match
          </div>
        </div>
      ` : ''}
    `}
  </div>
</div>`;
}
