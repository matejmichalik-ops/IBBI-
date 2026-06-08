// ── Login ────────────────────────────────────────────────────────────────────
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { toast(t('err-email-password'), 'error'); return; }
  const btn = document.querySelector('#page-login .btn-primary');
  btn.textContent = t('btn-signing-in'); btn.disabled = true;
  APP._loggingIn = true;
  const { data, error } = await _sb.auth.signInWithPassword({ email, password: pass });
  APP._loggingIn = false;
  btn.textContent = t('login-btn'); btn.disabled = false;
  if (error) {
    const msg = error.message.toLowerCase().includes('email not confirmed')
      ? t('err-confirm-email')
      : error.message;
    toast(msg, 'error'); return;
  }
  const uid = data.user.id;
  const [bizRes, inflRes] = await Promise.all([
    _sb.from('business_profiles').select('id').eq('user_id', uid).maybeSingle(),
    _sb.from('influencer_profiles').select('id').eq('user_id', uid).maybeSingle(),
  ]);
  const hasBiz = !!bizRes.data, hasInfl = !!inflRes.data;
  if (hasBiz && hasInfl) { APP.user = data.user; showRolePicker(); return; }
  const tabRole = S.loginTab === 'biz' ? 'business' : 'influencer';
  const role = hasBiz ? 'business' : hasInfl ? 'influencer' : tabRole;
  enterApp(role);
}

// ── Influencer sign-up ────────────────────────────────────────────────────────
async function doInflSignup() {
  const first = document.getElementById('infl-first').value.trim();
  const last  = document.getElementById('infl-last').value.trim();
  const user  = document.getElementById('infl-username').value.trim().replace(/^@/, '');
  const email = document.getElementById('infl-email').value.trim();
  const pass  = document.getElementById('infl-pass').value;
  const niche = document.getElementById('infl-niche').value;
  const err   = document.getElementById('infl-signup-err');
  const btn   = document.getElementById('infl-signup-btn');
  err.style.display = 'none';
  if (!first || !last || !user || !email || !pass || !niche) {
    err.textContent = t('err-fill-fields'); err.style.display = 'block'; return;
  }
  if (pass.length < 8) {
    err.textContent = t('err-pwd-length'); err.style.display = 'block'; return;
  }
  btn.textContent = t('btn-creating-acc'); btn.disabled = true;

  if (APP.user) {
    const { data: existing } = await _sb.from('influencer_profiles').select('id').eq('user_id', APP.user.id).maybeSingle();
    if (existing) {
      err.textContent = t('err-acct-exists-infl'); err.style.display = 'block';
      btn.textContent = t('infl-signup-btn-lbl'); btn.disabled = false; return;
    }
    S.pendingInfl = { userId: APP.user.id, fullName: `${first} ${last}`, username: user, niche, email: APP.user.email };
    btn.textContent = t('infl-signup-btn-lbl'); btn.disabled = false;
    go('influencer-verification'); return;
  }

  S.pendingInfl = { fullName: `${first} ${last}`, username: user, niche, email };
  const { data, error } = await _sb.auth.signUp({
    email, password: pass,
    options: { data: { role: 'influencer', full_name: `${first} ${last}`, username: user, niche } }
  });
  if (error || !data.user || data.user.identities?.length === 0) {
    S.pendingInfl = null;
    btn.textContent = t('infl-signup-btn-lbl'); btn.disabled = false;
    err.textContent = error?.message || t('err-acct-exists-infl'); err.style.display = 'block'; return;
  }
  S.pendingInfl.userId = data.user.id;
  btn.textContent = t('infl-signup-btn-lbl'); btn.disabled = false;
  go('influencer-verification');
}

// ── Business sign-up ──────────────────────────────────────────────────────────
async function doBizSignup() {
  const company  = document.getElementById('biz-company').value.trim();
  const industry = document.getElementById('biz-industry').value;
  const email    = document.getElementById('biz-email').value.trim();
  const pass     = document.getElementById('biz-pass').value;
  const website  = document.getElementById('biz-website').value.trim();
  const terms    = document.getElementById('biz-terms').checked;
  const err      = document.getElementById('biz-signup-err');
  const btn      = document.getElementById('biz-signup-btn');
  err.style.display = 'none';
  if (!company || !industry || !email || !pass) {
    err.textContent = t('err-fill-required'); err.style.display = 'block'; return;
  }
  if (!terms) { err.textContent = t('err-accept-terms'); err.style.display = 'block'; return; }
  if (pass.length < 8) { err.textContent = t('err-pwd-length'); err.style.display = 'block'; return; }
  btn.textContent = t('btn-creating-acc'); btn.disabled = true;

  if (APP.user) {
    const { data: existing } = await _sb.from('business_profiles').select('id').eq('user_id', APP.user.id).maybeSingle();
    if (existing) {
      err.textContent = t('err-acct-exists-biz'); err.style.display = 'block';
      btn.textContent = t('biz-signup-btn-lbl'); btn.disabled = false; return;
    }
    await _sb.from('business_profiles').insert({ user_id: APP.user.id, company_name: company, industry, website: website || null, email: APP.user.email });
    btn.textContent = t('biz-signup-btn-lbl'); btn.disabled = false;
    sessionStorage.setItem('ibbi_new_user', '1');
    enterApp('business'); return;
  }

  APP._loggingIn = true;
  const { data, error } = await _sb.auth.signUp({
    email, password: pass,
    options: { data: { role: 'business', company_name: company, industry, website } }
  });
  if (error || !data.user || data.user.identities?.length === 0) {
    APP._loggingIn = false;
    btn.textContent = t('biz-signup-btn-lbl'); btn.disabled = false;
    err.textContent = error?.message || t('err-acct-exists-infl'); err.style.display = 'block'; return;
  }
  await _sb.from('business_profiles').insert({ user_id: data.user.id, company_name: company, industry, website: website || null, email });
  APP._loggingIn = false;
  btn.textContent = t('biz-signup-btn-lbl'); btn.disabled = false;
  sessionStorage.setItem('ibbi_new_user', '1');
  enterApp('business');
}

// ── Demo login (no auth) ──────────────────────────────────────────────────────
function demoLogin(role) {
  sessionStorage.setItem('ibbi_demo', role);
  window.location.href = role === 'business' ? 'business.html' : 'influencer.html';
}

// ── Role picker (dual-role users) ─────────────────────────────────────────────
function showRolePicker() {
  document.getElementById('role-picker-overlay')?.remove();
  const ov = document.createElement('div');
  ov.id = 'role-picker-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,62,.55);display:flex;align-items:center;justify-content:center;z-index:9999';
  ov.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:48px 40px;max-width:400px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.18)">
      <div style="width:56px;height:56px;border-radius:16px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        <svg width="28" height="28" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-profile"/></svg>
      </div>
      <h2 style="color:var(--navy);margin:0 0 8px;font-size:1.4rem">${t('role-pick-title')}</h2>
      <p style="color:var(--text-mid);font-size:.92rem;margin:0 0 32px">${t('role-pick-sub')}</p>
      <div style="display:flex;gap:12px">
        <button onclick="pickRole('business')" style="flex:1;padding:16px 12px;border-radius:14px;border:2px solid var(--blue);background:var(--blue-light);cursor:pointer;font-size:.95rem;font-weight:700;color:var(--blue)">🏢<br><span style="font-size:.82rem;font-weight:600">${t('role-business')}</span></button>
        <button onclick="pickRole('influencer')" style="flex:1;padding:16px 12px;border-radius:14px;border:2px solid var(--navy);background:var(--blue-soft);cursor:pointer;font-size:.95rem;font-weight:700;color:var(--navy)">⭐<br><span style="font-size:.82rem;font-weight:600">${t('role-influencer')}</span></button>
      </div>
    </div>`;
  document.body.appendChild(ov);
}

function pickRole(role) {
  document.getElementById('role-picker-overlay')?.remove();
  enterApp(role);
}

async function switchRole(role) {
  APP.profile = null; APP.profileId = null;
  enterApp(role);
}

// ── Enter app dashboard ───────────────────────────────────────────────────────
function enterApp(role) {
  S.role = role;
  sessionStorage.removeItem('ibbi_demo');
  window.location.href = role === 'business' ? 'business.html' : 'influencer.html';
}

// ── Sign out ──────────────────────────────────────────────────────────────────
async function doSignOut() {
  if (_notifChannel) { _sb.removeChannel(_notifChannel); _notifChannel = null; }
  NOTIFS = [];
  await _sb.auth.signOut();
  S.role = null;
  sessionStorage.removeItem('ibbi_demo');
  window.location.href = 'index.html';
}

// ── Profile save ──────────────────────────────────────────────────────────────
async function saveBizProfile() {
  const payload = {
    company_name: document.getElementById('set-company')?.value.trim(),
    industry:     document.getElementById('set-industry')?.value.trim(),
    website:      document.getElementById('set-website')?.value.trim() || null,
    country:      document.getElementById('bset-country')?.value || null,
    region:       document.getElementById('bset-region')?.value || null,
    city:         document.getElementById('bset-city')?.value || null,
    phone: (() => { const prefix = document.getElementById('set-phone-prefix')?.value||''; const num = document.getElementById('set-phone')?.value.trim()||''; return prefix && num ? prefix+' '+num : num||null; })(),
    about:        document.getElementById('set-about')?.value.trim() || null,
    description:  document.getElementById('set-about')?.value.trim() || null,
  };
  const errEl = document.getElementById('set-biz-err');
  if (!payload.company_name) { errEl.textContent = t('toast-company-req'); errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  if (APP.user) {
    const { error } = await _sb.from('business_profiles').update(payload).eq('user_id', APP.user.id);
    if (error) { errEl.textContent = error.message; errEl.style.display = 'block'; return; }
  }
  APP.profile = Object.assign(APP.profile || {}, payload);
  updateTopbar();
  toast(t('toast-profile-saved'), 'success');
}

async function saveInflProfile() {
  const first    = document.getElementById('iset-first')?.value.trim();
  const last     = document.getElementById('iset-last')?.value.trim();
  const username = document.getElementById('iset-username')?.value.trim().replace(/^@/, '');
  const niche    = document.getElementById('iset-niche')?.value.trim();
  const country  = document.getElementById('iset-country')?.value || '';
  const region   = document.getElementById('iset-region')?.value || '';
  const city     = document.getElementById('iset-city')?.value || '';
  const bio      = document.getElementById('iset-bio')?.value.trim() || null;
  const price    = document.getElementById('iset-price')?.value.trim() || null;
  const er       = parseFloat(document.getElementById('iset-er')?.value) || null;
  const followers = parseInt(document.getElementById('iset-followers')?.value) || null;
  const errEl    = document.getElementById('iset-err');
  if (!first || !username) { errEl.textContent = t('err-name-username'); errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  const payload = { full_name: `${first} ${last}`.trim(), name: `${first} ${last}`.trim(), username, handle: `@${username}`, niche, country: country || null, region: region || null, city: city || null, bio, price_range: price, engagement_rate: er, avg_engagement_rate: er, follower_count: followers };
  if (APP.user) {
    const { error } = await _sb.from('influencer_profiles').update(payload).eq('user_id', APP.user.id);
    if (error) { errEl.textContent = error.message; errEl.style.display = 'block'; return; }
  }
  APP.profile = Object.assign(APP.profile || {}, payload);
  updateTopbar();
  toast(t('toast-profile-saved'), 'success');
}

// ── Social platform verification (influencer signup) ─────────────────────────
let verifiedCount = 0;
function connectSocial(platform) {
  const el = document.getElementById('verify-' + platform);
  if (!el || S.connectedSocials.includes(platform)) return;
  S.connectedSocials.push(platform);
  el.style.borderColor = '#10b981';
  el.style.background = '#f0fdf4';
  el.querySelector('button').textContent = t('ver-connected-btn');
  el.querySelector('button').style.background = '#10b981';
  verifiedCount++;
  const msg = document.getElementById('verify-msg');
  const btn = document.getElementById('verify-continue');
  if (msg) msg.textContent = verifiedCount + ' platform' + (verifiedCount > 1 ? 's' : '') + ' connected ✓';
  if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}

async function finishInflSignup() {
  if (!S.connectedSocials?.length) { toast(t('err-connect-social'), 'error'); return; }
  const btn = document.getElementById('verify-continue');
  if (btn) { btn.textContent = t('btn-setting-up'); btn.disabled = true; }
  const { data: { user: authUser } } = await _sb.auth.getUser();
  const userId = authUser?.id || S.pendingInfl?.userId;
  if (!userId) { toast(t('err-session-expired'), 'error'); go('login'); return; }
  const p = S.pendingInfl || {};
  const fullName = p.fullName || authUser?.user_metadata?.full_name || 'Influencer';
  const uname = p.username || authUser?.user_metadata?.username || null;
  const { error } = await _sb.from('influencer_profiles').insert({
    user_id: userId,
    full_name: fullName, name: fullName,
    username: uname, handle: uname ? '@' + uname : null,
    niche: p.niche || authUser?.user_metadata?.niche || null,
    email: p.email || authUser?.email || null,
    platforms: S.connectedSocials?.length ? S.connectedSocials : null,
  });
  if (error && !error.message?.includes('duplicate')) {
    toast(t('err-create-profile') + error.message, 'error');
    if (btn) { btn.textContent = t('btn-complete-setup'); btn.disabled = false; }
    return;
  }
  S.pendingInfl = null;
  sessionStorage.setItem('ibbi_new_user', '1');
  enterApp('influencer');
}

// ── Auth state change (sign-out cleanup only) ─────────────────────────────────
_sb.auth.onAuthStateChange((_event, _session) => {
  if (_event === 'SIGNED_OUT') {
    S.role = null; APP.user = null; APP.profile = null; APP.profileId = null;
    sessionStorage.removeItem('ibbi_demo');
    window.location.href = 'index.html';
  }
});
