// ── Supabase client ──────────────────────────────────────────────────────────
const _sb = window.supabase.createClient(
  'https://wslebuitlslqbipmctip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbGVidWl0bHNscWJpcG1jdGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTQ0OTEsImV4cCI6MjA5NDc5MDQ5MX0.MqS_3lcYuHzW3frTdf9kHkxzQQYu4r9a-n1UTnOFdd0'
);

// ── Stripe / Payments ────────────────────────────────────────────────────────
const STRIPE_PK = 'pk_test_51TZBcsV051r3HhJOAVBJDNm1rJ4Fm2d0NTsKBK5YucQRO7APej6ro4MXaWDtKWjlibKBGwtEK59oCTm1MndTkW1D00uHpHDCgh';
const FN_URL = 'https://wslebuitlslqbipmctip.supabase.co/functions/v1';

// ── Global app data (populated from Supabase after login) ───────────────────
const APP = {
  user: null,
  profile: null,
  profileId: null,
  wallet: null,
  walletTransactions: [],
  brands: [],
  bizWallet: null,
  bizTransactions: [],
  bizSubscription: null,
  paymentInfo: null,
  _platformStats: null,
};

// ── Utility helpers ──────────────────────────────────────────────────────────
function h(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function fmtFollowers(n) {
  if (!n) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

// ── Load user data from Supabase after login ────────────────────────────────
async function loadUserData(user, roleOverride) {
  APP.user = user;
  const role = roleOverride || user.user_metadata?.role;
  if (!role) return;

  BIZ_CAMPAIGNS = []; INFL_CAMPAIGNS = []; INFLUENCERS = [];
  BIZ_TRANSACTIONS = []; INFL_TRANSACTIONS = [];
  APP.brands = []; APP._bizReviews = [];

  function inflName(i) { return i.full_name || i.name || i.username || i.handle || 'Unknown'; }
  function inflHandle(i) { return i.username || i.handle ? `@${i.username || i.handle}` : '—'; }
  function inflER(i) { return i.engagement_rate || i.avg_engagement_rate; }

  if (role === 'business') {
    let { data: profile } = await _sb.from('business_profiles').select('*').eq('user_id', user.id).single();
    if (!profile) { go('business-signup'); return; }
    APP.profile = profile;
    APP.profileId = profile?.id;

    const { data: uData } = await _sb.from('users').select('is_admin').eq('id', user.id).single();
    if (uData?.is_admin) {
      APP.profile._isAdmin = true;
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    }

    if (profile?.id) {
      const { data: camps } = await _sb
        .from('campaigns')
        .select('*, campaign_applications(count)')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });
      BIZ_CAMPAIGNS = camps ? camps.map(c => ({
        id: c.id, name: c.name,
        type: c.type || c.campaign_type, status: c.status,
        budget: `€${Number(c.budget || 0).toLocaleString()}`,
        spent: `€${Number(c.spent || 0).toLocaleString()}`,
        apps: c.campaign_applications?.[0]?.count || 0,
        accepted: c.accepted_count || 0,
        reach: c.total_reach ? fmtFollowers(c.total_reach) : '—',
        conversions: c.conversions || 0,
        brief: c.brief || c.requirements || c.description,
        deadline: c.deadline, niche: c.niche, _raw: c,
      })) : [];
    }

    if (profile?.id) {
      const { data: bw } = await _sb.from('biz_wallets').select('*').eq('business_id', profile.id).single();
      if (bw) {
        APP.bizWallet = bw;
        const { data: btxns } = await _sb.from('biz_wallet_transactions')
          .select('*').eq('biz_wallet_id', bw.id).order('created_at', { ascending: false }).limit(50);
        BIZ_TRANSACTIONS = btxns ? btxns.map(tx => ({
          date: tx.created_at?.slice(0, 10) || '—',
          desc: tx.description || (tx.type === 'topup' ? t('txn-topup') : tx.type === 'campaign_fund' ? t('txn-camp-fund') : t('txn-transaction')),
          amount: (tx.type === 'topup' || tx.type === 'refund' ? '+' : '-') + `€${Number(tx.amount).toLocaleString()}`,
          type: (tx.type === 'topup' || tx.type === 'refund') ? 'credit' : 'debit',
        })) : [];
      } else {
        await _sb.from('biz_wallets').upsert({ business_id: profile.id, balance: 0, total_spent: 0, total_topup: 0 }, { onConflict: 'business_id', ignoreDuplicates: true });
        APP.bizWallet = { balance: 0, total_spent: 0, total_topup: 0 };
      }
    }

    const { data: infls } = await _sb.from('influencer_profiles').select('*').order('rating', { ascending: false }).limit(30);
    INFLUENCERS = infls ? infls.map(i => ({
      id: i.id, name: inflName(i), handle: inflHandle(i),
      niche: i.niche || 'General', followers: fmtFollowers(i.follower_count),
      er: inflER(i) ? `${inflER(i)}%` : '—',
      avatar: inflName(i).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      verified: i.verified || false, platforms: i.platforms || [],
      rating: i.avg_rating || i.rating || 0, campaigns: i.campaign_count || 0,
      price: i.price_range || '—', userId: i.user_id, _raw: i,
      avatar_url: i.avatar_url || null,
      banner_url: i.banner_url || null,
    })) : [];

    const { data: revs } = await _sb.from('reviews').select('stars, comment, reviewer_id')
      .eq('reviewed_id', user.id).order('created_at', { ascending: false }).limit(10);
    if (revs?.length) {
      const reviewerIds = [...new Set(revs.map(r => r.reviewer_id))];
      const { data: inflProfiles } = await _sb.from('influencer_profiles')
        .select('user_id, full_name, name, username').in('user_id', reviewerIds);
      const inflByUserId = {};
      (inflProfiles || []).forEach(i => { inflByUserId[i.user_id] = i.full_name || i.name || i.username || 'Influencer'; });
      APP._bizReviews = revs.map(r => ({ name: inflByUserId[r.reviewer_id] || 'Anonymous', stars: r.stars, text: r.comment || '' }));
    } else {
      APP._bizReviews = [];
    }

    if (profile?.id) {
      const { data: sub } = await _sb
        .from('business_subscriptions')
        .select('id, status, plan_name, plan_price, current_period_end, stripe_subscription_id, interval, stripe_last4')
        .eq('business_id', profile.id)
        .in('status', ['active', 'canceling', 'past_due'])
        .maybeSingle();
      APP.bizSubscription = sub || null;
    }

    const { data: inflCheck } = await _sb.from('influencer_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (inflCheck) { const btn = document.getElementById('biz-switch-role-btn'); if (btn) btn.style.display = ''; }

  } else if (role === 'influencer') {
    let { data: profile } = await _sb.from('influencer_profiles').select('*').eq('user_id', user.id).single();
    if (!profile) { go('influencer-verification'); return; }
    APP.profile = profile;
    APP.profileId = profile?.id;

    const { data: payInfo } = await _sb.from('influencer_payment_info').select('iban,iban_name').eq('influencer_id', profile.id).maybeSingle();
    APP.paymentInfo = payInfo || null;

    const { data: uDataInfl } = await _sb.from('users').select('is_admin').eq('id', user.id).single();
    if (uDataInfl?.is_admin) {
      APP.profile._isAdmin = true;
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    }

    const { data: camps } = await _sb
      .from('campaigns')
      .select('*, business_profiles(company_name, id), campaign_applications!left(id,status,influencer_id)')
      .eq('status', 'active').order('created_at', { ascending: false });
    INFL_CAMPAIGNS = camps ? camps.map(c => ({
      id: c.id, name: c.name,
      brand: c.business_profiles?.company_name || 'Unknown',
      brandId: c.business_profiles?.id,
      type: c.type || c.campaign_type, status: c.status,
      reward: c.commission_rate ? `${c.commission_rate}% commission` : (c.reward_amount ? `€${c.reward_amount}` : c.barter_description || 'TBD'),
      deadline: c.deadline?.slice(0, 10) || '—',
      applied: (c.campaign_applications || []).some(a => a.influencer_id === profile?.id),
      applicationId: (c.campaign_applications || []).find(a => a.influencer_id === profile?.id)?.id || null,
      _raw: c,
    })) : [];

    if (profile?.id) {
      const { data: walletData } = await _sb.from('wallets').select('*').eq('influencer_id', profile.id).single();
      if (walletData) {
        APP.wallet = walletData;
        const { data: txns } = await _sb.from('wallet_transactions')
          .select('*').eq('wallet_id', walletData.id).order('created_at', { ascending: false }).limit(50);
        INFL_TRANSACTIONS = txns ? txns.map(tx => ({
          date: tx.created_at?.slice(0, 10) || '—',
          desc: tx.description || (tx.type === 'earning' ? t('txn-earnings') : tx.type === 'withdrawal' ? t('txn-withdrawal') : t('txn-transaction')),
          amount: (tx.type === 'withdrawal' ? '-' : '+') + `€${Number(tx.amount).toLocaleString()}`,
          type: tx.type === 'withdrawal' ? 'debit' : 'credit',
        })) : [];
      } else {
        await _sb.from('wallets').upsert({ influencer_id: profile.id, balance: 0, pending: 0, total_earned: 0, total_withdrawn: 0 }, { onConflict: 'influencer_id' });
        APP.wallet = { balance: 0, pending: 0, total_earned: 0, total_withdrawn: 0 };
      }
    }

    const campsByBrand = {};
    INFL_CAMPAIGNS.forEach(c => { if (c.brandId) campsByBrand[c.brandId] = (campsByBrand[c.brandId] || 0) + 1; });
    const { data: biz } = await _sb.from('business_profiles')
      .select('id, company_name, industry, rating, avg_rating, verified, logo_url, banner_url')
      .order('avg_rating', { ascending: false }).limit(30);
    APP.brands = biz ? biz.map(b => ({
      id: b.id, name: b.company_name || 'Unknown',
      industry: b.industry || 'General', campaigns: campsByBrand[b.id] || 0,
      verified: b.verified || false, rating: b.avg_rating || b.rating || 0,
      logo_url: b.logo_url || null,
      banner_url: b.banner_url || null,
    })) : [];

    const { data: bizCheck } = await _sb.from('business_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (bizCheck) { const btn = document.getElementById('infl-switch-role-btn'); if (btn) btn.style.display = ''; }

    if (profile?.id) {
      const { data: psData } = await _sb.from('platform_stats').select('*').eq('influencer_id', profile.id);
      APP._platformStats = psData || [];
    }
  }

  await loadNotifications();
  subscribeNotifications();
  refreshCurrentPage();
}

function refreshCurrentPage() {
  updateTopbar();
  if (S.role === 'business') bizPage(S.bizPage);
  else if (S.role === 'influencer') inflPage(S.inflPage);
}

function updateTopbar() {
  const setAv = (el, url, initials) => {
    if (!el) return;
    if (url) el.innerHTML = `<img src="${url}?t=${Date.now()}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
    else el.textContent = initials;
  };
  if (S.role === 'business') {
    const pd = renderBizProfileData();
    const initials = pd.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    setAv(document.getElementById('biz-topbar-avatar'), APP.profile?.avatar_url, initials);
    const nm = document.getElementById('biz-topbar-name');
    if (nm) nm.textContent = pd.name;
    const getProBtn = document.getElementById('biz-get-pro-btn');
    const proBadge = document.getElementById('biz-pro-badge');
    const isPro = APP.bizSubscription != null;
    if (getProBtn) getProBtn.style.display = isPro ? 'none' : '';
    if (proBadge) proBadge.style.display = isPro ? '' : 'none';
  } else if (S.role === 'influencer') {
    const pd = renderInflProfileData();
    const initials = (pd.handle || pd.name || '?').replace(/^@/, '').slice(0, 2).toUpperCase();
    setAv(document.getElementById('infl-topbar-avatar'), APP.profile?.avatar_url, initials);
    const nm = document.getElementById('infl-topbar-name');
    if (nm) nm.textContent = pd.handle || pd.name;
  }
}

// ── Live platform metrics (stats strip) ──────────────────────────────────────
async function loadPlatformMetrics() {
  try {
    const fmt = n => Number(n) >= 1000000
      ? (Number(n) / 1000000).toFixed(1).replace('.0', '') + 'M'
      : Number(n).toLocaleString('sk-SK');
    const el = id => document.getElementById(id);
    const [inflRes, bizRes, collabRes, payoutRes] = await Promise.all([
      _sb.from('influencer_profiles').select('*', { count: 'exact', head: true }),
      _sb.from('business_profiles').select('*', { count: 'exact', head: true }),
      _sb.from('campaign_applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
      _sb.from('wise_payouts').select('amount').eq('status', 'completed'),
    ]);
    const paidOut = (payoutRes.data || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    if (el('m-views'))     el('m-views').textContent     = fmt(inflRes.count || 0);
    if (el('m-customers')) el('m-customers').textContent = fmt(bizRes.count || 0);
    if (el('m-collabs'))   el('m-collabs').textContent   = fmt(collabRes.count || 0);
    if (el('m-paid'))      el('m-paid').textContent      = '€' + fmt(paidOut);
  } catch (e) { /* keep fallback values */ }
}
