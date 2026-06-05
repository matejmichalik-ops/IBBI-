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
  const _bizNavAlias = { 'campaign-detail': 'campaigns' };
  const navEl = document.getElementById('biz-nav-' + (_bizNavAlias[page] || page));
  if (navEl) navEl.classList.add('active');
  const titles = {
    dashboard: t('nav-sidebar-dashboard'), campaigns: t('c-my-camps'), discover: t('dis-infls-title'),
    messages: t('nav-sidebar-messages'),   analytics: t('nav-sidebar-analytics'), wallet: t('nav-sidebar-wallet'),
    profile: t('nav-sidebar-profile'),     settings: t('nav-sidebar-settings'),   'campaign-detail': '',
  };
  const titleEl = document.getElementById('biz-page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;
  const content = document.getElementById('biz-content');
  if (!content) return;
  destroyCharts();
  if (page !== 'messages' && typeof cleanupChatSub === 'function') cleanupChatSub();
  const renders = {
    dashboard: renderBizDashboard, campaigns: renderBizCampaigns,
    discover:  renderBizDiscover,  messages:  renderBizMessages,
    analytics: renderBizAnalytics, wallet:    renderBizWallet,
    profile:   renderBizProfile,   settings:  renderBizSettings,
    'campaign-detail': renderBizCampaignDetail,
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
  const _navAlias = { 'brand-profile': 'discover' };
  const navEl = document.getElementById('infl-nav-' + (_navAlias[page] || page));
  if (navEl) navEl.classList.add('active');
  const titles = {
    dashboard: t('nav-sidebar-dashboard'), campaigns: t('nav-sidebar-campaigns'), discover: t('dis-brands-title'),
    messages: t('nav-sidebar-messages'),   analytics: t('nav-sidebar-analytics'), wallet: t('nav-sidebar-wallet'),
    profile: t('nav-sidebar-profile'),     settings: t('nav-sidebar-settings'),   'brand-profile': t('nav-sidebar-discover'),
  };
  const titleEl = document.getElementById('infl-page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;
  const content = document.getElementById('infl-content');
  if (!content) return;
  destroyCharts();
  if (page !== 'messages' && typeof cleanupChatSub === 'function') cleanupChatSub();
  const renders = {
    dashboard: renderInflDashboard, campaigns: renderInflCampaigns,
    discover:  renderInflDiscover,  messages:  renderInflMessages,
    analytics: renderInflAnalytics, wallet:    renderInflWallet,
    profile:   renderInflProfile,   settings:  renderInflSettings,
    'brand-profile': renderInflBrandProfile,
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
    setTimeout(() => {
      try {
        if (role === 'biz') initBizCharts();
        else initInflCharts();
      } catch(e) {}
    }, 50);
  }
  if (page === 'wallet') {
    if (role === 'biz') setTimeout(() => { try { initBizWalletCharts(); } catch (e) {} }, 50);
    else setTimeout(() => { try { initInflWalletCharts(); } catch (e) {} }, 50);
  }
  if (page === 'messages') {
    initChat(role);
    if (APP.user) loadConversations(role);
  } else {
    if (typeof _msgKbHandler === 'function')
      document.removeEventListener('keydown', _msgKbHandler);
  }
  if (page === 'campaign-detail') {
    setTimeout(() => { try { _initCampDetailCharts(); } catch(e) {} }, 50);
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
    APP.user = { id: 'demo-biz', email: 'demo@ibbi.sk' };
    APP.profile = { id: 0, user_id: 'demo-biz', company_name: 'IBBI Demo Co.', industry: 'Technology', rating: 4.8, website: null, description: null, about: null, logo_url: null };
    APP.profileId = 0;
    APP.bizWallet = { id: 0, balance: 1500 };
    APP.bizTransactions = [];
    updateTopbar();
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
  if (sessionStorage.getItem('ibbi_new_user')) {
    sessionStorage.removeItem('ibbi_new_user');
    setTimeout(() => _showOnboardingPopup(), 800);
  }
}

async function initInflApp() {
  const demoRole = sessionStorage.getItem('ibbi_demo');
  if (demoRole === 'influencer') {
    S.role = 'influencer';
    APP.user = { id: 'demo-infl', email: 'demo-infl@ibbi.sk' };
    APP.profile = { id: 0, user_id: 'demo-infl', full_name: 'Demo Influencer', name: 'Demo Influencer', username: 'demo', handle: '@demo', niche: 'Lifestyle', rating: 4.7, bio: null, country: null, platforms: ['ig', 'tt'], follower_count: 50000, engagement_rate: 4.2, price_range: '€200-500', logo_url: null };
    APP.profileId = 0;
    APP.wallet = { id: 0, balance: 250 };
    APP.walletTransactions = [];
    APP.paymentInfo = null;
    updateTopbar();
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
  if (sessionStorage.getItem('ibbi_new_user')) {
    sessionStorage.removeItem('ibbi_new_user');
    setTimeout(() => _showOnboardingPopup(), 800);
  }
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
    toast(t('wallet-topup-success').replace('{amount}', amount), 'success');
    history.replaceState({}, '', location.pathname + location.hash);
    setTimeout(() => loadUserData(APP.user, 'business').then(() => bizPage('wallet')), 800);
  } else if (params.get('payment') === 'cancel') {
    toast(t('wallet-topup-cancelled'), 'error');
    history.replaceState({}, '', location.pathname + location.hash);
  } else if (params.get('sub') === 'success') {
    history.replaceState({}, '', location.pathname + location.hash);
    _reloadBizSubscription().then(() => {
      updateTopbar();
      toast(t('sub-success-toast'), 'success');
      bizPage('settings');
    });
  } else if (params.get('sub') === 'cancel') {
    history.replaceState({}, '', location.pathname + location.hash);
    toast(t('sub-cancel-url-toast'), 'info');
  }
}

async function _reloadBizSubscription() {
  if (!APP.profileId) return;
  const { data } = await _sb
    .from('business_subscriptions')
    .select('id, status, plan_name, plan_price, current_period_end, stripe_subscription_id, interval, stripe_last4')
    .eq('business_id', APP.profileId)
    .in('status', ['active', 'canceling', 'past_due'])
    .maybeSingle();
  APP.bizSubscription = data || null;
}

function _showOnboardingPopup() {
  const isBiz = S.role === 'business';
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,62,.5);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:40px;max-width:460px;width:100%;box-shadow:0 24px 64px rgba(13,27,62,.2);text-align:center;position:relative">
      <div style="font-size:2.5rem;margin-bottom:12px">🎉</div>
      <h2 style="color:var(--navy);margin:0 0 8px;font-size:1.4rem">${t('onboard-title') || 'Vitaj v ibbi!'}</h2>
      <p style="color:var(--text-mid);margin:0 0 24px;font-size:.95rem;line-height:1.6">${isBiz ? (t('onboard-biz-desc') || 'Odporúčame ti donastaviť profil firmy — pridaj logo, popis a webstránku. Influenceri uvidia tvoj profil pred prihlásením do kampane.') : (t('onboard-infl-desc') || 'Odporúčame ti donastaviť profil — pridaj fotku, bio a prepoj sociálne siete. Firmy si ťa ľahšie nájdu v Discover.')}</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button onclick="document.getElementById('onboarding-popup').remove();${isBiz ? "bizPage('profile')" : "inflPage('profile')"}" style="padding:13px;background:var(--blue);color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-size:.95rem;font-family:inherit">✏️ ${t('onboard-setup-btn') || 'Nastaviť profil teraz'}</button>
        <button onclick="document.getElementById('onboarding-popup').remove()" style="padding:11px;background:none;border:1.5px solid var(--border);border-radius:12px;font-weight:600;cursor:pointer;font-size:.88rem;color:var(--text-mid);font-family:inherit">${t('onboard-skip-btn') || 'Preskočiť zatiaľ'}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
