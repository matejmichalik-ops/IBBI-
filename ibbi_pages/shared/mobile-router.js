// ── Mobile Router — shared/mobile-router.js ─────────────────────────────────
// Handles shell rendering, navigation, and app init for mobile pages.

let _mobTopbarOriginal = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

function _mobInitials() {
  const name = APP.profile?.company_name || APP.profile?.full_name || APP.user?.email || 'IB';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function _mobDisplayName() {
  return APP.profile?.company_name || APP.profile?.full_name || APP.user?.email || 'User';
}

// ── Bottom sheet ──────────────────────────────────────────────────────────────

function openMobSheet() {
  const bd = document.getElementById('mob-sheet-bd');
  const sh = document.getElementById('mob-sheet');
  if (bd) bd.classList.add('open');
  if (sh) sh.classList.add('open');
}

function closeMobSheet() {
  const bd = document.getElementById('mob-sheet-bd');
  const sh = document.getElementById('mob-sheet');
  if (bd) bd.classList.remove('open');
  if (sh) sh.classList.remove('open');
}

// ── Filter sheet ─────────────────────────────────────────────────────────────

function openMobFilterSheet() {
  const bd = document.getElementById('mob-filter-bd');
  const sh = document.getElementById('mob-filter-sheet');
  if (bd) bd.classList.add('open');
  if (sh) sh.classList.add('open');
}

function closeMobFilterSheet() {
  const bd = document.getElementById('mob-filter-bd');
  const sh = document.getElementById('mob-filter-sheet');
  if (bd) bd.classList.remove('open');
  if (sh) sh.classList.remove('open');
}

// ── Tab & title helpers ───────────────────────────────────────────────────────

const _MOB_MAIN_TABS = ['dashboard', 'campaigns', 'discover', 'messages'];

function _mobSetActiveTab(page) {
  document.querySelectorAll('#mob-nav .tab').forEach(el => el.classList.remove('active'));
  if (_MOB_MAIN_TABS.includes(page)) {
    const tab = document.querySelector(`#mob-nav .tab[data-page="${page}"]`);
    if (tab) tab.classList.add('active');
  }
}

function _mobSetTitle(page) {
  const titles = {
    dashboard:  (typeof t === 'function' ? t('nav-sidebar-dashboard')  : null) || 'Dashboard',
    campaigns:  (typeof t === 'function' ? t('nav-sidebar-campaigns')  : null) || 'Campaigns',
    discover:   (typeof t === 'function' ? t('nav-sidebar-discover')   : null) || 'Discover',
    messages:   (typeof t === 'function' ? t('nav-sidebar-messages')   : null) || 'Messages',
    analytics:  (typeof t === 'function' ? t('nav-sidebar-analytics')  : null) || 'Analytics',
    wallet:     (typeof t === 'function' ? t('nav-sidebar-wallet')     : null) || 'Wallet',
    profile:    (typeof t === 'function' ? t('nav-sidebar-profile')    : null) || 'Profile',
    settings:   (typeof t === 'function' ? t('nav-sidebar-settings')   : null) || 'Settings',
  };
  const el = document.getElementById('mob-page-title');
  if (el) el.textContent = titles[page] || page;
}

// ── Shell renderer ────────────────────────────────────────────────────────────

function renderMobShell(role) {
  const root = document.getElementById('mob-root');
  if (!root) return;

  const initials = _mobInitials();
  const displayName = _mobDisplayName();
  const email = APP.user?.email || '';

  const tabs = [
    { page: 'dashboard', icon: '#ico-dashboard',  label: (typeof t === 'function' ? t('nav-sidebar-dashboard') : null) || 'Dashboard' },
    { page: 'campaigns', icon: '#ico-campaigns',  label: (typeof t === 'function' ? t('nav-sidebar-campaigns') : null) || 'Campaigns' },
    { page: 'discover',  icon: '#ico-discover',   label: (typeof t === 'function' ? t('nav-sidebar-discover')  : null) || 'Discover'  },
    { page: 'messages',  icon: '#ico-messages',   label: (typeof t === 'function' ? t('nav-sidebar-messages')  : null) || 'Messages'  },
    { page: 'more',      icon: '#ico-more',       label: (typeof t === 'function' ? t('nav-mob-more')          : null) || 'More'      },
  ];

  const tabsHTML = tabs.map(tab =>
    `<button class="tab" data-page="${tab.page}" onclick="${tab.page === 'more' ? 'openMobSheet()' : `mobNav('${tab.page}')`}">
      <svg viewBox="0 0 24 24"><use href="${tab.icon}"/></svg>
      <span>${tab.label}</span>
    </button>`
  ).join('');

  const sheetItems = [
    { page: 'analytics', icon: '#ico-analytics', label: (typeof t === 'function' ? t('nav-sidebar-analytics') : null) || 'Analytics' },
    { page: 'wallet',    icon: '#ico-wallet',    label: (typeof t === 'function' ? t('nav-sidebar-wallet')    : null) || 'Wallet'    },
    { page: 'profile',   icon: '#ico-profile',   label: (typeof t === 'function' ? t('nav-sidebar-profile')   : null) || 'Profile'   },
    { page: 'settings',  icon: '#ico-settings',  label: (typeof t === 'function' ? t('nav-sidebar-settings')  : null) || 'Settings'  },
  ];

  const sheetItemsHTML = sheetItems.map(item =>
    `<button class="sheet-item" onclick="closeMobSheet();mobNav('${item.page}')">
      <span class="sheet-ic"><svg viewBox="0 0 24 24"><use href="${item.icon}"/></svg></span>
      <span>${item.label}</span>
    </button>`
  ).join('');

  root.innerHTML = `
    <div class="topbar" id="mob-topbar">
      <div class="topbar-logo">
        <svg viewBox="0 0 80 32" width="60" height="24" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="24" font-family="Inter,system-ui,sans-serif" font-weight="900" font-size="24" letter-spacing="-0.5" fill="#2079FF">IBBI</text>
        </svg>
      </div>
      <div id="mob-page-title" class="topbar-title">Dashboard</div>
      <div class="topbar-actions">
        <button class="topbar-btn" onclick="toggleMobNotifs()" id="mob-notif-btn">
          <svg viewBox="0 0 24 24"><use href="#ico-bell"/></svg>
          <span id="mob-notif-badge" class="notif-dot hidden"></span>
        </button>
        <button class="topbar-avatar" onclick="mobNav('profile')" id="mob-avatar-btn">
          <span id="mob-topbar-initials">${initials}</span>
        </button>
      </div>
    </div>

    <div class="content" id="mob-content"></div>

    <nav class="bottomnav" id="mob-nav">
      ${tabsHTML}
    </nav>

    <div class="sheet-backdrop" id="mob-sheet-bd" onclick="closeMobSheet()"></div>
    <div class="sheet" id="mob-sheet">
      <div class="sheet-grip"></div>
      <div class="sheet-head">
        <div class="sheet-av">${initials}</div>
        <div>
          <div class="sheet-name">${displayName}</div>
          <div class="sheet-sub">${email}</div>
        </div>
      </div>
      ${sheetItemsHTML}
      <div class="sheet-lang">
        <div class="lang-pills">
          <button class="lang-pill${(typeof LANG !== 'undefined' && LANG === 'en') ? ' active' : ''}" onclick="setLang('en');closeMobSheet()">EN</button>
          <button class="lang-pill${(typeof LANG !== 'undefined' && LANG === 'sk') ? ' active' : ''}" onclick="setLang('sk');closeMobSheet()">SK</button>
        </div>
      </div>
      <button class="sheet-item" onclick="mobSignOut()" style="color:var(--error,#ef4444)">
        <span class="sheet-ic"><svg viewBox="0 0 24 24"><use href="#ico-exit"/></svg></span>
        <span>${(typeof t === 'function' ? t('nav-sidebar-exit') : null) || 'Sign Out'}</span>
      </button>
    </div>

    <div class="sheet-backdrop" id="mob-filter-bd" onclick="closeMobFilterSheet()"></div>
    <div class="sheet" id="mob-filter-sheet">
      <div class="sheet-grip"></div>
      <div id="mob-filter-content"></div>
    </div>
  `;
}

// ── Navigation ────────────────────────────────────────────────────────────────

function mobNav(page) {
  closeMobSheet();
  _mobSetActiveTab(page);
  _mobSetTitle(page);
  const content = document.getElementById('mob-content');
  if (content) content.scrollTop = 0;
  if (S.role === 'business') {
    S.mobBizPage = page;
    mobBizPage(page);
  } else {
    S.mobInflPage = page;
    mobInflPage(page);
  }
}

// ── Render dispatcher ─────────────────────────────────────────────────────────

function _mobRender(renders, page) {
  const fn = renders[page];
  if (typeof fn === 'function') return fn();
  return `<div class="pad" style="text-align:center;padding:60px 24px;color:var(--text-mid,#64748b)">
    <div style="font-size:2.5rem;margin-bottom:12px">🚧</div>
    <div style="font-weight:700;margin-bottom:6px">${page.charAt(0).toUpperCase() + page.slice(1)}</div>
    <div class="small">Coming soon</div>
  </div>`;
}

function mobBizPage(page) {
  const content = document.getElementById('mob-content');
  if (!content) return;
  if (typeof destroyCharts === 'function') destroyCharts();
  if (page !== 'messages' && typeof cleanupChatSub === 'function') cleanupChatSub();
  const renders = {
    dashboard: typeof renderMobBizDashboard !== 'undefined' ? renderMobBizDashboard : null,
    campaigns: typeof renderMobBizCampaigns !== 'undefined' ? renderMobBizCampaigns : null,
    discover:  typeof renderMobBizDiscover  !== 'undefined' ? renderMobBizDiscover  : null,
    messages:  typeof renderMobBizMessages  !== 'undefined' ? renderMobBizMessages  : null,
    analytics: typeof renderMobBizAnalytics !== 'undefined' ? renderMobBizAnalytics : null,
    wallet:    typeof renderMobBizWallet    !== 'undefined' ? renderMobBizWallet    : null,
    profile:          typeof renderMobBizProfile          !== 'undefined' ? renderMobBizProfile          : null,
    settings:         typeof renderMobBizSettings         !== 'undefined' ? renderMobBizSettings         : null,
    'campaign-detail':typeof renderMobBizCampaignDetail   !== 'undefined' ? renderMobBizCampaignDetail   : null,
  };
  content.innerHTML = _mobRender(renders, page);
  _mobBizPostRender(page);
}

function _mobBizPostRender(page) {
  // Restore topbar unless entering chat view
  if (!(page === 'messages' && S.mobMsgView === 'chat')) {
    _mobRestoreTopbar();
  }

  if (page === 'discover') {
    const fc = document.getElementById('mob-filter-content');
    if (fc && typeof _renderMobDiscoverFilters === 'function') fc.innerHTML = _renderMobDiscoverFilters();
  }

  if (page === 'analytics') {
    const period = (typeof S !== 'undefined' && S.mobAnalyticsPeriod) || '30d';
    const totalReach = (typeof BIZ_CAMPAIGNS !== 'undefined' ? BIZ_CAMPAIGNS : []).reduce((s, c) => {
      const r = String(c.reach);
      if (r === '—') return s;
      if (r.includes('M')) return s + parseFloat(r) * 1000000;
      if (r.includes('K')) return s + parseFloat(r) * 1000;
      return s + (parseInt(r) || 0);
    }, 0);
    const totalConv = (typeof BIZ_CAMPAIGNS !== 'undefined' ? BIZ_CAMPAIGNS : [])
      .reduce((s, c) => s + (Number(c.conversions) || 0), 0);
    const periodLabels = {
      '7d':  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      '30d': ['W1','W2','W3','W4'],
      '90d': ['Jan','Feb','Mar'],
      '1y':  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    };
    const labels  = periodLabels[period] || periodLabels['30d'];
    const n       = labels.length;
    const seed    = [.55,.72,.48,.91,.63,.80,.38,.68,.85,.44,.76,.59];
    const reachData = labels.map((_, i) => Math.round(totalReach * seed[i % seed.length] / n));
    const convData  = labels.map((_, i) => Math.round(totalConv  * seed[(i + 3) % seed.length] / n));
    setTimeout(() => {
      const rc = document.getElementById('mob-biz-reach');
      const cc = document.getElementById('mob-biz-conv');
      if (rc && typeof mkLine === 'function') mkLine('mob-biz-reach', labels, [{
        label: 'Reach', data: reachData,
        borderColor: BLUE, backgroundColor: BLUE_LIGHT, borderWidth: 2, fill: true, tension: .4
      }]);
      if (cc && typeof mkBar === 'function') mkBar('mob-biz-conv', labels, [{
        label: 'Conversions', data: convData,
        backgroundColor: BLUE_LIGHT, borderColor: BLUE, borderWidth: 2
      }]);
    }, 50);
  }

  if (page === 'messages') {
    const content = document.getElementById('mob-content');
    if (content) content.style.overflow = S.mobMsgView === 'chat' ? 'hidden' : '';

    if (S.mobMsgView === 'chat') {
      _mobSetChatTopbar();
      const msgs = document.getElementById('chat-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      if (typeof subscribeChat === 'function' && S.chatPartner && APP.user?.id && !String(APP.user.id).startsWith('demo-')) {
        subscribeChat(S.chatPartner, 'biz');
      }
    } else {
      if (APP.user && typeof loadConversations === 'function') {
        loadConversations('biz').then(() => {
          if (S.mobBizPage === 'messages' && S.mobMsgView === 'list') {
            const c = document.getElementById('mob-content');
            if (c && typeof renderMobBizMessages === 'function') c.innerHTML = renderMobBizMessages();
          }
        });
      }
      if (typeof initChat === 'function') initChat('biz');
    }
  }

  if (page !== 'messages' && typeof _msgKbHandler === 'function')
    document.removeEventListener('keydown', _msgKbHandler);

  if (page === 'campaign-detail' && typeof S !== 'undefined' && S.mobCampTab === 'analytics') {
    const c = S._campDetail?.campaign
      || (typeof BIZ_CAMPAIGNS !== 'undefined'
          ? BIZ_CAMPAIGNS.find(c2 => c2.id === S._campDetail?.campId) : null);
    setTimeout(() => {
      const labels = ['W1','W2','W3','W4'];
      const reach  = parseInt(String((c?.reach || '0')).replace(/[MK,]/g, '')) || 0;
      const conv   = Number(c?.conversions) || 0;
      const seed   = [.55,.72,.48,.91];
      if (document.getElementById('mob-cd-reach') && typeof mkLine === 'function')
        mkLine('mob-cd-reach', labels, [{label:'Reach', data:seed.map(s=>Math.round(reach*s/4)),
          borderColor:BLUE, backgroundColor:BLUE_LIGHT, borderWidth:2, fill:true, tension:.4}]);
      if (document.getElementById('mob-cd-conv') && typeof mkBar === 'function')
        mkBar('mob-cd-conv', labels, [{label:'Conversions', data:seed.map(s=>Math.round(conv*s/4)),
          backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
    }, 50);
  }
}

function _mobSetChatTopbar() {
  const topbar = document.getElementById('mob-topbar');
  if (!topbar) return;
  if (!_mobTopbarOriginal) _mobTopbarOriginal = topbar.innerHTML;
  const arr = typeof MESSAGES_BIZ !== 'undefined' ? MESSAGES_BIZ : [];
  const partner = arr.find(m => m.convId === S.chatPartner);
  const partnerName = partner ? (typeof h === 'function' ? h(partner.name) : partner.name) : 'Chat';
  topbar.innerHTML = `
    <button class="icon-btn topbar-back" onclick="S.mobMsgView='list';mobBizPage('messages')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#ico-back"/></svg>
    </button>
    <span class="topbar-title">${partnerName}</span>
    <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
      <span style="width:8px;height:8px;border-radius:50%;background:var(--green)"></span>
    </div>
  `;
}

function _mobSetInflChatTopbar() {
  const topbar = document.getElementById('mob-topbar');
  if (!topbar) return;
  if (!_mobTopbarOriginal) _mobTopbarOriginal = topbar.innerHTML;
  const arr = typeof MESSAGES_INFL !== 'undefined' ? MESSAGES_INFL : [];
  const partner = arr.find(m => m.convId === S.chatPartner);
  const partnerName = partner ? (typeof h === 'function' ? h(partner.name) : partner.name) : 'Chat';
  topbar.innerHTML = `
    <button class="icon-btn topbar-back" onclick="S.mobMsgView='list';mobInflPage('messages')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#ico-back"/></svg>
    </button>
    <span class="topbar-title">${partnerName}</span>
    <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
      <span style="width:8px;height:8px;border-radius:50%;background:var(--green)"></span>
    </div>
  `;
}

function _mobRestoreTopbar() {
  const topbar = document.getElementById('mob-topbar');
  if (!topbar || !_mobTopbarOriginal) return;
  topbar.innerHTML = _mobTopbarOriginal;
  _mobTopbarOriginal = null;
}

function mobInflPage(page) {
  const content = document.getElementById('mob-content');
  if (!content) return;
  if (typeof destroyCharts === 'function') destroyCharts();
  if (page !== 'messages' && typeof cleanupChatSub === 'function') cleanupChatSub();
  const renders = {
    dashboard: typeof renderMobInflDashboard !== 'undefined' ? renderMobInflDashboard : null,
    campaigns: typeof renderMobInflCampaigns !== 'undefined' ? renderMobInflCampaigns : null,
    discover:  typeof renderMobInflDiscover  !== 'undefined' ? renderMobInflDiscover  : null,
    messages:  typeof renderMobInflMessages  !== 'undefined' ? renderMobInflMessages  : null,
    analytics: typeof renderMobInflAnalytics !== 'undefined' ? renderMobInflAnalytics : null,
    wallet:    typeof renderMobInflWallet    !== 'undefined' ? renderMobInflWallet    : null,
    profile:          typeof renderMobInflProfile          !== 'undefined' ? renderMobInflProfile          : null,
    settings:         typeof renderMobInflSettings         !== 'undefined' ? renderMobInflSettings         : null,
    'brand-profile':  typeof renderMobInflBrandProfile     !== 'undefined' ? renderMobInflBrandProfile     : null,
  };
  content.innerHTML = _mobRender(renders, page);
  _mobInflPostRender(page);
}

function _mobInflPostRender(page) {
  if (page !== 'messages' && typeof _msgKbHandler === 'function')
    document.removeEventListener('keydown', _msgKbHandler);

  if (page === 'messages') {
    const content = document.getElementById('mob-content');
    if (content) content.style.overflow = S.mobMsgView === 'chat' ? 'hidden' : '';
    if (S.mobMsgView === 'chat') {
      _mobSetInflChatTopbar();
      const msgs = document.getElementById('chat-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      if (typeof subscribeChat === 'function' && S.chatPartner && APP.user?.id && !String(APP.user.id).startsWith('demo-')) {
        subscribeChat(S.chatPartner, 'infl');
      }
    } else {
      if (APP.user && typeof loadConversations === 'function') {
        loadConversations('infl').then(() => {
          if (S.mobInflPage === 'messages' && S.mobMsgView === 'list') {
            const c = document.getElementById('mob-content');
            if (c && typeof renderMobInflMessages === 'function') c.innerHTML = renderMobInflMessages();
          }
        });
      }
      if (typeof initChat === 'function') initChat('infl');
    }
  }

  if (page === 'analytics') {
    const period = S.mobAnalyticsPeriod || '30d';
    const earnings = Number(APP.profile?.total_earnings || 0);
    const periodLabels = {
      '7d':  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      '30d': ['W1','W2','W3','W4'],
      '90d': ['Jan','Feb','Mar'],
      '1y':  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    };
    const labels = periodLabels[period] || periodLabels['30d'];
    const n = labels.length;
    const seed = [.55,.72,.48,.91,.63,.80,.38,.68,.85,.44,.76,.59];
    const earningsData = labels.map((_, i) => Math.round(earnings * seed[i % seed.length] / n));
    const erData = labels.map((_, i) => parseFloat(((Number(APP.profile?.engagement_rate||4.2)) * seed[(i+2)%seed.length]).toFixed(2)));
    setTimeout(() => {
      if (document.getElementById('mob-infl-earnings') && typeof mkBar === 'function')
        mkBar('mob-infl-earnings', labels, [{label:'Earnings', data:earningsData,
          backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
      if (document.getElementById('mob-infl-reach') && typeof mkLine === 'function')
        mkLine('mob-infl-reach', labels, [{label:'ER %', data:erData,
          borderColor:BLUE, backgroundColor:BLUE_LIGHT, borderWidth:2, fill:true, tension:.4}]);
    }, 50);
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function mobSignOut() {
  closeMobSheet();
  await _sb.auth.signOut();
  sessionStorage.removeItem('ibbi_demo');
  sessionStorage.removeItem('ibbi_demo_role');
  window.location.href = 'login.html';
}

function toggleMobNotifs() {
  if (typeof toggleNotifs === 'function') toggleNotifs(S.role === 'business' ? 'biz' : 'infl');
}

// ── App init — Business ───────────────────────────────────────────────────────

async function initMobBizApp() {
  const demoRole = sessionStorage.getItem('ibbi_demo');
  if (demoRole === 'business') {
    S.role = 'business';
    APP.user = { id: 'demo-biz', email: 'demo@ibbi.sk' };
    APP.profile = { id: 0, user_id: 'demo-biz', company_name: 'IBBI Demo Co.', industry: 'Technology', rating: 4.8, website: null, description: null, about: null, logo_url: null };
    APP.profileId = 0;
    APP.bizWallet = { id: 0, balance: 1500 };
    APP.bizTransactions = [];
    renderMobShell('biz');
    const startPage = S.mobBizPage || 'dashboard';
    mobBizPage(startPage);
    _mobSetActiveTab(startPage);
    _mobSetTitle(startPage);
    return;
  }
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  S.role = 'business';
  APP.user = session.user;
  await loadUserData(session.user, 'business');
  renderMobShell('biz');
  const startPage = S.mobBizPage || 'dashboard';
  mobBizPage(startPage);
  _mobSetActiveTab(startPage);
  _mobSetTitle(startPage);
  if (typeof subscribeNotifications === 'function') subscribeNotifications('biz');
}

// ── App init — Influencer ─────────────────────────────────────────────────────

async function initMobInflApp() {
  const demoRole = sessionStorage.getItem('ibbi_demo');
  if (demoRole === 'influencer') {
    S.role = 'influencer';
    APP.user = { id: 'demo-infl', email: 'demo-infl@ibbi.sk' };
    APP.profile = { id: 0, user_id: 'demo-infl', full_name: 'Demo Influencer', name: 'Demo Influencer', username: 'demo', handle: '@demo', niche: 'Lifestyle', rating: 4.7, bio: null, country: null, platforms: ['ig', 'tt'], follower_count: 50000, engagement_rate: 4.2, price_range: '€200-500', logo_url: null };
    APP.profileId = 0;
    APP.wallet = { id: 0, balance: 250 };
    APP.walletTransactions = [];
    APP.paymentInfo = null;
    renderMobShell('infl');
    const startPage = S.mobInflPage || 'dashboard';
    mobInflPage(startPage);
    _mobSetActiveTab(startPage);
    _mobSetTitle(startPage);
    return;
  }
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  S.role = 'influencer';
  APP.user = session.user;
  await loadUserData(session.user, 'influencer');
  renderMobShell('infl');
  const startPage = S.mobInflPage || 'dashboard';
  mobInflPage(startPage);
  _mobSetActiveTab(startPage);
  _mobSetTitle(startPage);
  if (typeof subscribeNotifications === 'function') subscribeNotifications('infl');
}

// ── Auto-start IIFE ───────────────────────────────────────────────────────────
// Detects which role to init from sessionStorage demo flag or Supabase session.

(async function _mobAutoStart() {
  // Demo session
  const demoRole = sessionStorage.getItem('ibbi_demo');
  if (demoRole === 'business') { initMobBizApp(); return; }
  if (demoRole === 'influencer') { initMobInflApp(); return; }

  // Real Supabase session
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }

  // Detect role from profile tables
  const [bizRes, inflRes] = await Promise.all([
    _sb.from('business_profiles').select('id').eq('user_id', session.user.id).maybeSingle(),
    _sb.from('influencer_profiles').select('id').eq('user_id', session.user.id).maybeSingle(),
  ]);

  // Prefer the role that matches the current HTML file
  const isBizPage = location.pathname.includes('business-mobile');
  const isInflPage = location.pathname.includes('influencer-mobile');

  if (isBizPage && bizRes.data) { initMobBizApp(); return; }
  if (isInflPage && inflRes.data) { initMobInflApp(); return; }

  // Fallback: use whichever profile exists
  if (bizRes.data) { initMobBizApp(); return; }
  if (inflRes.data) { initMobInflApp(); return; }

  // No profile found — send to login
  window.location.href = 'login.html';
})();
