// ══════════════════ CAMPAIGN DETAIL PAGE v2 (BUSINESS) ═════════════════════

// S._campDetail = {
//   campId, tab, _appFilter,
//   campaign, applications, content, activity,
//   _activityChannel, _appsChannel
// }

// ── Content element helper (desktop: biz-content, mobile: mob-content) ───────
function _campDetailEl() {
  return document.getElementById('mob-content')
      || document.getElementById('biz-content')
      || null;
}

// ── Entry point ───────────────────────────────────────────────────────────────
function viewCampaignDetail(campId) {
  if (S._campDetail?._activityChannel) { try { S._campDetail._activityChannel.unsubscribe(); } catch(e) {} }
  if (S._campDetail?._appsChannel)     { try { S._campDetail._appsChannel.unsubscribe();     } catch(e) {} }
  S._campDetail = {
    campId, tab: 'applications', _appFilter: 'all',
    campaign: null, applications: [], content: [], activity: [],
    _activityChannel: null, _appsChannel: null,
  };
  if (document.getElementById('mob-content')) {
    mobBizPage('campaign-detail');
  } else {
    bizPage('campaign-detail');
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function _campDetailSkeleton() {
  const s = (h, w = '100%', br = 12) =>
    `<div style="height:${h}px;width:${w};border-radius:${br}px;background:linear-gradient(90deg,#e8edf5 25%,#f0f4fb 50%,#e8edf5 75%);background-size:400% 100%;animation:skel 1.5s ease infinite"></div>`;
  return `<div style="padding:20px;background:var(--bg);min-height:100%;display:flex;flex-direction:column;gap:14px">
    <div style="background:white;border-radius:16px;padding:22px 24px;border:1px solid var(--border);display:flex;flex-direction:column;gap:12px">
      ${s(20,'140px')} ${s(28,'60%')} ${s(16,'40%')}
      <div style="display:flex;gap:10px;margin-top:4px">${s(34,'110px',8)}${s(34,'110px',8)}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${[0,0,0,0].map(() => `<div>${s(68)}</div>`).join('')}</div>
    <div style="background:white;border-radius:16px;padding:22px 24px;border:1px solid var(--border);display:flex;flex-direction:column;gap:10px">
      ${s(40)} ${s(72)} ${s(72)} ${s(72)}
    </div>
  </div>`;
}

// ── Render entry ──────────────────────────────────────────────────────────────
function renderBizCampaignDetail() {
  if (!S._campDetail) return `<div class="card" style="padding:40px;text-align:center"><p style="color:var(--text-muted)">${t('cdp-no-camp-selected')}</p></div>`;
  if (S._campDetail.campaign) return _renderCampDetailFull();
  setTimeout(_loadCampDetail, 0);
  return _campDetailSkeleton();
}

// ── Load data ─────────────────────────────────────────────────────────────────
async function _loadCampDetail() {
  const cd = S._campDetail;
  if (!cd?.campId) return;
  const id = cd.campId;

  if (!APP.user) {
    const demo = BIZ_CAMPAIGNS.find(c => String(c.id) === String(id));
    S._campDetail = {
      ...cd,
      campaign: demo?._raw || {
        id, name: demo?.name || 'Campaign', status: demo?.status || 'active',
        budget: parseFloat(String(demo?.budget || '0').replace(/[€,]/g, '')) || 0,
        spent:  parseFloat(String(demo?.spent  || '0').replace(/[€,]/g, '')) || 0,
        type: demo?.type,
      },
      applications: [], content: [], activity: [],
    };
    const el = _campDetailEl();
    if (el) el.innerHTML = _renderCampDetailFull();
    return;
  }

  const [campRes, appsRes, contentRes, activityRes] = await Promise.all([
    _sb.from('campaigns').select('*').eq('id', id).single(),
    _sb.from('campaign_applications')
      .select('*, influencer_profiles(id,user_id,full_name,name,username,handle,niche,follower_count,avg_rating,rating,avg_engagement_rate,engagement_rate,verified,avatar_url)')
      .eq('campaign_id', id).order('created_at', { ascending: false }),
    _sb.from('campaign_content')
      .select('*, influencer_profiles(full_name,name,username,handle)')
      .eq('campaign_id', id).order('created_at', { ascending: false }),
    _sb.from('campaign_activity')
      .select('*').eq('campaign_id', id)
      .order('created_at', { ascending: false }).limit(20),
  ]);

  if (campRes.error || !campRes.data) {
    const el = _campDetailEl();
    if (el) el.innerHTML = `<div class="card" style="padding:40px;text-align:center"><p style="color:var(--danger)">${t('cdp-camp-not-found')}</p><button class="btn btn-secondary" style="margin-top:16px" onclick="campDetailBack()">← ${t('cdp-back')}</button></div>`;
    return;
  }

  S._campDetail = {
    ...cd,
    campaign:     campRes.data,
    applications: appsRes.data    || [],
    content:      contentRes.data || [],
    activity:     activityRes.data || [],
  };

  const el = _campDetailEl();
  if (el) {
    el.innerHTML = _renderCampDetailFull();
    _subscribeActivityFeed(id);
    _subscribeApplicationsFeed(id);
  }
}

// ── Full render ───────────────────────────────────────────────────────────────
function _renderCampDetailFull() {
  const d = S._campDetail;
  const c = d.campaign;
  return `
  <div style="padding:20px;background:var(--bg);min-height:100%;padding-bottom:40px">
    ${_campDetailHero(c, d.applications)}
    <div id="cdp-kpi-strip" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
      ${_campKpiStripInner(c, d.applications)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 296px;gap:16px;align-items:start">
      <div>
        <div id="cdp-tab-bar-wrap">${_campDetailTabBar(d.tab, d.applications, d.content)}</div>
        <div id="cdp-tab-content" style="margin-top:14px">${_campDetailTabContent(d)}</div>
      </div>
      <div style="position:sticky;top:16px;display:flex;flex-direction:column;gap:14px">
        ${_campSidebarBudget(c)}
        ${_campSidebarTimeline(c)}
        ${_campSidebarQuickActions(c)}
        ${_campSidebarActivity(d.activity)}
      </div>
    </div>
  </div>`;
}

// ── Hero v2 (white card) ──────────────────────────────────────────────────────
function _campDetailHero(c, apps) {
  const status   = c?.status || 'draft';
  const budget    = Number(c?.budget || 0);
  const spent     = Number(c?.spent  || 0);
  const remaining = Math.max(0, budget - spent);

  const _onStatus = (newStatus) =>
    `setCampaignStatus('${c.id}','${newStatus}');if(S._campDetail?.campaign)S._campDetail.campaign.status='${newStatus}';setTimeout(()=>{const el=_campDetailEl();if(el&&S._campDetail?.campaign)el.innerHTML=_renderCampDetailFull();},100)`;

  const btnPrimary = 'padding:8px 18px;border:none;border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer;color:white;background:var(--blue)';
  const btnSuccess = 'padding:8px 18px;border:none;border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer;color:white;background:var(--success)';
  const btnWarn    = 'padding:8px 18px;border:1.5px solid var(--warning);border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer;background:#fffbeb;color:#92400e';
  const btnDanger  = 'padding:8px 18px;border:1.5px solid var(--danger);border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer;background:white;color:var(--danger)';

  const btns = [];
  if (status === 'draft')  btns.push(`<button onclick="${_onStatus('active')}"  style="${btnPrimary}">🚀 ${t('wiz-launch')}</button>`);
  if (status === 'active') btns.push(`<button onclick="${_onStatus('paused')}"  style="${btnWarn}">⏸ ${t('c-pause-btn')}</button>`);
  if (status === 'paused') btns.push(`<button onclick="${_onStatus('active')}"  style="${btnSuccess}">▶ ${t('c-resume-btn')}</button>`);
  if (status !== 'completed') btns.push(`<button onclick="campDetailEndCampaign('${c.id}')" style="${btnDanger}">✕ ${t('cdp-end-campaign')}</button>`);

  const brief    = c?.brief || c?.description || '';
  const deadline = c?.deadline ? new Date(c.deadline) : null;
  const now      = new Date();
  const daysLeft = deadline ? Math.ceil((deadline - now) / 86400000) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent  = daysLeft !== null && !isOverdue && daysLeft <= 14;
  const dayColor  = isOverdue ? 'var(--danger)' : isUrgent ? 'var(--danger)' : 'var(--blue)';
  const pct       = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;

  return `
  <div style="background:white;border-radius:16px;padding:20px 24px;margin-bottom:14px;border:1px solid var(--border)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <button onclick="campDetailBack()" style="padding:5px 12px;border:1.5px solid var(--border);background:white;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--text-muted);white-space:nowrap">← ${t('cdp-back')}</button>
      <div style="flex:1"></div>
      <div style="display:flex;gap:6px;align-items:center">${typeBadge(c?.type || c?.campaign_type)} ${statusBadge(c?.status)}</div>
    </div>
    <h2 style="font-size:1.4rem;font-weight:800;color:var(--navy);margin:0 0 6px">${h(c?.name || '—')}</h2>
    ${brief ? `<p style="font-size:.87rem;color:var(--text-muted);margin:0 0 12px;line-height:1.6">${h(brief.slice(0,160))}${brief.length > 160 ? '…' : ''}</p>` : ''}
    <div style="display:flex;align-items:stretch;gap:14px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:10px;flex-wrap:wrap">
      <div style="display:flex;gap:28px;flex:1;flex-wrap:wrap">
        <div>
          <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:3px">${t('cdp-budget-card')}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--navy)">€${budget.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:3px">${t('cdp-spent')}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--navy)">€${spent.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:3px">${t('cdp-remaining')}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--success)">€${remaining.toLocaleString()}</div>
        </div>
      </div>
      ${daysLeft !== null ? `
      <div style="background:${(isOverdue||isUrgent)?'#fff5f5':'var(--bg-soft)'};border:1.5px solid ${(isOverdue||isUrgent)?'var(--danger)':'var(--border)'};border-radius:10px;padding:8px 16px;text-align:center;align-self:center;flex-shrink:0">
        <div style="font-size:1.4rem;font-weight:900;color:${dayColor};line-height:1">${Math.abs(daysLeft)}</div>
        <div style="font-size:.63rem;font-weight:600;color:${dayColor};margin-top:3px;white-space:nowrap">${isOverdue ? t('cdp-days-over') : t('cdp-days-left')}</div>
      </div>` : ''}
    </div>
    <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:14px">
      <div style="height:100%;width:${pct}%;background:${pct>=90?'var(--danger)':'var(--blue)'};border-radius:4px;transition:width .4s"></div>
    </div>
    ${btns.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap">${btns.join('')}</div>` : ''}
  </div>`;
}

// ── KPI strip ─────────────────────────────────────────────────────────────────
function _campKpiStripInner(c, apps) {
  const total       = (apps || []).length;
  const approved    = (apps || []).filter(a => a.status === 'accepted').length;
  const reach       = c?.total_reach  ? fmtFollowers(c.total_reach)               : '—';
  const conversions = c?.conversions  ? Number(c.conversions).toLocaleString()     : '—';
  const kpi = (label, value, color) => `
    <div style="background:white;border-radius:14px;padding:16px 14px;border:1px solid var(--border)">
      <div style="font-size:1.55rem;font-weight:900;color:${color}">${value}</div>
      <div style="font-size:.73rem;color:var(--text-muted);margin-top:4px">${label}</div>
    </div>`;
  return [
    kpi(t('cdp-tab-apps'),      total       || '0', 'var(--navy)'),
    kpi(t('cdp-tab-approved'),  approved    || '0', 'var(--success)'),
    kpi(t('th-reach'),          reach,               'var(--blue)'),
    kpi(t('th-conversions'),    conversions,          'var(--warning)'),
  ].join('');
}

// ── Tab bar v2 (underline style) ──────────────────────────────────────────────
function _campDetailTabBar(active, apps, content) {
  const pendingCount  = (apps    || []).filter(a => a.status === 'pending').length;
  const approvedCount = (apps    || []).filter(a => a.status === 'accepted').length;
  const contentCount  = (content || []).length;
  const tabs = [
    { id: 'applications', label: t('cdp-tab-apps'),     count: pendingCount  },
    { id: 'approved',     label: t('cdp-tab-approved'), count: approvedCount },
    { id: 'content',      label: t('cdp-tab-content'),  count: contentCount  },
    { id: 'analytics',    label: t('cdp-tab-analytics')                       },
    { id: 'settings',     label: t('cdp-tab-settings')                        },
  ];
  const isAct = id => active === id;
  return `<div style="display:flex;background:white;border-radius:14px;overflow:hidden;border:1px solid var(--border)">
    ${tabs.map(tab => `
      <button onclick="setCampDetailTab('${tab.id}')" style="
        flex:1;padding:11px 4px;border:none;
        background:${isAct(tab.id) ? 'var(--bg)' : 'transparent'};
        cursor:pointer;font-weight:700;font-size:.78rem;white-space:nowrap;
        color:${isAct(tab.id) ? 'var(--blue)' : 'var(--text-muted)'};
        border-bottom:2px solid ${isAct(tab.id) ? 'var(--blue)' : 'transparent'};
        transition:all .15s;display:flex;align-items:center;justify-content:center;gap:5px">
        ${tab.label}
        ${tab.count != null && tab.count > 0 ? `<span style="background:${isAct(tab.id)?'var(--blue)':'var(--border-strong)'};color:${isAct(tab.id)?'white':'var(--text-muted)'};border-radius:50px;padding:1px 7px;font-size:.65rem;font-weight:700">${tab.count}</span>` : ''}
      </button>`).join('')}
  </div>`;
}

// ── Tab dispatcher ────────────────────────────────────────────────────────────
function _campDetailTabContent(d) {
  const data = d || S._campDetail;
  switch (data.tab) {
    case 'applications': return _campTabApplications(data.applications);
    case 'approved':     return _campTabApproved(data.applications);
    case 'content':      return _campTabContentGrid(data.content);
    case 'analytics':    return _campTabAnalytics(data);
    case 'settings':     return _campTabSettings(data.campaign);
    default: return '';
  }
}

// ── Empty states ──────────────────────────────────────────────────────────────
function _campEmptyStateRich(type) {
  const skel = `<div style="background:white;border-radius:12px;padding:14px 16px;border:1px solid var(--border);display:flex;gap:12px;align-items:center;margin-bottom:10px">
    <div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;background:linear-gradient(90deg,#e8edf5 25%,#f0f4fb 50%,#e8edf5 75%);background-size:400% 100%;animation:skel 1.5s ease infinite"></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:7px">
      <div style="height:12px;border-radius:6px;width:38%;background:linear-gradient(90deg,#e8edf5 25%,#f0f4fb 50%,#e8edf5 75%);background-size:400% 100%;animation:skel 1.5s ease infinite"></div>
      <div style="height:10px;border-radius:6px;width:60%;background:linear-gradient(90deg,#e8edf5 25%,#f0f4fb 50%,#e8edf5 75%);background-size:400% 100%;animation:skel 1.5s ease infinite"></div>
    </div>
  </div>`;
  return `
  <div style="background:white;border-radius:16px;padding:40px 24px;text-align:center;border:1px solid var(--border);margin-bottom:12px">
    <div style="position:relative;width:72px;height:72px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;background:var(--bg-soft);border-radius:50%;border:2px solid var(--border)">
      <span style="font-size:2rem">📋</span>
      <div style="position:absolute;top:-4px;right:-4px;width:22px;height:22px;border-radius:50%;background:var(--warning);border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:white;font-weight:700">0</div>
    </div>
    <div style="font-size:1rem;font-weight:800;color:var(--navy);margin-bottom:8px">${t('cdp-empty-apps-title')}</div>
    <div style="font-size:.84rem;color:var(--text-muted);max-width:280px;margin:0 auto 20px;line-height:1.6">${t('cdp-empty-apps-text')}</div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button onclick="bizPage('discover')" style="padding:9px 20px;border:none;background:var(--blue);color:white;border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer">${t('cdp-invite-influencers')}</button>
      <button onclick="bizPage('discover')" style="padding:9px 20px;border:1.5px solid var(--border);background:white;color:var(--text-muted);border-radius:8px;font-size:.83rem;font-weight:600;cursor:pointer">${t('cdp-browse-discover')}</button>
    </div>
  </div>
  ${skel}${skel}`;
}

function _campEmptyStateMedium(type) {
  const cfg = {
    approved:  { icon: '👥', title: t('cdp-empty-approved-title'), text: t('cdp-empty-approved-text') },
    content:   { icon: '📸', title: t('cdp-empty-content-title'),  text: t('cdp-empty-content-text')  },
    analytics: { icon: '📊', title: t('cdp-empty-analytics-title'),text: t('cdp-empty-analytics-text') },
    activity:  { icon: '🕐', title: t('cdp-empty-activity-title'), text: t('cdp-empty-activity-text')  },
  };
  const { icon, title, text } = cfg[type] || cfg.analytics;
  return `<div style="background:white;border-radius:14px;padding:48px 24px;text-align:center;border:1px solid var(--border)">
    <div style="font-size:2.4rem;margin-bottom:12px">${icon}</div>
    <div style="font-size:.95rem;font-weight:700;color:var(--navy);margin-bottom:6px">${title}</div>
    <div style="font-size:.83rem;color:var(--text-muted);max-width:240px;margin:0 auto;line-height:1.6">${text}</div>
  </div>`;
}

// ── Applications tab v2 ───────────────────────────────────────────────────────
function _campTabApplications(apps) {
  const filter = S._campDetail?._appFilter || 'all';
  const all = apps || [];
  const byStatus = {
    all:      all,
    pending:  all.filter(a => a.status === 'pending'),
    accepted: all.filter(a => a.status === 'accepted'),
    rejected: all.filter(a => a.status === 'rejected'),
  };
  const filtered = byStatus[filter] || all;

  const pill = (id, label, count) => `
    <button onclick="if(S._campDetail)S._campDetail._appFilter='${id}';setCampDetailTab('applications')" style="
      padding:5px 13px;border-radius:20px;font-size:.78rem;font-weight:600;cursor:pointer;white-space:nowrap;
      ${filter === id ? 'background:var(--blue);color:white;border:none' : 'background:white;color:var(--text-muted);border:1.5px solid var(--border)'}">
      ${label}${count > 0 ? ` (${count})` : ''}
    </button>`;

  const filterPills = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
    ${pill('all',      t('cdp-filter-all'),   all.length)}
    ${pill('pending',  t('status-pending'),   byStatus.pending.length)}
    ${pill('accepted', t('status-accepted'),  byStatus.accepted.length)}
    ${pill('rejected', t('status-rejected'),  byStatus.rejected.length)}
  </div>`;

  if (!filtered.length) return filterPills + _campEmptyStateRich('applications');

  return filterPills + `<div style="display:flex;flex-direction:column;gap:10px">
    ${filtered.map(a => _campAppRowV2(a)).join('')}
  </div>`;
}

function _campAppRowV2(a) {
  const ip       = a.influencer_profiles;
  const name     = ip?.full_name || ip?.name || ip?.username || ip?.handle || 'Unknown';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const er       = ip?.avg_engagement_rate || ip?.engagement_rate;
  const rating   = ip?.avg_rating || ip?.rating;

  const chips = [
    ip?.follower_count ? `<span style="background:#eef2fb;color:var(--blue);border-radius:6px;padding:2px 7px;font-size:.7rem;font-weight:600">${fmtFollowers(ip.follower_count)}</span>` : '',
    er   ? `<span style="background:#f0fff7;color:var(--success);border-radius:6px;padding:2px 7px;font-size:.7rem;font-weight:600">ER ${er}%</span>` : '',
    ip?.niche ? `<span style="background:var(--bg-soft);color:var(--text-muted);border-radius:6px;padding:2px 7px;font-size:.7rem;font-weight:600">${h(ip.niche)}</span>` : '',
  ].filter(Boolean).join('');

  const scoreTag = rating ? `<span style="background:#fffbeb;color:#b87c00;border:1px solid #f5e090;border-radius:20px;padding:2px 8px;font-size:.7rem;font-weight:700">★ ${Number(rating).toFixed(1)}</span>` : '';
  const showActions = a.status === 'pending';

  return `<div style="background:white;border-radius:12px;padding:14px 16px;border:1px solid var(--border)">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;flex-shrink:0;font-size:.9rem">${initials}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;color:var(--navy);font-size:.9rem">${h(name)}${ip?.verified ? ' <span style="color:var(--blue);font-size:.8rem">✓</span>' : ''}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px;align-items:center">${chips}${scoreTag}</div>
      </div>
      ${showActions ? `
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:center">
          <button onclick="campDetailApprove('${a.id}','${S._campDetail?.campId}')" style="padding:7px 16px;border:none;background:var(--success);color:white;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(26,169,113,.35)">${t('app-accept')}</button>
          <button onclick="campDetailReject('${a.id}','${S._campDetail?.campId}')" title="${t('app-reject')}" style="width:34px;height:34px;border:1.5px solid var(--border);background:white;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.85rem;color:var(--danger)">✕</button>
        </div>`
      : `<span class="badge ${a.status==='accepted'?'badge-green':a.status==='rejected'?'badge-red':'badge-blue'}" style="flex-shrink:0">${t('status-'+a.status)||a.status}</span>`}
    </div>
  </div>`;
}

// ── Approved tab v2 ───────────────────────────────────────────────────────────
function _campTabApproved(apps) {
  const accepted = (apps || []).filter(a => a.status === 'accepted');
  if (!accepted.length) return _campEmptyStateMedium('approved');
  const STEPS = [t('cdp-step-approved'), t('cdp-step-content'), t('cdp-step-review'), t('cdp-step-paid')];
  const STAGE_IDX = { approved: 0, content: 1, review: 2, paid: 3 };
  return `<div style="display:flex;flex-direction:column;gap:12px">
    ${accepted.map(a => {
      const ip       = a.influencer_profiles;
      const name     = ip?.full_name || ip?.name || ip?.username || ip?.handle || 'Influencer';
      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const stageIdx = STAGE_IDX[a.stage || 'approved'] ?? 0;
      return `<div style="background:white;border-radius:14px;padding:16px 20px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;flex-shrink:0">${initials}</div>
          <div style="flex:1">
            <div style="font-weight:700;color:var(--navy)">${h(name)}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">${h(ip?.niche||'—')} · ${fmtFollowers(ip?.follower_count)}</div>
          </div>
          ${stageIdx < 3
            ? `<button onclick="campDetailAdvanceStage('${a.id}','${S._campDetail.campId}')" style="padding:6px 14px;border:none;background:var(--blue);color:white;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;flex-shrink:0">${t('cdp-advance-stage')} →</button>`
            : `<span class="badge badge-green" style="flex-shrink:0">${t('cdp-step-paid')}</span>`}
        </div>
        <div style="display:flex;position:relative">
          ${STEPS.map((s, i) => {
            const done   = i <= stageIdx;
            const active = i === stageIdx;
            return `<div style="flex:1;text-align:center;position:relative">
              ${i < STEPS.length - 1 ? `<div style="position:absolute;top:11px;left:50%;right:-50%;height:2px;background:${i < stageIdx ? 'var(--blue)' : 'var(--border)'}"></div>` : ''}
              <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${done?'var(--blue)':'var(--border)'};background:${done?'var(--blue)':'white'};display:flex;align-items:center;justify-content:center;margin:0 auto 6px;position:relative;z-index:1">
                ${done
                  ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                  : `<span style="font-size:.6rem;color:${active?'var(--blue)':'var(--text-muted)'};font-weight:700">${i+1}</span>`}
              </div>
              <div style="font-size:.68rem;font-weight:${active?'700':'400'};color:${active?'var(--blue)':'var(--text-muted)'};line-height:1.3">${s}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── Content tab v2 (grid) ─────────────────────────────────────────────────────
function _campTabContentGrid(content) {
  if (!(content || []).length) return _campEmptyStateMedium('content');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
    ${content.map(cc => {
      const ip = cc.influencer_profiles;
      const name = ip?.full_name || ip?.name || ip?.username || ip?.handle || 'Influencer';
      const statusColor = cc.content_status === 'approved' ? 'var(--success)' : cc.content_status === 'rejected' ? 'var(--danger)' : 'var(--warning)';
      const statusLabel = cc.content_status === 'approved' ? t('cdp-content-approve') : cc.content_status === 'rejected' ? t('cdp-content-reject') : t('status-pending');
      return `<div style="background:white;border-radius:14px;overflow:hidden;border:1px solid var(--border)">
        <div style="position:relative;padding-bottom:75%;background:linear-gradient(135deg,#eef2fb 0%,#dce6fa 100%);overflow:hidden">
          ${cc.content_url ? `<a href="${h(cc.content_url)}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
            <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;font-size:1.2rem;box-shadow:0 2px 12px rgba(0,0,0,.12)">▶</div>
          </a>` : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.35">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg>
          </div>`}
          <div style="position:absolute;top:8px;right:8px;padding:3px 9px;border-radius:20px;font-size:.65rem;font-weight:700;background:white;color:${statusColor};box-shadow:0 1px 4px rgba(0,0,0,.12)">${statusLabel}</div>
        </div>
        <div style="padding:10px 12px">
          <div style="font-size:.83rem;font-weight:700;color:var(--navy)">${h(name)}</div>
          <div style="font-size:.73rem;color:var(--text-muted);margin-top:2px">${h(cc.platform||'—')} · ${h(cc.type||'Post')}${cc.views ? ` · ${fmtFollowers(cc.views)} views` : ''}</div>
          ${cc.content_status === 'pending' ? `
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="campDetailApproveContent('${cc.id}')" style="flex:1;padding:5px;border:none;background:var(--success);color:white;border-radius:6px;font-size:.73rem;font-weight:700;cursor:pointer">${t('cdp-content-approve')}</button>
            <button onclick="campDetailRejectContent('${cc.id}')" style="flex:1;padding:5px;border:1.5px solid var(--danger);background:white;color:var(--danger);border-radius:6px;font-size:.73rem;font-weight:700;cursor:pointer">${t('cdp-content-reject')}</button>
          </div>` : ''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── Analytics tab v2 ──────────────────────────────────────────────────────────
function _campTabAnalytics(d) {
  const c    = d.campaign;
  const apps = d.applications || [];
  const budget      = Number(c?.budget     || 0);
  const spent       = Number(c?.spent      || 0);
  const pct         = budget > 0 ? Math.min(100, Math.round(spent / budget * 100)) : 0;
  const conversions = Number(c?.conversions  || 0);
  const reach       = Number(c?.total_reach  || 0);
  const accepted    = apps.filter(a => a.status === 'accepted');
  const total       = apps.length;
  const acceptRate  = total > 0 ? Math.round(accepted.length / total * 100) : 0;

  const _spark = (values, color) => {
    const max   = Math.max(...values, 1);
    const min   = Math.min(...values, 0);
    const range = max - min || 1;
    const W = 280, H = 70, pad = 8;
    const pts = values.map((v, i) => [
      (pad + (i / (values.length - 1)) * (W - 2 * pad)).toFixed(1),
      (H - pad - ((v - min) / range) * (H - 2 * pad)).toFixed(1),
    ]);
    const ptStr   = pts.map(p => p.join(',')).join(' ');
    const areaStr = [...pts.map(p => p.join(',')), `${W-pad},${H-pad}`, `${pad},${H-pad}`].join(' ');
    const gid     = 'sg' + color.replace(/[^a-z0-9]/gi, '');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".18"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <polygon points="${areaStr}" fill="url(#${gid})"/>
      <polyline points="${ptStr}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="4" fill="${color}"/>
    </svg>`;
  };

  const reachVals = reach > 0
    ? [.08,.18,.32,.48,.68,.85,1].map(f => Math.round(reach * f))
    : [0,0,0,0,0,0,0];
  const convVals = conversions > 0
    ? [0,.1,.22,.4,.6,.8,1].map(f => Math.round(conversions * f))
    : [0,0,0,0,0,0,0];

  if (!apps.length && !reach && !conversions && !spent) return _campEmptyStateMedium('analytics');

  const roiStrip = (spent > 0 || reach > 0 || conversions > 0) ? `
  <div style="background:white;border-radius:14px;padding:14px 18px;border:1px solid var(--border);margin-bottom:14px">
    <h4 style="margin:0 0 12px;color:var(--navy);font-size:.85rem;font-weight:700">ROI</h4>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      ${[
        { label: t('cdp-spent'),          value: `€${spent.toLocaleString()}`,                                                     color: 'var(--blue)'    },
        { label: t('th-reach'),           value: reach ? fmtFollowers(reach) : '—',                                                color: 'var(--navy)'    },
        { label: t('cdp-roi-1k-reach'),   value: (reach > 0 && spent > 0) ? `€${(spent/reach*1000).toFixed(2)}` : '—',            color: 'var(--warning)' },
        { label: t('cdp-roi-per-conv'),   value: (conversions > 0 && spent > 0) ? `€${(spent/conversions).toFixed(2)}` : '—',     color: 'var(--success)' },
      ].map(kpi => `<div style="text-align:center;padding:10px 6px;background:var(--bg-soft);border-radius:10px">
        <div style="font-size:1.05rem;font-weight:800;color:${kpi.color}">${kpi.value}</div>
        <div style="font-size:.67rem;color:var(--text-muted);margin-top:3px;line-height:1.3">${kpi.label}</div>
      </div>`).join('')}
    </div>
  </div>` : '';

  return roiStrip + `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
    <div style="background:white;border-radius:14px;padding:16px 18px;border:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">${t('th-reach')}</div>
      <div style="font-size:1.4rem;font-weight:900;color:var(--navy);margin-bottom:8px">${reach ? fmtFollowers(reach) : '—'}</div>
      ${_spark(reachVals,'#2079FF')}
    </div>
    <div style="background:white;border-radius:14px;padding:16px 18px;border:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">${t('th-conversions')}</div>
      <div style="font-size:1.4rem;font-weight:900;color:var(--navy);margin-bottom:8px">${conversions ? conversions.toLocaleString() : '—'}</div>
      ${_spark(convVals,'#1aa971')}
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px">
    <div style="background:white;border-radius:12px;padding:14px;border:1px solid var(--border);text-align:center">
      <div style="font-size:1.25rem;font-weight:800;color:var(--navy)">${total||'—'}</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:3px">${t('cdp-tab-apps')}</div>
    </div>
    <div style="background:white;border-radius:12px;padding:14px;border:1px solid var(--border);text-align:center">
      <div style="font-size:1.25rem;font-weight:800;color:var(--success)">${total ? acceptRate+'%' : '—'}</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:3px">${t('cdp-accept-rate')}</div>
    </div>
    <div style="background:white;border-radius:12px;padding:14px;border:1px solid var(--border);text-align:center">
      <div style="font-size:1.25rem;font-weight:800;color:var(--navy)">${pct}%</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:3px">${t('cdp-budget-used')}</div>
    </div>
  </div>
  <div style="background:white;border-radius:14px;padding:16px 18px;border:1px solid var(--border);margin-bottom:14px">
    <h4 style="margin:0 0 12px;color:var(--navy);font-size:.85rem;font-weight:700">${t('cdp-apps-breakdown')}</h4>
    <canvas id="cdp-apps-chart" height="140"></canvas>
  </div>
  ${accepted.length ? `
  <div style="background:white;border-radius:14px;padding:16px 18px;border:1px solid var(--border)">
    <h4 style="margin:0 0 12px;color:var(--navy);font-size:.85rem;font-weight:700">${t('cdp-top-performers')}</h4>
    <div style="display:flex;flex-direction:column">
      ${accepted.slice(0, 5).map((a, i, arr) => {
        const ip     = a.influencer_profiles;
        const name   = ip?.full_name || ip?.name || ip?.username || 'Influencer';
        const rating = ip?.avg_rating || ip?.rating;
        return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.72rem;flex-shrink:0">${name.slice(0,2).toUpperCase()}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.82rem;font-weight:700;color:var(--navy)">${h(name)}</div>
            <div style="font-size:.7rem;color:var(--text-muted)">${fmtFollowers(ip?.follower_count)} · ER ${ip?.avg_engagement_rate||ip?.engagement_rate||'—'}%</div>
          </div>
          <div style="font-size:.78rem;font-weight:700;color:#b87c00">${rating ? '★ '+Number(rating).toFixed(1) : '—'}</div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}`;
}

// ── Settings tab ──────────────────────────────────────────────────────────────
function _campTabSettings(c) {
  if (!c) return '';
  const inp = (id, label, val, type = 'text', ph = '') => `
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:.75rem;font-weight:700;color:var(--text-muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em">${label}</label>
      <input id="cdp-set-${id}" type="${type}" value="${h(String(val||''))}" placeholder="${h(ph)}"
        style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;background:var(--bg-soft)"
        onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
    </div>`;
  return `<div style="background:white;border-radius:14px;padding:20px 24px;border:1px solid var(--border)">
    <h4 style="margin:0 0 18px;color:var(--navy)">${t('cdp-tab-settings')}</h4>
    ${inp('name', t('wiz-camp-name-label'), c.name)}
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:.75rem;font-weight:700;color:var(--text-muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em">${t('cd-brief-label')}</label>
      <textarea id="cdp-set-brief" rows="4"
        style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;resize:vertical;background:var(--bg-soft)"
        onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">${h(c.brief||c.description||'')}</textarea>
    </div>
    ${inp('budget',      t('cd-budget'),          c.budget,                      'number')}
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:.75rem;font-weight:700;
        color:var(--text-muted);margin-bottom:5px;
        text-transform:uppercase;letter-spacing:.04em">
        ${t('cdp-add-budget')}
      </label>
      <div style="display:flex;gap:8px">
        <div style="position:relative;flex:1">
          <span style="position:absolute;left:12px;top:50%;
            transform:translateY(-50%);color:var(--text-mid);
            font-weight:600">€</span>
          <input id="cdp-topup-amt" type="number" min="10"
            placeholder="0"
            style="width:100%;padding:10px 14px 10px 26px;
              border:1.5px solid var(--border);border-radius:10px;
              font-size:.9rem;outline:none;box-sizing:border-box"
            onfocus="this.style.borderColor='var(--blue)'"
            onblur="this.style.borderColor='var(--border)'">
        </div>
        <button onclick="campDetailTopUpBudget('${c.id}')"
          style="padding:0 18px;border:none;background:var(--blue);
            color:white;border-radius:10px;font-weight:700;
            cursor:pointer;font-size:.88rem;white-space:nowrap">
          ${t('cdp-topup-btn')}
        </button>
      </div>
      <div style="font-size:.78rem;color:var(--text-mid);margin-top:5px">
        ${t('cdp-topup-note')}
        (${t('w-avail-bal')}: €${(APP.bizWallet?.balance||0).toFixed(2)})
      </div>
    </div>
    ${inp('deadline',    t('cd-deadline-label'),  c.deadline?.slice(0,10)||'',   'date')}
    ${inp('start-date',  t('cdp-start-date'),     c.start_date?.slice(0,10)||'', 'date')}
    ${inp('content-due', t('cdp-content-due'),    c.content_due?.slice(0,10)||'','date')}
    ${inp('deliverables',t('cdp-deliverables'),   c.deliverables||'', 'text', 'e.g. 2 Reels + 3 Stories')}
    <div id="cdp-set-err" style="display:none;color:var(--danger);font-size:.83rem;margin-bottom:12px"></div>
    <button id="cdp-set-save-btn" onclick="campDetailSaveSettings('${c.id}')" style="width:100%;padding:11px;border:none;background:var(--blue);color:white;border-radius:10px;font-size:.9rem;font-weight:700;cursor:pointer">${t('cdp-save-settings')}</button>
  </div>`;
}

// ── Sidebar: Budget (pure SVG donut) ──────────────────────────────────────────
function _campSidebarBudget(c) {
  const budget    = Number(c?.budget || 0);
  const spent     = Number(c?.spent  || 0);
  const remaining = Math.max(0, budget - spent);
  const pct   = budget > 0 ? Math.min(1, spent / budget) : 0;
  const pctPct = Math.round(pct * 100);
  const r = 70, sw = 18, circ = 2 * Math.PI * r;
  const offset = (circ * (1 - pct)).toFixed(2);
  const dotColor = pctPct >= 90 ? 'var(--danger)' : 'var(--blue)';
  return `
  <div style="background:white;border-radius:14px;padding:16px;border:1px solid var(--border)">
    <div style="font-size:.82rem;font-weight:700;color:var(--navy);margin-bottom:12px">${t('cdp-budget-card')}</div>
    <div style="position:relative;width:140px;height:140px;margin:0 auto">
      <svg viewBox="0 0 160 160" width="140" height="140">
        <circle cx="80" cy="80" r="${r}" fill="none" stroke="var(--border)" stroke-width="${sw}"/>
        <circle cx="80" cy="80" r="${r}" fill="none" stroke="${dotColor}" stroke-width="${sw}"
          stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 80 80)"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none">
        <div style="font-size:1.3rem;font-weight:900;color:var(--navy)">${pctPct}%</div>
        <div style="font-size:.63rem;color:var(--text-muted)">${t('cdp-budget-used')}</div>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:5px">
      <div style="display:flex;justify-content:space-between;font-size:.76rem">
        <span style="color:var(--text-muted)">${t('cdp-budget-total')}</span>
        <strong style="color:var(--navy)">€${budget.toLocaleString()}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.76rem">
        <span style="display:flex;align-items:center;gap:4px;color:var(--text-muted)"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${dotColor}"></span>${t('cdp-spent')}</span>
        <strong style="color:var(--navy)">€${spent.toLocaleString()}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.76rem">
        <span style="display:flex;align-items:center;gap:4px;color:var(--text-muted)"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--border)"></span>${t('cdp-remaining')}</span>
        <strong style="color:var(--success)">€${remaining.toLocaleString()}</strong>
      </div>
    </div>
  </div>`;
}

// ── Sidebar: Quick Actions ────────────────────────────────────────────────────
function _campSidebarQuickActions(c) {
  const status = c?.status || 'draft';
  const _setStatus = (newStatus) =>
    `setCampaignStatus('${c.id}','${newStatus}');if(S._campDetail?.campaign)S._campDetail.campaign.status='${newStatus}';setTimeout(()=>{const el=_campDetailEl();if(el&&S._campDetail?.campaign)el.innerHTML=_renderCampDetailFull();},100)`;
  const btnSolid  = 'width:100%;padding:9px;border:none;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;display:block;text-align:center;';
  const btnBorder = 'width:100%;padding:9px;border:1.5px solid;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;display:block;text-align:center;';
  const rows = [
    `<button onclick="bizPage('discover')" style="${btnSolid}background:var(--blue);color:white;margin-bottom:7px">${t('cdp-add-influencer')}</button>`,
    `<button onclick="toast('${t('cdp-export-report')}','info')" style="${btnBorder}border-color:var(--border);background:var(--bg-soft);color:var(--text-muted);margin-bottom:7px">${t('cdp-export-report')}</button>`,
    `<div style="height:1px;background:var(--border);margin:4px 0 8px"></div>`,
  ];
  if (status === 'active')  rows.push(`<button onclick="${_setStatus('paused')}"  style="${btnBorder}border-color:#f5e090;background:#fffbeb;color:#b45309;margin-bottom:7px">⏸ ${t('c-pause-btn')}</button>`);
  if (status === 'paused')  rows.push(`<button onclick="${_setStatus('active')}"  style="${btnBorder}border-color:#b7f0d8;background:#f0fff7;color:var(--success);margin-bottom:7px">▶ ${t('c-resume-btn')}</button>`);
  if (status !== 'completed') rows.push(`<button onclick="campDetailEndCampaign('${c.id}')" style="${btnBorder}border-color:var(--danger);background:white;color:var(--danger)">✕ ${t('cdp-end-campaign')}</button>`);
  return `
  <div style="background:white;border-radius:14px;padding:14px 16px;border:1px solid var(--border)">
    <div style="font-size:.82rem;font-weight:700;color:var(--navy);margin-bottom:10px">${t('cdp-quick-actions')}</div>
    ${rows.join('')}
  </div>`;
}

// ── Sidebar: Timeline v2 ──────────────────────────────────────────────────────
function _campSidebarTimeline(c) {
  const deadline  = c?.deadline    ? new Date(c.deadline)    : null;
  const startDate = c?.start_date  ? new Date(c.start_date)  : null;
  const now = new Date();
  if (!deadline && !startDate && !c?.content_due) return '';

  let daysLeft = null, progress = 0;
  if (deadline) {
    daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (startDate && deadline > startDate) {
      progress = Math.max(0, Math.min(100, Math.round((now - startDate) / (deadline - startDate) * 100)));
    }
  }
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent  = daysLeft !== null && !isOverdue && daysLeft <= 14;
  const dayColor  = isOverdue ? 'var(--danger)' : isUrgent ? 'var(--warning)' : 'var(--blue)';

  return `
  <div style="background:white;border-radius:14px;padding:16px;border:1px solid var(--border)">
    <div style="font-size:.82rem;font-weight:700;color:var(--navy);margin-bottom:10px">${t('cdp-timeline')}</div>
    ${daysLeft !== null ? `
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:2.4rem;font-weight:900;color:${dayColor};line-height:1">${Math.abs(daysLeft)}</div>
      <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">${isOverdue ? t('cdp-days-over') : t('cdp-days-left')}</div>
    </div>
    <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:12px">
      <div style="height:100%;width:${progress}%;background:${isOverdue?'var(--danger)':'var(--blue)'};border-radius:3px"></div>
    </div>` : ''}
    ${c?.start_date  ? `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:.76rem"><span style="color:var(--text-muted)">${t('cdp-start-date')}</span><span style="font-weight:700;color:var(--navy)">${c.start_date.slice(0,10)}</span></div>` : ''}
    ${c?.content_due ? `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:.76rem"><span style="color:var(--text-muted)">${t('cdp-content-due')}</span><span style="font-weight:700;color:var(--navy)">${c.content_due.slice(0,10)}</span></div>` : ''}
    ${deadline       ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:.76rem"><span style="color:var(--text-muted)">${t('cd-deadline-label')}</span><span style="font-weight:700;color:${dayColor}">${c.deadline.slice(0,10)}</span></div>` : ''}
  </div>`;
}

// ── Sidebar: Activity feed ────────────────────────────────────────────────────
function _campSidebarActivity(activity) {
  const tintMap = { blue:'var(--blue)', green:'var(--success)', yellow:'var(--warning)', red:'var(--danger)', purple:'#7c3aed' };
  const items   = activity || [];
  return `
  <div style="background:white;border-radius:14px;padding:16px;border:1px solid var(--border)">
    <div style="font-size:.82rem;font-weight:700;color:var(--navy);margin-bottom:10px">${t('cdp-activity')}</div>
    <div id="cdp-activity-list" style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto">
      ${items.length
        ? items.map(ev => _activityItem(ev, tintMap)).join('')
        : `<div style="text-align:center;padding:24px 16px">
            <div style="font-size:1.8rem;margin-bottom:8px">🕐</div>
            <div style="font-size:.8rem;font-weight:700;color:var(--navy);margin-bottom:4px">${t('cdp-empty-activity-title')}</div>
            <div style="font-size:.73rem;color:var(--text-muted);line-height:1.5">${t('cdp-empty-activity-text')}</div>
          </div>`}
    </div>
  </div>`;
}

function _activityItem(ev, tintMap) {
  const tm = tintMap || { blue:'var(--blue)', green:'var(--success)', yellow:'var(--warning)', red:'var(--danger)', purple:'#7c3aed' };
  return `<div style="display:flex;gap:9px;align-items:flex-start">
    <div style="width:26px;height:26px;border-radius:8px;background:${(tm[ev.tint]||'var(--blue)')}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.8rem">${ev.icon||'📌'}</div>
    <div style="flex:1;min-width:0">
      <div style="font-size:.76rem;color:var(--navy);word-break:break-word">${h(ev.text||'')}</div>
      <div style="font-size:.68rem;color:var(--text-muted);margin-top:2px">${ev.created_at?.slice(0,10)||''}</div>
    </div>
  </div>`;
}

// ── Tab switch ────────────────────────────────────────────────────────────────
function setCampDetailTab(tab) {
  if (!S._campDetail) return;
  S._campDetail.tab = tab;
  const barWrap    = document.getElementById('cdp-tab-bar-wrap');
  const tabContent = document.getElementById('cdp-tab-content');
  if (barWrap)    barWrap.innerHTML    = _campDetailTabBar(tab, S._campDetail.applications, S._campDetail.content);
  if (tabContent) tabContent.innerHTML = _campDetailTabContent(S._campDetail);
  if (tab === 'analytics') setTimeout(_initCampDetailCharts, 50);
}

// ── Approve / Reject application ──────────────────────────────────────────────
async function campDetailApprove(appId, campId) {
  if (APP.user) {
    const { error } = await _sb.from('campaign_applications').update({ status: 'accepted' }).eq('id', appId);
    if (error) { toast(error.message, 'error'); return; }
    await _sb.from('campaign_activity').insert({ campaign_id: campId, icon: '✅', text: 'Application accepted', tint: 'green' }).select();
  }
  const a = S._campDetail?.applications?.find(x => x.id === appId);
  if (a) a.status = 'accepted';
  _refreshTabAndKpi(campId);
  toast(t('app-accept'), 'success');
}

async function campDetailReject(appId, campId) {
  if (APP.user) {
    const { error } = await _sb.from('campaign_applications').update({ status: 'rejected' }).eq('id', appId);
    if (error) { toast(error.message, 'error'); return; }
  }
  const a = S._campDetail?.applications?.find(x => x.id === appId);
  if (a) a.status = 'rejected';
  _refreshTabAndKpi(campId);
  toast(t('app-reject'), 'info');
}

function _refreshTabAndKpi(campId) {
  const tabContent = document.getElementById('cdp-tab-content');
  if (tabContent) tabContent.innerHTML = _campDetailTabContent(S._campDetail);
  const barWrap = document.getElementById('cdp-tab-bar-wrap');
  if (barWrap) barWrap.innerHTML = _campDetailTabBar(S._campDetail.tab, S._campDetail.applications, S._campDetail.content);
  const kpiEl = document.getElementById('cdp-kpi-strip');
  if (kpiEl) kpiEl.innerHTML = _campKpiStripInner(S._campDetail.campaign, S._campDetail.applications);
  if (campId) _refreshActivityFeed(campId);
}

// ── Advance stage ─────────────────────────────────────────────────────────────
async function campDetailAdvanceStage(appId, campId) {
  const STAGES = ['approved', 'content', 'review', 'paid'];
  const a = S._campDetail?.applications?.find(x => x.id === appId);
  if (!a) return;
  const cur = STAGES.indexOf(a.stage || 'approved');
  if (cur >= STAGES.length - 1) return;
  const next = STAGES[cur + 1];
  if (APP.user) {
    const { error } = await _sb.from('campaign_applications').update({ stage: next }).eq('id', appId);
    if (error) { toast(error.message, 'error'); return; }
    const ip = a.influencer_profiles;
    const name = ip?.full_name || ip?.name || ip?.username || 'Influencer';
    await _sb.from('campaign_activity').insert({ campaign_id: campId, icon: '📊', text: `${name} → stage: ${next}`, tint: 'blue' }).select();
  }
  a.stage = next;
  const tabContent = document.getElementById('cdp-tab-content');
  if (tabContent) tabContent.innerHTML = _campDetailTabContent(S._campDetail);
  _refreshActivityFeed(campId);
  toast(`Stage: ${next}`, 'success');
}

// ── Content approve / reject ──────────────────────────────────────────────────
async function campDetailApproveContent(contentId) {
  if (APP.user) {
    const { error } = await _sb.from('campaign_content').update({ content_status: 'approved', updated_at: new Date().toISOString() }).eq('id', contentId);
    if (error) { toast(error.message, 'error'); return; }
  }
  const cc = S._campDetail?.content?.find(x => x.id === contentId);
  if (cc) cc.content_status = 'approved';
  const tabContent = document.getElementById('cdp-tab-content');
  if (tabContent) tabContent.innerHTML = _campDetailTabContent(S._campDetail);
  toast(t('cdp-content-approve'), 'success');
}

async function campDetailRejectContent(contentId) {
  if (APP.user) {
    const { error } = await _sb.from('campaign_content').update({ content_status: 'rejected', updated_at: new Date().toISOString() }).eq('id', contentId);
    if (error) { toast(error.message, 'error'); return; }
  }
  const cc = S._campDetail?.content?.find(x => x.id === contentId);
  if (cc) cc.content_status = 'rejected';
  const tabContent = document.getElementById('cdp-tab-content');
  if (tabContent) tabContent.innerHTML = _campDetailTabContent(S._campDetail);
  toast(t('cdp-content-reject'), 'info');
}

// ── End campaign (irreversible — confirm dialog required) ─────────────────────
async function campDetailEndCampaign(campId) {
  if (!confirm(t('cdp-end-confirm'))) return;
  if (APP.user) {
    const { error } = await _sb.from('campaigns').update({ status: 'completed' }).eq('id', campId);
    if (error) { toast(error.message, 'error'); return; }
  }
  if (S._campDetail?.campaign) S._campDetail.campaign.status = 'completed';
  const bcamp = BIZ_CAMPAIGNS.find(x => String(x.id) === String(campId));
  if (bcamp) bcamp.status = 'completed';
  const el = _campDetailEl();
  if (el) el.innerHTML = _renderCampDetailFull();
  toast('Campaign ended', 'info');
}

// ── Save settings ─────────────────────────────────────────────────────────────
async function campDetailSaveSettings(campId) {
  const btn   = document.getElementById('cdp-set-save-btn');
  const errEl = document.getElementById('cdp-set-err');
  if (btn)   { btn.disabled = true; btn.textContent = t('btn-saving'); }
  if (errEl)   errEl.style.display = 'none';

  const name        = document.getElementById('cdp-set-name')?.value?.trim();
  const brief       = document.getElementById('cdp-set-brief')?.value?.trim();
  const budget      = parseFloat(document.getElementById('cdp-set-budget')?.value) || 0;
  const deadline    = document.getElementById('cdp-set-deadline')?.value    || null;
  const startDate   = document.getElementById('cdp-set-start-date')?.value  || null;
  const contentDue  = document.getElementById('cdp-set-content-due')?.value || null;
  const deliverables= document.getElementById('cdp-set-deliverables')?.value?.trim() || null;

  if (!name) {
    if (errEl) { errEl.textContent = t('err-camp-name-brief'); errEl.style.display = 'block'; }
    if (btn)   { btn.disabled = false; btn.textContent = t('cdp-save-settings'); }
    return;
  }

  if (APP.user) {
    const { error } = await _sb.from('campaigns').update({
      name, brief, description: brief, budget,
      deadline: deadline || null, start_date: startDate || null,
      content_due: contentDue || null, deliverables: deliverables || null,
    }).eq('id', campId);
    if (error) {
      if (errEl) { errEl.textContent = error.message; errEl.style.display = 'block'; }
      if (btn)   { btn.disabled = false; btn.textContent = t('cdp-save-settings'); }
      return;
    }
  }

  if (S._campDetail?.campaign) {
    Object.assign(S._campDetail.campaign, { name, brief, description: brief, budget, deadline, start_date: startDate, content_due: contentDue, deliverables });
  }
  const bcamp = BIZ_CAMPAIGNS.find(x => String(x.id) === String(campId));
  if (bcamp) bcamp.name = name;
  if (btn) { btn.disabled = false; btn.textContent = t('cdp-save-settings'); }
  toast(t('cdp-saved'), 'success');
}

// ── Budget top-up ─────────────────────────────────────────────────────────────
async function campDetailTopUpBudget(campId) {
  const input = document.getElementById('cdp-topup-amt');
  const amt = parseFloat(input?.value);
  if (!amt || amt < 10) {
    toast(t('cdp-topup-min'), 'error'); return;
  }
  const wallet = APP.bizWallet;
  if (!wallet || Number(wallet.balance) < amt) {
    toast(t('w-insufficient') || 'Nedostatočný zostatok', 'error'); return;
  }
  if (!APP.profileId) {
    // Demo mode
    if (S._campDetail?.campaign)
      S._campDetail.campaign.budget = (Number(S._campDetail.campaign.budget || 0)) + amt;
    APP.bizWallet.balance = (Number(APP.bizWallet.balance)) - amt;
    toast(t('cdp-topup-success'), 'success');
    bizPage('campaign-detail'); return;
  }
  const { error } = await _sb.from('campaigns')
    .update({ budget: (Number(S._campDetail.campaign.budget || 0)) + amt })
    .eq('id', campId);
  if (error) { toast(error.message, 'error'); return; }
  await _sb.from('biz_wallet_transactions').insert({
    biz_wallet_id: wallet.id,
    type: 'campaign_topup',
    amount: amt,
    description: `Budget doplnený — ${S._campDetail.campaign.name}`,
    status: 'completed',
  });
  await _sb.from('biz_wallets')
    .update({ balance: Number(wallet.balance) - amt })
    .eq('id', wallet.id);
  APP.bizWallet.balance = Number(wallet.balance) - amt;
  if (S._campDetail?.campaign)
    S._campDetail.campaign.budget = Number(S._campDetail.campaign.budget || 0) + amt;
  toast(t('cdp-topup-success'), 'success');
  bizPage('campaign-detail');
}

// ── Back ──────────────────────────────────────────────────────────────────────
function campDetailBack() {
  if (S._campDetail?._activityChannel) { try { S._campDetail._activityChannel.unsubscribe(); } catch(e) {} }
  if (S._campDetail?._appsChannel)     { try { S._campDetail._appsChannel.unsubscribe();     } catch(e) {} }
  S._campDetail = null;
  bizPage('campaigns');
}

// ── Real-time: activity feed ──────────────────────────────────────────────────
function _subscribeActivityFeed(campId) {
  if (!APP.user) return;
  const ch = _sb.channel('cdp-activity-' + campId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'campaign_activity',
      filter: `campaign_id=eq.${campId}`,
    }, payload => {
      if (S._campDetail) S._campDetail.activity = [payload.new, ...(S._campDetail.activity || [])].slice(0, 20);
      const list = document.getElementById('cdp-activity-list');
      if (list) {
        list.insertAdjacentHTML('afterbegin', _activityItem(payload.new));
        const emptyDiv = list.querySelector('div[style*="text-align:center"]');
        if (emptyDiv) emptyDiv.remove();
      }
    }).subscribe();
  if (S._campDetail) S._campDetail._activityChannel = ch;
}

// ── Real-time: new applications ───────────────────────────────────────────────
function _subscribeApplicationsFeed(campId) {
  if (!APP.user) return;
  const ch = _sb.channel('cdp-apps-' + campId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'campaign_applications',
      filter: `campaign_id=eq.${campId}`,
    }, async payload => {
      const { data } = await _sb.from('campaign_applications')
        .select('*, influencer_profiles(id,user_id,full_name,name,username,handle,niche,follower_count,avg_rating,rating,avg_engagement_rate,engagement_rate,verified,avatar_url)')
        .eq('id', payload.new.id).single();
      if (!data || !S._campDetail) return;
      S._campDetail.applications = [data, ...S._campDetail.applications];
      const barWrap = document.getElementById('cdp-tab-bar-wrap');
      if (barWrap) barWrap.innerHTML = _campDetailTabBar(S._campDetail.tab, S._campDetail.applications, S._campDetail.content);
      const kpiEl = document.getElementById('cdp-kpi-strip');
      if (kpiEl) kpiEl.innerHTML = _campKpiStripInner(S._campDetail.campaign, S._campDetail.applications);
      if (S._campDetail.tab === 'applications') {
        const tabContent = document.getElementById('cdp-tab-content');
        if (tabContent) tabContent.innerHTML = _campDetailTabContent(S._campDetail);
      }
    }).subscribe();
  if (S._campDetail) S._campDetail._appsChannel = ch;
}

async function _refreshActivityFeed(campId) {
  if (!APP.user || !campId) return;
  const { data } = await _sb.from('campaign_activity').select('*').eq('campaign_id', campId).order('created_at', { ascending: false }).limit(20);
  if (data && S._campDetail) S._campDetail.activity = data;
  const list = document.getElementById('cdp-activity-list');
  if (!list) return;
  const tintMap = { blue:'var(--blue)', green:'var(--success)', yellow:'var(--warning)', red:'var(--danger)', purple:'#7c3aed' };
  list.innerHTML = (data || []).length
    ? data.map(ev => _activityItem(ev, tintMap)).join('')
    : `<div style="text-align:center;padding:24px 16px"><div style="font-size:1.8rem;margin-bottom:8px">🕐</div><div style="font-size:.8rem;font-weight:700;color:var(--navy);margin-bottom:4px">${t('cdp-empty-activity-title')}</div><div style="font-size:.73rem;color:var(--text-muted);line-height:1.5">${t('cdp-empty-activity-text')}</div></div>`;
}

// ── Charts (analytics tab only — no longer used for budget donut) ─────────────
function _initCampDetailCharts() {
  const apps      = S._campDetail?.applications || [];
  const analyticsEl = document.getElementById('cdp-apps-chart');
  if (!analyticsEl) return;
  const pending  = apps.filter(a => a.status === 'pending').length;
  const accepted = apps.filter(a => a.status === 'accepted').length;
  const rejected = apps.filter(a => a.status === 'rejected').length;
  if (S.charts['cdp-apps']) { try { S.charts['cdp-apps'].destroy(); } catch(e) {} }
  S.charts['cdp-apps'] = new Chart(analyticsEl, {
    type: 'bar',
    data: {
      labels: [t('status-pending'), t('status-accepted'), t('status-rejected')],
      datasets: [{ data: [pending, accepted, rejected], backgroundColor: ['#e89b1a','#1aa971','#e94b4b'], borderRadius: 8, borderWidth: 0 }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,.04)' } },
        x: { grid: { display: false } },
      },
      animation: { duration: 300 },
    },
  });
}
