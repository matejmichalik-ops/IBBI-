// ── Brand Profile — influencer view after "View Campaigns" on a brand ────────

const _BP_TYPE_COLORS = { affiliate:'#10b981', fixed:'#2079FF', barter:'#f59e0b', hybrid:'#8b5cf6' };
const _BP_INDUSTRY_COLORS = { Fashion:'#1a1a1a', Fitness:'#10b981', Food:'#92400e', Gaming:'#7c3aed', Travel:'#2079FF', Beauty:'#db2777', Technology:'#2079FF', Tech:'#2079FF', 'Personal Care':'#db2777' };
const _BP_AVATAR_COLORS = ['#ff6b9d','#5b4ee5','#1aa971','#e89b1a','#2079FF','#7c3aed'];

function _bpTypeColor(type) { return _BP_TYPE_COLORS[(type||'').toLowerCase()] || 'var(--blue)'; }
function _bpBrandColor(industry) { return _BP_INDUSTRY_COLORS[industry] || 'var(--navy)'; }
function _bpInitials(name) { return (name||'?').split(/\s+/).map(n=>n[0]||'').join('').slice(0,2).toUpperCase() || '??'; }
function _bpColorFor(str) { return _BP_AVATAR_COLORS[Math.abs((str||'').charCodeAt(0)||0) % _BP_AVATAR_COLORS.length]; }
function _bpFmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('sk', {day:'numeric', month:'long', year:'numeric'}); }
  catch(e) { return iso || '—'; }
}
function _bpDaysUntil(iso) {
  if (!iso || iso === '—') return 999;
  return Math.max(0, Math.ceil((new Date(iso) - new Date()) / (1000*60*60*24)));
}
function _bpRelTime(iso) {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return t('rel-today');
  if (days < 7) return t('rel-days-ago').replace('{n}', days);
  if (days < 30) return t('rel-weeks-ago').replace('{n}', Math.floor(days/7));
  if (days < 365) return t('rel-months-ago').replace('{n}', Math.floor(days/30));
  return t('rel-years-ago').replace('{n}', Math.floor(days/365));
}
function _bpParseDeliverables(requirements) {
  if (!requirements) return '';
  const parts = {};
  String(requirements).split('|').forEach(s => { const [k,v] = s.split(':'); if (k && v !== undefined) parts[k.trim()] = v.trim(); });
  const items = [];
  if (parseInt(parts.reels) > 0) items.push(`${parts.reels} reels`);
  if (parseInt(parts.stories) > 0) items.push(`${parts.stories} stories`);
  if (parseInt(parts.posts) > 0) items.push(`${parts.posts} posts`);
  return items.join(' + ');
}

// ─ Data loading ───────────────────────────────────────────────────────────────

async function _loadBrandProfileAll(bizId, bizName) {
  if (!APP.user || !bizId) {
    // Demo mode
    S._brandCampaigns = INFL_CAMPAIGNS.filter(c => c.brand === bizName).map((c,i) => ({
      ...c, match: 70 + i*7, rewardSub: '', deliverables: '2 reels + 3 stories',
      niches: [c.brand], slots: { taken: i+1, total: 5 },
    }));
    S._brandProfileData = {
      brand: { company_name: bizName, industry: 'General', about: '', description: '', verified: false, rating: 0, rating_count: 0, website: '', country: '', email: '', id: bizId },
      pastCamps: [], reviews: [], creators: [],
    };
    return;
  }

  const [brandRes, activeRes, pastRes, reviewsRes] = await Promise.all([
    _sb.from('business_profiles').select('*').eq('id', bizId).single(),
    _sb.from('campaigns')
      .select('*, campaign_applications!left(id,status,influencer_id)')
      .eq('business_id', bizId).eq('status', 'active')
      .order('created_at', { ascending: false }),
    _sb.from('campaigns').select('*')
      .eq('business_id', bizId).eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(10),
    _sb.from('reviews')
      .select('id, stars, comment, created_at, reviewer_id')
      .eq('reviewed_id', bizId)
      .order('created_at', { ascending: false }).limit(10),
  ]);

  // Map active campaigns
  S._brandCampaigns = (activeRes.data || []).map(r => ({
    id: r.id, name: r.name || 'Untitled', brand: bizName, brandId: bizId,
    type: r.campaign_type || r.type || 'fixed', status: r.status,
    reward: r.reward_amount ? `€${Number(r.reward_amount).toLocaleString()}` : (r.commission_rate ? `${r.commission_rate}%` : '—'),
    rewardSub: r.commission_rate ? `${r.commission_rate}% z predaja` : (r.reward_amount ? t('c-fixed-label') : ''),
    deadline: r.deadline || '—',
    applied: !!(r.campaign_applications||[]).find(a => a.influencer_id === APP.profileId && a.status !== 'rejected'),
    match: 65 + Math.floor(Math.random() * 30),
    deliverables: _bpParseDeliverables(r.requirements),
    niches: r.niche ? r.niche.split(',').map(n => n.trim()) : [],
    slots: { taken: r.accepted_count||0, total: Math.max((r.accepted_count||0) + 3, 5) },
    _raw: r,
  }));

  // Fetch reviewer names
  let reviewerMap = {};
  const revIds = (reviewsRes.data||[]).map(r=>r.reviewer_id).filter(Boolean);
  if (revIds.length) {
    const { data: revs } = await _sb.from('influencer_profiles')
      .select('id, full_name, username, handle').in('id', revIds);
    (revs||[]).forEach(r => { reviewerMap[r.id] = r; });
  }

  // Recent creators: accepted applications in brand's completed campaigns
  let creators = [];
  if (pastRes.data?.length) {
    const campIds = pastRes.data.map(c => c.id).filter(Boolean);
    if (campIds.length) {
      const { data: apps } = await _sb.from('campaign_applications')
        .select('influencer_id, influencer_profiles!inner(id, full_name, username, handle)')
        .in('campaign_id', campIds).eq('status', 'accepted')
        .order('created_at', { ascending: false }).limit(5);
      creators = (apps||[]).map(a => a.influencer_profiles).filter(Boolean);
    }
  }

  S._brandProfileData = {
    brand: brandRes.data || { company_name: bizName, id: bizId },
    pastCamps: (pastRes.data||[]).map(c => ({
      id: c.id, name: c.name || 'Untitled',
      type: c.campaign_type || c.type || 'fixed',
      reward: c.reward_amount ? `€${Number(c.reward_amount).toLocaleString()}` : (c.commission_rate ? `${c.commission_rate}%` : '—'),
      participants: c.accepted_count || 0,
      reach: c.total_reach ? (Number(c.total_reach)>=1e6 ? (Number(c.total_reach)/1e6).toFixed(1)+'M' : Number(c.total_reach)>=1000 ? (Number(c.total_reach)/1000).toFixed(0)+'K' : String(c.total_reach)) : '—',
      engagement: '—',
      endedDate: c.updated_at || c.created_at,
    })),
    reviews: (reviewsRes.data||[]).map(r => ({
      id: r.id, stars: r.stars||5, comment: r.comment||'',
      date: r.created_at, reviewer: reviewerMap[r.reviewer_id]||null,
    })),
    creators,
  };
}

async function viewBrandProfile(bizId, bizName) {
  const safeId = bizId ? +bizId : null;
  try {
    S._brandFilter = { id: safeId, name: bizName };
    S._brandCampaigns = [];
    S._brandProfileData = null;
    S._brandProfileTab = 'active';
    S._bpCollaborating = false;
    inflPage('brand-profile');
    await _loadBrandProfileAll(safeId, bizName);
    if (S.inflPage === 'brand-profile') {
      const el = document.getElementById('infl-content');
      if (el) el.innerHTML = renderInflBrandProfile();
    }
  } catch(e) {
    console.error('[viewBrandProfile]', e);
    toast(t('err-load-brand-profile') + ': ' + e.message, 'error');
  }
}

// ─ Tab switching ──────────────────────────────────────────────────────────────

function setBrandProfileTab(tab) {
  S._brandProfileTab = tab;
  document.getElementById('bp-tab-bar')?.replaceWith((() => {
    const el = document.createElement('div');
    el.id = 'bp-tab-bar'; el.innerHTML = _bpTabBar(); return el;
  })());
  const tc = document.getElementById('bp-tab-content');
  if (tc) tc.innerHTML = _bpTabContent();
}

// ─ Collaborate toggle ─────────────────────────────────────────────────────────

function toggleBpCollaborate() {
  S._bpCollaborating = !S._bpCollaborating;
  const btn = document.getElementById('bp-collab-btn');
  if (!btn) return;
  if (S._bpCollaborating) {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2.4"><path d="M5 12l5 5 9-11"/></svg> ${t('bp-collaborating')}`;
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:.85rem;font-weight:800;padding:10px 18px;border-radius:12px;background:transparent;color:var(--blue);border:1.5px solid var(--blue);cursor:pointer';
  } else {
    btn.innerHTML = `+ ${t('bp-collaborate')}`;
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:.85rem;font-weight:800;padding:10px 18px;border-radius:12px;background:var(--blue);color:#fff;border:1.5px solid var(--blue);box-shadow:0 6px 18px rgba(32,121,255,.35);cursor:pointer';
  }
}

// ─ Main render ────────────────────────────────────────────────────────────────

function renderInflBrandProfile() {
  if (!S._brandFilter) { inflPage('discover'); return ''; }
  const loading = !S._brandProfileData;
  const brandName = S._brandFilter.name;
  const b = S._brandProfileData?.brand || {};

  return `
  <div style="max-width:1280px;margin:0 auto;padding:0 0 60px;display:flex;flex-direction:column;gap:20px">
    ${_bpCrumbRow(brandName)}
    ${loading ? _bpLoadingCard() : _bpHeaderCard(b, brandName)}
    ${loading ? '' : `
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:22px;align-items:flex-start">
      <div style="display:flex;flex-direction:column;gap:0">
        <div id="bp-tab-bar">${_bpTabBar()}</div>
        <div id="bp-tab-content" style="padding-top:16px">${_bpTabContent()}</div>
      </div>
      <aside style="display:flex;flex-direction:column;gap:12px;position:sticky;top:96px">
        ${_bpSignalsCard(b)}
        ${_bpMatchCard()}
        ${_bpRecentCreatorsCard()}
      </aside>
    </div>`}
  </div>`;
}

// ─ Breadcrumb ────────────────────────────────────────────────────────────────

function _bpCrumbRow(brandName) {
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <button class="btn btn-secondary" style="font-size:.82rem;padding:7px 14px;gap:6px;border-radius:10px"
            onclick="S._brandFilter=null;S._brandProfileData=null;S._brandCampaigns=[];inflPage('discover')">
      ← ${t('bp-back-discover')}
    </button>
    <span style="display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:var(--text-mid)">
      <span style="cursor:pointer;color:var(--blue)" onclick="S._brandFilter=null;S._brandProfileData=null;S._brandCampaigns=[];inflPage('discover')">${t('nav-sidebar-discover')}</span>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      <span style="color:var(--navy);font-weight:700">${h(brandName)}</span>
    </span>
  </div>`;
}

function _bpLoadingCard() {
  return `<div class="card" style="display:flex;align-items:center;justify-content:center;height:300px">
    <div style="text-align:center">
      <div style="width:44px;height:44px;border:3px solid var(--blue-mid);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div>
      <div style="color:var(--text-mid);font-size:.9rem;font-weight:600">${t('bp-loading')}</div>
    </div>
  </div>`;
}

// ─ Header card ────────────────────────────────────────────────────────────────

function _bpHeaderCard(b, brandName) {
  const name = b.company_name || brandName;
  const initials = _bpInitials(name);
  const industry = b.industry || 'General';
  const avatarBg = _bpBrandColor(industry);
  const rating = Number(b.avg_rating||b.rating||0);
  const ratingCount = b.rating_count || 0;
  const about = b.about || b.description || '';
  const website = b.website || '';
  const country = b.country || '';
  const activeCnt = (S._brandCampaigns||[]).length;
  const pastCnt = (S._brandProfileData?.pastCamps||[]).length;
  const bizId = b.id || S._brandFilter?.id || 0;

  return `
  <div class="card" style="padding:0;overflow:visible;border-radius:20px">
    <!-- Cover -->
    <div style="height:160px;background:linear-gradient(135deg,var(--blue) 0%,var(--navy) 100%);border-radius:20px 20px 0 0;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 80% 30%,rgba(255,255,255,.15) 0%,transparent 50%),radial-gradient(circle at 20% 75%,rgba(255,255,255,.08) 0%,transparent 40%)"></div>
      <button onclick="navigator.clipboard?.writeText(window.location.href).then(()=>toast(t('bp-copied'),'success'))"
              style="position:absolute;top:16px;right:18px;display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;color:#fff;padding:7px 12px;border-radius:10px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(8px);cursor:pointer">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        ${t('bp-share')}
      </button>
    </div>

    <!-- Identity row -->
    <div style="padding:0 28px;margin-top:-40px;position:relative">
      <div style="display:flex;align-items:flex-start;gap:18px">
        <!-- Avatar -->
        <div style="width:88px;height:88px;border-radius:20px;background:${avatarBg};color:#fff;font-weight:800;font-size:1.5rem;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px #fff,0 8px 24px rgba(13,27,62,.2);flex-shrink:0;position:relative">
          ${h(initials)}
          ${b.verified ? `<span style="position:absolute;bottom:-4px;right:-4px;width:26px;height:26px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--blue)"><path d="M12 1l2.6 2L18 2.5l.5 3.4L21 8l-1.4 3L21 14l-2.5 2.1L18 19.5 14.6 19 12 21l-2.6-2L6 19.5 5.5 16 3 14l1.4-3L3 8l2.5-2.1L6 2.5 9.4 3 12 1z"/><path d="M8 12l3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>` : ''}
        </div>

        <!-- Name + meta -->
        <div style="flex:1;min-width:0;padding-top:52px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:5px">
            <h2 style="margin:0;font-size:1.55rem;font-weight:800;letter-spacing:-.02em;color:var(--navy)">${h(name)}</h2>
            ${b.verified ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:.7rem;font-weight:800;letter-spacing:.04em;padding:4px 10px;border-radius:50px;border:1.5px solid rgba(32,121,255,.35);background:rgba(32,121,255,.07);color:var(--blue);text-transform:uppercase">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>
              ${t('bp-premium')}
            </span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:.82rem;font-weight:600;color:var(--text-mid)">
            <span style="padding:3px 9px;border-radius:6px;background:var(--blue-soft);font-size:.7rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--text-mid)">${h(industry)}</span>
            ${country ? `<span>·</span><span>${h(country)}</span>` : ''}
            ${website ? `<span>·</span><a href="https://${h(website)}" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700;text-decoration:none">${h(website)}</a>` : ''}
          </div>
        </div>

        <!-- Action buttons -->
        <div style="padding-top:54px;display:flex;gap:8px;flex-shrink:0">
          <button id="bp-collab-btn" onclick="toggleBpCollaborate()"
                  style="display:inline-flex;align-items:center;gap:6px;font-size:.85rem;font-weight:800;padding:10px 18px;border-radius:12px;background:var(--blue);color:#fff;border:1.5px solid var(--blue);box-shadow:0 6px 18px rgba(32,121,255,.35);cursor:pointer">
            + ${t('bp-collaborate')}
          </button>
          <button onclick="openChatWith(${JSON.stringify(bizId)},${h(JSON.stringify(name))},'influencer')"
                  style="display:inline-flex;align-items:center;gap:6px;font-size:.85rem;font-weight:700;padding:10px 16px;border-radius:12px;border:1.5px solid var(--border);background:#fff;color:var(--text-mid);cursor:pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>
            ${t('bp-message')}
          </button>
        </div>
      </div>

      ${about ? `<p style="margin:16px 0 0;font-size:.9rem;font-weight:500;line-height:1.65;color:var(--text)">${h(about)}</p>` : ''}

      <!-- KPI strip -->
      <div style="display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid var(--border);margin:18px -28px 0;padding:14px 28px 18px">
        ${_bpKpi(t('bp-kpi-active'), activeCnt, '', true)}
        ${_bpKpi(t('bp-kpi-completed'), pastCnt, '')}
        ${_bpKpi(t('bp-kpi-rating'), rating > 0 ? rating.toFixed(1) : '—', ratingCount > 0 ? ratingCount+' '+t('bp-reviews-sub') : '')}
        ${_bpKpi(t('bp-kpi-response'), '< 24h', '')}
        ${_bpKpi(t('bp-kpi-payment'), '< 14 dní', '')}
        ${_bpKpi(t('bp-kpi-spent'), '—', '')}
      </div>
    </div>
  </div>`;
}

function _bpKpi(label, value, sub, highlight=false) {
  return `<div style="text-align:center;padding:8px 6px;border-radius:10px;${highlight ? 'background:rgba(32,121,255,.07);border:1px solid rgba(32,121,255,.2)' : ''}">
    <div style="font-size:.62rem;font-weight:800;color:var(--text-light);letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px">${label}</div>
    <div style="font-size:1.35rem;font-weight:800;color:var(--navy);letter-spacing:-.03em">${value}</div>
    ${sub ? `<div style="font-size:.7rem;font-weight:600;color:var(--text-mid);margin-top:2px">${sub}</div>` : ''}
  </div>`;
}

// ─ Tab bar ───────────────────────────────────────────────────────────────────

function _bpTabBar() {
  const b = S._brandProfileData?.brand || {};
  const activeCnt = (S._brandCampaigns||[]).length;
  const pastCnt   = (S._brandProfileData?.pastCamps||[]).length;
  const revCnt    = (S._brandProfileData?.reviews||[]).length || (b.rating_count||0);
  const tabs = [
    { id:'active',  label:t('bp-tab-active'),  count:activeCnt },
    { id:'past',    label:t('bp-tab-past'),    count:pastCnt   },
    { id:'reviews', label:t('bp-tab-reviews'), count:revCnt    },
    { id:'about',   label:t('bp-tab-about')                    },
  ];
  const cur = S._brandProfileTab || 'active';
  return `<div role="tablist" style="display:flex;gap:0;border-bottom:2px solid var(--border);background:#fff;border-radius:14px 14px 0 0;padding:0 4px">
    ${tabs.map(tab => `
    <button role="tab" aria-selected="${tab.id===cur}" onclick="setBrandProfileTab('${tab.id}')"
            style="display:inline-flex;align-items:center;gap:6px;padding:13px 14px;font-size:.88rem;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2.5px solid ${tab.id===cur ? 'var(--blue)' : 'transparent'};color:${tab.id===cur ? 'var(--navy)' : 'var(--text-mid)'};margin-bottom:-2px;transition:color .1s">
      ${tab.label}
      ${tab.count !== undefined ? `<span style="font-size:.7rem;font-weight:800;padding:2px 7px;border-radius:6px;min-width:20px;text-align:center;background:${tab.id===cur ? 'rgba(32,121,255,.12)' : 'var(--blue-soft)'};color:${tab.id===cur ? 'var(--blue)' : 'var(--text-mid)'}">${tab.count}</span>` : ''}
    </button>`).join('')}
  </div>`;
}

function _bpTabContent() {
  const tab = S._brandProfileTab || 'active';
  if (tab === 'active')  return _bpActiveCampaigns();
  if (tab === 'past')    return _bpPastCampaigns();
  if (tab === 'reviews') return _bpReviews();
  if (tab === 'about')   return _bpAbout();
  return '';
}

// ─ Active campaigns tab ───────────────────────────────────────────────────────

function _bpActiveCampaigns() {
  const camps = S._brandCampaigns || [];
  return `
  <div class="card" style="padding:20px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="margin:0 0 3px;color:var(--navy)">${t('bp-open-for-apply')}</h3>
        <p style="margin:0;font-size:.82rem;font-weight:600;color:var(--text-mid)">${camps.length} ${t('bp-camps-looking')}</p>
      </div>
    </div>
    ${camps.length === 0
      ? `<div style="text-align:center;padding:52px 20px;color:var(--text-mid);font-size:.9rem;font-weight:600">${t('bp-no-active')}</div>`
      : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:14px">${camps.map(_bpCampaignCard).join('')}</div>`}
  </div>`;
}

function _bpCampaignCard(c) {
  const typeColor = _bpTypeColor(c.type);
  const days = _bpDaysUntil(c.deadline !== '—' ? c.deadline : null);
  const urgent = days <= 14 && c.deadline !== '—';
  const slotPct = c.slots.total > 0 ? Math.min(100, Math.round((c.slots.taken / c.slots.total) * 100)) : 0;
  const freeSlots = Math.max(0, c.slots.total - c.slots.taken);

  return `
  <article style="background:#fff;border-radius:16px;border:1.5px solid var(--border);overflow:hidden;display:flex;flex-direction:column">
    <!-- Cover band -->
    <div style="padding:12px 14px;min-height:52px;background:linear-gradient(135deg,${typeColor},var(--blue));position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 85% 25%,rgba(255,255,255,.18) 0%,transparent 50%)"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
        <span style="display:inline-flex;align-items:center;gap:4px;font-size:.7rem;font-weight:800;letter-spacing:.04em;color:#fff;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.3);text-transform:uppercase">
          ${h(c.type||'')}
        </span>
        <span style="display:inline-flex;align-items:center;gap:4px;font-size:.7rem;font-weight:800;padding:4px 8px;border-radius:999px;background:#fff;color:var(--blue)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
          ${c.match||'—'}% match
        </span>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:9px">
      <h4 style="margin:0;font-size:.95rem;font-weight:800;color:var(--navy);line-height:1.3">${h(c.name)}</h4>

      ${c.niches?.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${c.niches.map(n=>`<span style="font-size:.7rem;font-weight:700;color:var(--text-mid);padding:2px 7px;border-radius:6px;background:var(--blue-soft)">#${h(n)}</span>`).join('')}</div>` : ''}

      <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--blue-soft);border-radius:10px;gap:8px">
        <div>
          <div style="font-size:.62rem;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">${t('bp-reward-label')}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--blue);line-height:1.1">${h(c.reward)}</div>
          ${c.rewardSub ? `<div style="font-size:.7rem;font-weight:600;color:var(--text-mid)">${h(c.rewardSub)}</div>` : ''}
        </div>
        ${c.deliverables ? `<div style="text-align:right">
          <div style="font-size:.62rem;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Deliverables</div>
          <div style="font-size:.82rem;font-weight:700;color:var(--navy)">${h(c.deliverables)}</div>
        </div>` : ''}
      </div>

      <div style="display:flex;align-items:flex-end;gap:10px;margin-top:auto">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;font-size:.72rem;font-weight:700;margin-bottom:3px">
            <span style="color:var(--text-mid)">${freeSlots} ${t('bp-slots-open')}</span>
            <span style="color:var(--navy)">${c.slots.taken}/${c.slots.total}</span>
          </div>
          <div style="height:4px;border-radius:2px;background:var(--blue-soft);overflow:hidden">
            <div style="height:100%;border-radius:2px;background:var(--blue);width:${slotPct}%;transition:width .3s"></div>
          </div>
          <div style="display:inline-flex;align-items:center;gap:4px;font-size:.7rem;font-weight:700;margin-top:5px;color:${urgent ? '#dc2626' : 'var(--text-mid)'}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${urgent ? '#dc2626' : 'currentColor'}" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
            ${c.deadline !== '—' ? (urgent ? t('bp-closing-in').replace('{n}', days) : t('bp-due-date').replace('{d}', c.deadline)) : '—'}
          </div>
        </div>
        <button class="btn btn-primary" style="padding:9px 12px;font-size:.8rem;border-radius:10px;flex-shrink:0;border:none"
                onclick="event.stopPropagation();applyToCampaign(${JSON.stringify(c.id)})">
          ${c.applied ? `✓ ${t('c-applied-badge')}` : t('d-apply-now')}
        </button>
      </div>
    </div>
  </article>`;
}

// ─ Past campaigns tab ─────────────────────────────────────────────────────────

function _bpPastCampaigns() {
  const camps = S._brandProfileData?.pastCamps || [];
  return `
  <div class="card" style="padding:20px">
    <div style="margin-bottom:16px">
      <h3 style="margin:0 0 3px;color:var(--navy)">${t('bp-past-title')}</h3>
      <p style="margin:0;font-size:.82rem;color:var(--text-mid)">${t('bp-past-sub')}</p>
    </div>
    ${camps.length === 0
      ? `<div style="text-align:center;padding:52px 20px;color:var(--text-mid);font-size:.9rem;font-weight:600">${t('bp-no-past')}</div>`
      : `<div style="overflow-x:auto">
          <table class="data-table" style="min-width:620px">
            <thead><tr>
              <th>${t('bp-col-campaign')}</th>
              <th>${t('bp-col-type')}</th>
              <th>${t('bp-col-reward')}</th>
              <th>${t('bp-col-participants')}</th>
              <th>Reach</th>
              <th>Engagement</th>
              <th>${t('bp-col-ended')}</th>
            </tr></thead>
            <tbody>${camps.map(c => {
              const tc = _bpTypeColor(c.type);
              return `<tr>
                <td style="font-weight:700;color:var(--navy)">${h(c.name)}</td>
                <td><span style="font-size:.72rem;font-weight:800;color:${tc};text-transform:uppercase;letter-spacing:.04em">${h((c.type||'').toUpperCase())}</span></td>
                <td style="font-weight:700">${h(c.reward)}</td>
                <td>${c.participants}</td>
                <td>${h(c.reach)}</td>
                <td style="color:#10b981;font-weight:700">${h(c.engagement)}</td>
                <td style="font-size:.8rem;color:var(--text-mid)">${_bpFmtDate(c.endedDate)}</td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>`}
  </div>`;
}

// ─ Reviews tab ───────────────────────────────────────────────────────────────

function _bpReviews() {
  const reviews = S._brandProfileData?.reviews || [];
  const b = S._brandProfileData?.brand || {};
  const rating = Number(b.avg_rating||b.rating||0);
  const ratingCount = b.rating_count || reviews.length || 0;

  const starDist = [5,4,3,2,1].map(s => {
    const cnt = reviews.filter(r => r.stars === s).length;
    return { s, pct: reviews.length > 0 ? Math.round((cnt/reviews.length)*100) : (s===5?100:0) };
  });

  return `
  <div style="display:flex;flex-direction:column;gap:14px">
    <div class="card" style="padding:22px;display:grid;grid-template-columns:160px 1fr 220px;gap:24px;align-items:center">
      <!-- Big rating -->
      <div style="text-align:center;border-right:1px solid var(--border);padding-right:24px">
        <div style="font-size:3.2rem;font-weight:800;color:var(--navy);letter-spacing:-.05em;line-height:1">${rating > 0 ? rating.toFixed(1) : '—'}</div>
        <div style="display:flex;justify-content:center;gap:2px;margin-top:6px">
          ${[1,2,3,4,5].map(i=>`<span style="color:${i<=Math.round(rating)?'#f59e0b':'var(--border)'};font-size:1.1rem" aria-hidden="true">★</span>`).join('')}
        </div>
        <div style="font-size:.75rem;font-weight:600;color:var(--text-mid);margin-top:5px" aria-label="${rating} z 5 hviezd, ${ratingCount} recenzií">${ratingCount} ${t('bp-reviews-sub')}</div>
      </div>
      <!-- Distribution bars -->
      <div style="display:flex;flex-direction:column;gap:7px">
        ${starDist.map(({s,pct}) => `<div style="display:flex;align-items:center;gap:10px">
          <span style="width:20px;font-size:.78rem;font-weight:700;color:var(--navy)">${s}★</span>
          <div style="flex:1;height:7px;border-radius:4px;background:var(--blue-soft);overflow:hidden">
            <div style="height:100%;border-radius:4px;background:var(--blue);width:${pct}%"></div>
          </div>
          <span style="width:32px;font-size:.72rem;font-weight:700;color:var(--text-mid);text-align:right">${pct}%</span>
        </div>`).join('')}
      </div>
      <!-- Praise tags -->
      <div style="border-left:1px solid var(--border);padding-left:24px">
        <div style="font-size:.65rem;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">${t('bp-praise-title')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${[t('bp-praise-1'),t('bp-praise-2'),t('bp-praise-3'),t('bp-praise-4'),t('bp-praise-5')].map(tag=>
            `<span style="display:inline-flex;align-items:center;gap:4px;font-size:.74rem;font-weight:700;padding:4px 9px;border-radius:999px;border:1.5px solid rgba(32,121,255,.3);background:rgba(32,121,255,.06);color:var(--blue)">✓ ${tag}</span>`
          ).join('')}
        </div>
      </div>
    </div>

    ${reviews.length === 0
      ? `<div class="card" style="text-align:center;padding:52px 20px;color:var(--text-mid);font-size:.9rem;font-weight:600">${t('bp-no-reviews')}</div>`
      : reviews.map(_bpReviewCard).join('')}
  </div>`;
}

function _bpReviewCard(r) {
  const name = r.reviewer?.full_name || r.reviewer?.username || t('bp-anon');
  const handle = r.reviewer?.handle || (r.reviewer?.username ? '@'+r.reviewer.username : '');
  const initials = _bpInitials(name);
  const bgColor = _bpColorFor(name);
  return `
  <article class="card" style="display:flex;gap:12px;padding:16px">
    <div style="width:42px;height:42px;border-radius:12px;background:${bgColor};color:#fff;font-weight:800;font-size:.82rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">${h(initials)}</div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-size:.9rem;font-weight:800;color:var(--navy);margin-right:6px">${h(name)}</span>
          ${handle ? `<span style="font-size:.78rem;font-weight:600;color:var(--text-light)">${h(handle)}</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="color:#f59e0b;font-size:.85rem;letter-spacing:1px" aria-label="${r.stars} z 5 hviezd">${'★'.repeat(r.stars)}<span style="color:var(--border)">${'★'.repeat(5-r.stars)}</span></span>
          <span style="font-size:.75rem;font-weight:600;color:var(--text-light)">${_bpRelTime(r.date)}</span>
        </div>
      </div>
      ${r.comment ? `<p style="margin:8px 0 0;font-size:.87rem;font-weight:500;line-height:1.6;color:var(--text)">${h(r.comment)}</p>` : ''}
    </div>
  </article>`;
}

// ─ About tab ─────────────────────────────────────────────────────────────────

function _bpAbout() {
  const b = S._brandProfileData?.brand || {};
  const about = b.about || b.description || '';
  const website = b.website || '';
  const country = b.country || '';
  const email = b.email || '';
  const industry = b.industry || '';
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div class="card" style="padding:20px">
      <h4 style="margin:0 0 12px;color:var(--navy)">${t('bp-about-title')}</h4>
      <p style="margin:0;font-size:.88rem;font-weight:500;line-height:1.65;color:var(--text)">${h(about || t('bp-no-description'))}</p>
    </div>
    <div class="card" style="padding:20px">
      <h4 style="margin:0 0 12px;color:var(--navy)">${t('bp-creators-title')}</h4>
      <ul style="margin:0;padding:0 0 0 16px;font-size:.86rem;font-weight:500;line-height:1.8;color:var(--text);display:flex;flex-direction:column;gap:3px">
        <li>${t('bp-creator-req-1')}</li>
        <li>${t('bp-creator-req-2')}</li>
        <li>${t('bp-creator-req-3')}</li>
      </ul>
    </div>
    <div class="card" style="padding:20px">
      <h4 style="margin:0 0 12px;color:var(--navy)">${t('bp-collab-types')}</h4>
      <ul style="margin:0;padding:0 0 0 16px;font-size:.86rem;font-weight:500;line-height:1.8;color:var(--text);display:flex;flex-direction:column;gap:4px">
        <li><strong>Affiliate</strong> — ${t('bp-type-affiliate')}</li>
        <li><strong>Fixed fee</strong> — ${t('bp-type-fixed')}</li>
        <li><strong>Hybrid</strong> — ${t('bp-type-hybrid')}</li>
        <li><strong>Barter</strong> — ${t('bp-type-barter')}</li>
      </ul>
    </div>
    <div class="card" style="padding:20px">
      <h4 style="margin:0 0 12px;color:var(--navy)">${t('bp-contact')}</h4>
      <div>${[
        [t('bp-industry-label'), h(industry)],
        country ? [t('bp-country-label'), h(country)] : null,
        website ? ['Web', `<a href="https://${h(website)}" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700;text-decoration:none">${h(website)}</a>`] : null,
        email ? ['Email', `<a href="mailto:${h(email)}" style="color:var(--blue);font-weight:700;text-decoration:none">${h(email)}</a>`] : null,
      ].filter(Boolean).map(([lbl,val])=>
        `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:.86rem">
          <span style="color:var(--text-mid);font-weight:600">${lbl}</span>
          <span style="font-weight:700;color:var(--navy)">${val||'—'}</span>
        </div>`
      ).join('')}</div>
    </div>
  </div>`;
}

// ─ Side column cards ──────────────────────────────────────────────────────────

function _bpSignalsCard(b) {
  b = b || {};
  return `
  <div class="card" style="padding:16px">
    <div style="display:flex;align-items:center;gap:7px;font-size:.82rem;font-weight:800;color:var(--navy);margin-bottom:12px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2.2"><path d="M3 21V9M9 21V3M15 21v-9M21 21v-5"/></svg>
      ${t('bp-signals-title')}
    </div>
    <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px">
      ${[
        [t('bp-signal-payment'),   '100%',    '#10b981'],
        [t('bp-signal-response'),  '< 24h',   'var(--blue)'],
        [t('bp-signal-rebooking'), '—',        'var(--blue)'],
        [t('bp-signal-dispute'),   '—',        '#10b981'],
      ].map(([label,value,color])=>`
      <li style="display:flex;justify-content:space-between;align-items:center;font-size:.82rem">
        <span style="color:var(--text-mid);font-weight:600">${label}</span>
        <span style="font-weight:800;color:${color}">${value}</span>
      </li>`).join('')}
    </ul>
  </div>`;
}

function _bpMatchCard() {
  const activeCnt = (S._brandCampaigns||[]).length;
  return `
  <div class="card" style="padding:16px;background:linear-gradient(180deg,rgba(32,121,255,.07),rgba(32,121,255,.02));border-color:rgba(32,121,255,.28)">
    <div style="display:flex;align-items:center;gap:6px;font-size:.68rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--blue);margin-bottom:8px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>
      ${t('bp-match-title')}
    </div>
    <p style="font-size:.87rem;font-weight:600;color:var(--text);line-height:1.55;margin:0 0 12px">
      ${t('bp-match-text').replace('{n}', activeCnt)}
    </p>
    <button class="btn btn-primary" style="width:100%;justify-content:center;padding:9px;font-size:.82rem;border-radius:10px;gap:6px;border:none">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="white"/></svg>
      ${t('bp-match-cta')}
    </button>
  </div>`;
}

function _bpRecentCreatorsCard() {
  const creators = S._brandProfileData?.creators || [];
  const b = S._brandProfileData?.brand || {};
  return `
  <div class="card" style="padding:16px">
    <div style="display:flex;align-items:center;gap:7px;font-size:.82rem;font-weight:800;color:var(--navy);margin-bottom:12px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.5 1.5-4 4-4s2 1 2 2"/></svg>
      ${t('bp-recent-creators')}
    </div>
    ${creators.length === 0
      ? `<div style="text-align:center;padding:14px;color:var(--text-mid);font-size:.82rem">${t('bp-no-creators')}</div>`
      : `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
          ${creators.map((c,i)=>{
            const name = c.full_name||c.username||'Creator';
            const handle = c.handle||(c.username?'@'+c.username:'');
            return `<div style="display:flex;align-items:center;gap:9px">
              <div style="width:28px;height:28px;border-radius:9px;background:${_BP_AVATAR_COLORS[i%_BP_AVATAR_COLORS.length]};color:#fff;font-weight:800;font-size:.7rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">${h(_bpInitials(name))}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:.82rem;font-weight:700;color:var(--navy)">${h(name)}</div>
                ${handle?`<div style="font-size:.72rem;font-weight:600;color:var(--text-light)">${h(handle)}</div>`:''}
              </div>
            </div>`;
          }).join('')}
        </div>`}
    <button style="display:inline-flex;align-items:center;gap:4px;font-size:.78rem;font-weight:800;color:var(--blue);background:none;border:none;cursor:pointer;padding:0">
      ${t('bp-see-all').replace('{n}', b.rating_count||creators.length)}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    </button>
  </div>`;
}
