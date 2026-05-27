// ── Smart top-level router ─────────────────────────────────────────────────────
// Shows a section locally if on the same page, otherwise navigates cross-page.
function go(dest) {
  const pageIds = {
    'landing':                'page-landing',
    'for-influencers':        'page-for-influencers',
    'for-businesses':         'page-for-businesses',
    'about-us':               'page-about-us',
    'signup-role':            'page-signup-role',
    'influencer-signup':      'page-influencer-signup',
    'business-signup':        'page-business-signup',
    'influencer-verification':'page-influencer-verification',
    'login':                  'page-login',
  };
  const elId = pageIds[dest];
  if (elId && document.getElementById(elId)) {
    document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(elId).classList.remove('hidden');
    if (location.hash.slice(1) !== dest) history.pushState({ dest }, '', '#' + dest);
    window.scrollTo(0, 0);
    return;
  }
  const urlMap = {
    'landing':                'index.html',
    'for-influencers':        'index.html#for-influencers',
    'for-businesses':         'index.html#for-businesses',
    'about-us':               'index.html#about-us',
    'login':                  'login.html',
    'signup-role':            'register.html',
    'influencer-signup':      'register.html#influencer-signup',
    'business-signup':        'register.html#business-signup',
    'influencer-verification':'register.html#influencer-verification',
    'app-business':           'business.html',
    'app-influencer':         'influencer.html',
    'admin':                  'index.html',
  };
  const url = urlMap[dest];
  if (url) window.location.href = url;
}

// ── Login tab switcher ────────────────────────────────────────────────────────
function switchLoginTab(tab) {
  S.loginTab = tab;
  const biz  = document.getElementById('login-tab-biz');
  const infl = document.getElementById('login-tab-infl');
  if (!biz || !infl) return;
  const active   = 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;background:white;color:var(--blue);box-shadow:0 2px 8px rgba(0,0,0,.08)';
  const inactive = 'flex:1;padding:8px;border:none;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;background:transparent;color:var(--text-mid)';
  biz.style.cssText  = tab === 'biz'  ? active : inactive;
  infl.style.cssText = tab === 'infl' ? active : inactive;
}

// ── Business sub-page router ──────────────────────────────────────────────────
function bizPage(page, fromPopstate = false) {
  S.bizPage = page;
  if (!fromPopstate && location.hash.slice(1) !== page) {
    history.pushState({ page, role: 'biz' }, '', '#' + page);
  }
  document.querySelectorAll('[id^="biz-nav-"]').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('biz-nav-' + page);
  if (navEl) navEl.classList.add('active');
  const titles = {
    dashboard: 'Dashboard', campaigns: 'My Campaigns', discover: 'Discover Influencers',
    messages: 'Messages',   analytics: 'Analytics',    wallet: 'Wallet',
    profile: 'My Profile',  settings: 'Settings',
  };
  const titleEl = document.getElementById('biz-page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;
  const content = document.getElementById('biz-content');
  if (!content) return;
  destroyCharts();
  const renders = {
    dashboard: renderBizDashboard, campaigns: renderBizCampaigns,
    discover:  renderBizDiscover,  messages:  renderBizMessages,
    analytics: renderBizAnalytics, wallet:    renderBizWallet,
    profile:   renderBizProfile,   settings:  renderBizSettings,
  };
  const fn = renders[page];
  if (fn) { content.innerHTML = fn(); postRender(page, 'biz'); }
}

// ── Influencer sub-page router ────────────────────────────────────────────────
function inflPage(page, fromPopstate = false) {
  S.inflPage = page;
  if (!fromPopstate && location.hash.slice(1) !== page) {
    history.pushState({ page, role: 'infl' }, '', '#' + page);
  }
  document.querySelectorAll('[id^="infl-nav-"]').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('infl-nav-' + page);
  if (navEl) navEl.classList.add('active');
  const titles = {
    dashboard: 'Dashboard', campaigns: 'Campaigns',      discover: 'Discover Brands',
    messages:  'Messages',  analytics: 'Analytics',      wallet:   'Wallet',
    profile:   'My Profile', settings: 'Settings',
  };
  const titleEl = document.getElementById('infl-page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;
  const content = document.getElementById('infl-content');
  if (!content) return;
  destroyCharts();
  const renders = {
    dashboard: renderInflDashboard, campaigns: renderInflCampaigns,
    discover:  renderInflDiscover,  messages:  renderInflMessages,
    analytics: renderInflAnalytics, wallet:    renderInflWallet,
    profile:   renderInflProfile,   settings:  renderInflSettings,
  };
  const fn = renders[page];
  if (fn) { content.innerHTML = fn(); postRender(page, 'infl'); }
}

// ── Chart cleanup ─────────────────────────────────────────────────────────────
function destroyCharts() {
  Object.values(S.charts).forEach(c => { try { c.destroy(); } catch (e) {} });
  S.charts = {};
}

// ── Post-render hooks ─────────────────────────────────────────────────────────
function postRender(page, role) {
  if (page === 'analytics') {
    if (role === 'biz') initBizCharts();
    else initInflCharts();
  }
  if (page === 'wallet') {
    if (role === 'biz') setTimeout(() => { try { initBizWalletCharts(); } catch (e) {} }, 50);
    else setTimeout(() => { try { initInflWalletCharts(); } catch (e) {} }, 50);
  }
  if (page === 'messages') {
    initChat(role);
    if (APP.user) loadConversations(role);
  }
}

// ── Page initializers (called from each HTML file) ────────────────────────────

function initPublic() {
  const sections = {
    'landing':         'page-landing',
    'for-influencers': 'page-for-influencers',
    'for-businesses':  'page-for-businesses',
    'about-us':        'page-about-us',
  };
  const showSection = (hash) => {
    document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('hidden'));
    const el = document.getElementById(sections[hash] || 'page-landing');
    if (el) el.classList.remove('hidden');
    window.scrollTo(0, 0);
  };
  showSection(location.hash.slice(1) || 'landing');
  window.addEventListener('popstate', () => showSection(location.hash.slice(1) || 'landing'));
}

function initRegister() {
  const validSteps = ['signup-role', 'influencer-signup', 'business-signup', 'influencer-verification'];
  const hash = location.hash.slice(1);
  go(validSteps.includes(hash) ? hash : 'signup-role');
  window.addEventListener('popstate', () => {
    const h = location.hash.slice(1);
    go(validSteps.includes(h) ? h : 'signup-role');
  });
}

async function initBizApp() {
  const demoRole = sessionStorage.getItem('ibbi_demo');
  if (demoRole === 'business') {
    S.role = 'business';
    _setupBizHashRouter();
    return;
  }
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  S.role = 'business';
  APP.user = session.user;
  await loadUserData(session.user, 'business');
  updateTopbar();
  subscribeNotifications('biz');
  _setupBizHashRouter();
  _handleStripeReturn();
}

async function initInflApp() {
  const demoRole = sessionStorage.getItem('ibbi_demo');
  if (demoRole === 'influencer') {
    S.role = 'influencer';
    _setupInflHashRouter();
    return;
  }
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  S.role = 'influencer';
  APP.user = session.user;
  await loadUserData(session.user, 'influencer');
  updateTopbar();
  subscribeNotifications('infl');
  _setupInflHashRouter();
}

function _setupBizHashRouter() {
  const page = location.hash.slice(1) || 'dashboard';
  bizPage(page, true);
  window.addEventListener('popstate', e => bizPage(e.state?.page || location.hash.slice(1) || 'dashboard', true));
}

function _setupInflHashRouter() {
  const page = location.hash.slice(1) || 'dashboard';
  inflPage(page, true);
  window.addEventListener('popstate', e => inflPage(e.state?.page || location.hash.slice(1) || 'dashboard', true));
}

function _handleStripeReturn() {
  const params = new URLSearchParams(location.search);
  if (params.get('payment') === 'success') {
    const amount = params.get('amount');
    toast(`€${amount} added to your wallet!`, 'success');
    history.replaceState({}, '', location.pathname + location.hash);
    setTimeout(() => loadUserData(APP.user, 'business').then(() => bizPage('wallet')), 800);
  } else if (params.get('payment') === 'cancel') {
    toast('Payment cancelled.', 'error');
    history.replaceState({}, '', location.pathname + location.hash);
  }
}
