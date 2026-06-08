// ══════════════════ INFLUENCER RENDER FUNCTIONS ═══════════════════════════

function renderInflDashboard() {
  const pd = renderInflProfileData();
  const activeCamps = INFL_CAMPAIGNS.filter(c=>c.applied && c.status==='active').length;
  const appliedCamps = INFL_CAMPAIGNS.filter(c=>c.applied).length;
  return `
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px">
    ${statCard(t('d-total-earnings'), APP.profile?.total_earnings ? `€${APP.profile.total_earnings.toLocaleString()}` : '€0', t('d-lifetime'), '', 'coin')}
    ${statCard(t('d-active-camps'), activeCamps || appliedCamps || '0', `${appliedCamps} ${t('c-applied-count')}`, activeCamps ? 'up' : '', 'megaphone')}
    ${statCard(t('d-followers'), pd.followers, t('d-across-plat'), 'up', 'eye')}
    ${statCard(t('d-avg-er'), pd.er, t('d-er-label'), pd.er !== '—' ? 'up' : '', 'bar-chart')}
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:28px">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <h3 style="color:var(--navy);margin:0">${t('d-my-camps')}</h3>
        <button class="btn btn-primary" style="padding:8px 16px;font-size:.85rem" onclick="S._brandFilter=null;S._brandCampaigns=[];inflPage('campaigns')">${t('d-browse-more')}</button>
      </div>
      <table class="data-table">
        <thead><tr><th>${t('th-campaign')}</th><th>${t('th-brand')}</th><th>${t('th-type')}</th><th>${t('th-status')}</th><th>${t('th-reward')}</th></tr></thead>
        <tbody>
          ${INFL_CAMPAIGNS.filter(c=>c.applied).map(c=>`<tr>
            <td style="font-weight:600">${h(c.name)}</td>
            <td style="color:var(--text-mid)">${c.brand}</td>
            <td>${typeBadge(c.type)}</td>
            <td>${statusBadge(c.status)}</td>
            <td style="font-weight:700;color:var(--blue)">${c.reward}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px">
      <div class="card">
        <h4 style="margin:0 0 16px;color:var(--navy)">${t('d-quick-actions')}</h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-secondary" style="width:100%;justify-content:flex-start;gap:10px" onclick="S._brandFilter=null;S._brandCampaigns=[];inflPage('campaigns')"><svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><use href="#ico-campaigns"/></svg> ${t('d-browse-camps')}</button>
          <button class="btn btn-secondary" style="width:100%;justify-content:flex-start;gap:10px" onclick="inflPage('analytics')"><svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><use href="#ico-analytics"/></svg> ${t('d-view-analytics')}</button>
          <button class="btn btn-secondary" style="width:100%;justify-content:flex-start;gap:10px" onclick="inflPage('profile')"><svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><use href="#ico-profile"/></svg> ${t('d-edit-profile')}</button>
        </div>
      </div>
      <div class="card">
        <h4 style="margin:0 0 14px;color:var(--navy)">${t('d-wallet-lbl')}</h4>
        <div style="font-size:2rem;font-weight:800;color:var(--navy)">€${Number(APP.wallet?.balance||0).toLocaleString()}</div>
        <div style="font-size:.82rem;color:var(--text-mid);margin:4px 0 14px">${t('d-avail-withdraw')}</div>
        <button class="btn btn-secondary" style="width:100%;padding:9px" onclick="inflPage('wallet')">${t('d-withdraw')}</button>
      </div>
    </div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <h3 style="color:var(--navy);margin:0">${t('d-rec-camps')}</h3>
      <button class="btn btn-secondary" style="padding:7px 14px;font-size:.85rem" onclick="S._brandFilter=null;S._brandCampaigns=[];inflPage('campaigns')">${t('d-see-all')}</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
      ${INFL_CAMPAIGNS.filter(c=>!c.applied).slice(0,3).map(c=>`
      <div class="campaign-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          ${typeBadge(c.type)}
          <span style="font-size:.78rem;color:var(--text-mid)">${t('d-due')} ${c.deadline}</span>
        </div>
        <div style="font-weight:800;color:var(--navy);margin-bottom:4px">${h(c.name)}</div>
        <div style="font-size:.85rem;color:var(--text-mid);margin-bottom:12px">${c.brand}</div>
        <div style="font-weight:700;color:var(--blue);margin-bottom:14px">${c.reward}</div>
        <button class="btn btn-primary" style="width:100%;padding:8px;font-size:.85rem" onclick="applyToCampaign('${c.id}')">${t('d-apply-now')}</button>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderInflCampaigns() {
  const isBrandView = !!S._brandFilter;
  const campaigns = isBrandView ? S._brandCampaigns : INFL_CAMPAIGNS;
  const header = isBrandView
    ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <button class="btn btn-secondary" style="padding:6px 14px;font-size:.85rem;margin-bottom:10px" onclick="S._brandFilter=null;S._brandCampaigns=[];inflPage('discover')">← ${t('nav-sidebar-discover')}</button>
          <h2 style="color:var(--navy);margin:0 0 4px">${h(S._brandFilter.name)}</h2>
          <p style="color:var(--text-mid);margin:0;font-size:.9rem">${campaigns.length} ${t('c-infl-available')} · ${campaigns.filter(c=>c.applied).length} ${t('c-applied-count')}</p>
        </div>
      </div>`
    : `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <h2 style="color:var(--navy);margin:0 0 4px">${t('c-my-camps')}</h2>
          <p style="color:var(--text-mid);margin:0;font-size:.9rem">${campaigns.length} ${t('c-infl-available')} · ${campaigns.filter(c=>c.applied).length} ${t('c-applied-count')}</p>
        </div>
      </div>`;
  return `${header}
  <div class="filter-bar">
    <select onchange="filterInflCampaigns()"><option>${t('f-all-types')}</option><option>Affiliate</option><option>Fixed</option><option>Barter</option><option>Hybrid</option></select>
    <select onchange="filterInflCampaigns()"><option>${t('f-all-industries')}</option><option>Fashion</option><option>Beauty</option><option>Fitness</option><option>Food</option><option>Tech</option></select>
    <input type="text" placeholder="${t('f-search-camps')}" style="min-width:180px" oninput="filterInflCampaigns()">
  </div>
  <div id="infl-camp-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px">
    ${campaigns.map(c=>`
    <div class="campaign-card" id="camp-${c.id}" style="cursor:pointer" onclick="showCampDetail('${c.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>${typeBadge(c.type)} ${c.applied ? `<span class="badge badge-green" style="margin-left:4px">${t('c-applied-badge')}</span>` : ''}</div>
        <span style="font-size:.78rem;color:var(--text-mid)">${t('d-due')} ${c.deadline}</span>
      </div>
      <div style="font-weight:800;color:var(--navy);font-size:1.05rem;margin-bottom:4px">${h(c.name)}</div>
      <div style="font-size:.88rem;color:var(--text-mid);margin-bottom:12px;display:flex;align-items:center;gap:5px"><svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--text-mid)"><use href="#ico-building"/></svg> ${c.brand}</div>
      <div style="padding:12px;background:var(--blue-light);border-radius:10px;margin-bottom:14px">
        <div style="font-size:.78rem;color:var(--text-mid);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">${t('c-reward-label')}</div>
        <div style="font-weight:800;color:var(--blue);font-size:1.05rem">${c.reward}</div>
        ${(() => {
          if ((c.type||'').toLowerCase() !== 'barter') return '';
          try {
            const req = typeof c.requirements === 'string' ? JSON.parse(c.requirements) : (c.requirements || {});
            const bQty = req.barter_qty || null;
            const bProd = req.barterProduct || t('wiz-barter-product-label') || 'Produkt';
            if (!bQty) return '';
            return `<div style="font-size:.82rem;color:var(--text-mid);margin-top:4px">${h(bProd)} · ${bQty} ${t('inv-free-slots')||'voľných'}</div>`;
          } catch { return ''; }
        })()}
      </div>
      <div style="display:flex;gap:8px">
        ${c.status === 'completed'
          ? `<button data-bizid="${c._raw?.business_id||''}" data-brand="${h(c.brand)}" data-campid="${c.id}" data-campname="${h(c.name)}" onclick="event.stopPropagation();showRatingModal(this.dataset.bizid,this.dataset.brand,this.dataset.campid,this.dataset.campname,'business')" style="flex:1;padding:9px;border:1.5px solid #f59e0b;background:#fffbeb;color:#92400e;border-radius:9px;font-weight:700;font-size:.85rem;cursor:pointer">${t('c-rate-brand')}</button>`
          : c.applied
          ? `<button onclick="event.stopPropagation()" style="flex:1;padding:9px;border:1.5px solid #10b981;background:#f0fdf4;color:#065f46;border-radius:9px;font-weight:700;font-size:.85rem;cursor:default">✓ ${t('c-applied-badge')}</button>
             <button onclick="event.stopPropagation();openChatWith('${c.brandId}',${h(JSON.stringify(c.brand))},'influencer')" style="padding:9px 14px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:9px;font-size:.85rem;cursor:pointer;color:var(--blue);font-weight:600;display:inline-flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-messages"/></svg> ${t('c-chat')}</button>`
          : `<button class="btn btn-primary" style="flex:1;padding:9px;font-size:.85rem" onclick="event.stopPropagation();applyToCampaign('${c.id}')">${t('d-apply-now')}</button>
             <button onclick="event.stopPropagation();openChatWith('${c.brandId}',${h(JSON.stringify(c.brand))},'influencer')" style="padding:9px 14px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:9px;font-size:.85rem;cursor:pointer;color:var(--blue);font-weight:600">${t('c-ask')}</button>`
        }
      </div>
    </div>`).join('')}
  </div>`;
}

function filterInflCampaigns() {
  const selects = document.querySelectorAll('#infl-content .filter-bar select');
  const search  = document.querySelector('#infl-content .filter-bar input');
  const typeFilter     = selects[0]?.selectedIndex > 0 ? selects[0].value : null;
  const industryFilter = selects[1]?.selectedIndex > 0 ? selects[1].value : null;
  const q = search?.value?.toLowerCase() || '';
  const source = S._brandFilter ? S._brandCampaigns : INFL_CAMPAIGNS;
  const filtered = source.filter(c => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (industryFilter && c.industry !== industryFilter) return false;
    if (q && !c.name.toLowerCase().includes(q) && !(c.brand||'').toLowerCase().includes(q)) return false;
    return true;
  });
  const grid = document.getElementById('infl-camp-grid');
  if (!grid) return;
  grid.innerHTML = filtered.map(c => `
    <div class="campaign-card" id="camp-${c.id}" style="cursor:pointer" onclick="showCampDetail('${c.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>${typeBadge(c.type)} ${c.applied ? `<span class="badge badge-green" style="margin-left:4px">${t('c-applied-badge')}</span>` : ''}</div>
        <span style="font-size:.78rem;color:var(--text-mid)">${t('d-due')} ${c.deadline}</span>
      </div>
      <div style="font-weight:800;color:var(--navy);font-size:1.05rem;margin-bottom:4px">${h(c.name)}</div>
      <div style="font-size:.88rem;color:var(--text-mid);margin-bottom:12px;display:flex;align-items:center;gap:5px"><svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--text-mid)"><use href="#ico-building"/></svg> ${c.brand}</div>
      <div style="padding:12px;background:var(--blue-light);border-radius:10px;margin-bottom:14px">
        <div style="font-size:.78rem;color:var(--text-mid);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">${t('c-reward-label')}</div>
        <div style="font-weight:800;color:var(--blue);font-size:1.05rem">${c.reward}</div>
        ${(() => {
          if ((c.type||'').toLowerCase() !== 'barter') return '';
          try {
            const req = typeof c.requirements === 'string' ? JSON.parse(c.requirements) : (c.requirements || {});
            const bQty = req.barter_qty || null;
            const bProd = req.barterProduct || t('wiz-barter-product-label') || 'Produkt';
            if (!bQty) return '';
            return `<div style="font-size:.82rem;color:var(--text-mid);margin-top:4px">${h(bProd)} · ${bQty} ${t('inv-free-slots')||'voľných'}</div>`;
          } catch { return ''; }
        })()}
      </div>
      <div style="display:flex;gap:8px">
        ${c.status === 'completed'
          ? `<button data-bizid="${c._raw?.business_id||''}" data-brand="${h(c.brand)}" data-campid="${c.id}" data-campname="${h(c.name)}" onclick="event.stopPropagation();showRatingModal(this.dataset.bizid,this.dataset.brand,this.dataset.campid,this.dataset.campname,'business')" style="flex:1;padding:9px;border:1.5px solid #f59e0b;background:#fffbeb;color:#92400e;border-radius:9px;font-weight:700;font-size:.85rem;cursor:pointer">${t('c-rate-brand')}</button>`
          : c.applied
          ? `<button onclick="event.stopPropagation()" style="flex:1;padding:9px;border:1.5px solid #10b981;background:#f0fdf4;color:#065f46;border-radius:9px;font-weight:700;font-size:.85rem;cursor:default">✓ ${t('c-applied-badge')}</button>
             <button onclick="event.stopPropagation();openChatWith('${c.brandId}',${h(JSON.stringify(c.brand))},'influencer')" style="padding:9px 14px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:9px;font-size:.85rem;cursor:pointer;color:var(--blue);font-weight:600;display:inline-flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-messages"/></svg> ${t('c-chat')}</button>`
          : `<button class="btn btn-primary" style="flex:1;padding:9px;font-size:.85rem" onclick="event.stopPropagation();applyToCampaign('${c.id}')">${t('d-apply-now')}</button>
             <button onclick="event.stopPropagation();openChatWith('${c.brandId}',${h(JSON.stringify(c.brand))},'influencer')" style="padding:9px 14px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:9px;font-size:.85rem;cursor:pointer;color:var(--blue);font-weight:600">${t('c-ask')}</button>`
        }
      </div>
    </div>`).join('');
}

// ── Brand card helpers ─────────────────────────────────────────────────────
const _BRANDS_DEMO = [
  {name:'Zara Slovakia',industry:'Fashion',campaigns:3,verified:true,rating:4.5},
  {name:'FitTrack App',industry:'Fitness',campaigns:2,verified:true,rating:4.8},
  {name:'BeanBox Coffee',industry:'Food',campaigns:1,verified:false,rating:4.2},
  {name:'SitPro Gaming',industry:'Gaming',campaigns:2,verified:true,rating:4.6},
  {name:'NomadGear',industry:'Travel',campaigns:4,verified:true,rating:4.7},
  {name:'GlowCo Beauty',industry:'Beauty',campaigns:3,verified:true,rating:4.4},
];
const _INDUSTRY_COLORS = {Fashion:'#1a1a1a',Fitness:'#10b981',Food:'#92400e',Gaming:'#7c3aed',Travel:'#2079FF',Beauty:'#db2777'};
function _brandColor(industry) { return _INDUSTRY_COLORS[industry] || '#4A6FA5'; }
function _brandInitials(name) { return (name||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }
function _brandCard(b) {
  return `<div class="card" style="cursor:pointer;transition:.2s;padding:0;overflow:hidden"
    data-bid="${b.id||''}" data-bname="${h(b.name||'')}"
    onclick="viewBrandProfile(this.dataset.bid||null,this.dataset.bname)"
    onmouseover="this.style.transform='translateY(-2px)'"
    onmouseout="this.style.transform='none'">
    ${b.banner_url ? `<div style="height:64px;background:url('${h(b.banner_url)}') center/cover no-repeat;border-radius:0"></div>` : ''}
    <div style="padding:16px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      ${b.logo_url ? `<div style="width:54px;height:54px;border-radius:14px;overflow:hidden;flex-shrink:0;border:2px solid var(--border)"><img src="${h(b.logo_url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.background='${_brandColor(b.industry)}';this.parentNode.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:1.1rem;font-weight:800\\'>${_brandInitials(b.name)}</span>'"></div>` : `<div style="width:54px;height:54px;border-radius:14px;background:${_brandColor(b.industry)};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:1.1rem;font-weight:800">${_brandInitials(b.name)}</div>`}
      <div><div style="font-weight:800;color:var(--navy);display:flex;align-items:center;gap:5px">${b.name}${b.verified?'<svg width="13" height="13" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-check-circle"/></svg>':''}</div>
      <div style="font-size:.82rem;color:var(--text-mid)">${b.industry||'General'}</div></div>
    </div>
    ${b.rating ? `<div style="display:flex;align-items:center;gap:4px;margin-bottom:10px"><span style="color:#f59e0b;font-size:1rem">★</span><span style="font-size:.85rem;font-weight:700;color:var(--navy)">${Number(b.rating).toFixed(1)}</span></div>` : ''}
    <div style="font-size:.85rem;color:var(--text-mid);margin-bottom:14px">${b.campaigns||0} ${b.campaigns===1?t('brand-active-camp'):t('brand-active-camps')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn btn-primary"
        style="padding:8px;font-size:.82rem"
        onclick="event.stopPropagation();viewBrandProfile(this.closest('[data-bid]').dataset.bid||null,this.closest('[data-bid]').dataset.bname)">
        ${t('c-view-profile')}
      </button>
      <button style="padding:8px;border:1.5px solid var(--blue-mid);
        background:var(--blue-light);border-radius:8px;
        font-size:.82rem;cursor:pointer;color:var(--blue);font-weight:600"
        onclick="event.stopPropagation();openChatWith(this.closest('[data-bid]').dataset.bid||null,this.closest('[data-bid]').dataset.bname,'influencer')">
        ${t('ic-message') || 'Napísať'}
      </button>
    </div>
    </div>
  </div>`;
}

async function viewBrandCampaigns(bizId, bizName) {
  if (!APP.user || !bizId) {
    S._brandFilter = { id: 0, name: bizName };
    S._brandCampaigns = INFL_CAMPAIGNS.filter(c => c.brand === bizName);
    inflPage('campaigns');
    return;
  }
  const { data, error } = await _sb.from('campaigns')
    .select('*, campaign_applications!left(id,status,influencer_id)')
    .eq('business_id', bizId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) { toast(t('err-load-campaigns'), 'error'); return; }
  S._brandFilter = { id: bizId, name: bizName };
  S._brandCampaigns = (data || []).map(r => ({
    id: r.id,
    name: r.name || 'Untitled',
    brand: bizName,
    brandId: bizId,
    type: r.campaign_type || r.type || 'fixed',
    status: r.status,
    reward: r.reward_amount ? `€${Number(r.reward_amount).toLocaleString()}` : (r.commission_rate ? `${r.commission_rate}%` : '—'),
    deadline: r.deadline || '—',
    applied: !!(r.campaign_applications || []).find(a => a.influencer_id === APP.profileId && a.status !== 'rejected'),
    _raw: r,
  }));
  inflPage('campaigns');
}

function showCampDetail(id) {
  const c = INFL_CAMPAIGNS.find(x => x.id === id);
  if (!c) return;
  const r = c._raw || {};
  document.getElementById('camp-detail-overlay')?.remove();
  const ov = document.createElement('div');
  ov.id = 'camp-detail-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,62,.55);z-index:9500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';

  const reqStr = r.requirements || '';
  let brief = r.brief || r.description || t('cd-no-brief');
  let payoutMetric = null, hybridTypes = null;
  if (reqStr.includes('|brief:')) {
    const parts = {};
    reqStr.split('|').forEach(s => { const [k,v] = s.split(':'); if (k && v !== undefined) parts[k.trim()] = v.trim(); });
    brief = parts['brief'] || brief;
    payoutMetric = parts['payout_metric'] || null;
    hybridTypes = parts['hybrid_types'] || null;
  }

  const budget = r.budget ? `€${Number(r.budget).toLocaleString()}` : '—';
  const deadline = r.deadline ? new Date(r.deadline).toLocaleDateString() : '—';
  const campType = (r.campaign_type || r.type || c.type || '').toLowerCase();

  const rowItem = (k, v) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;background:var(--blue-soft);border-radius:10px;margin-bottom:8px"><span style="font-size:.88rem;color:var(--text-mid)">${k}</span><span style="font-weight:700;font-size:.88rem;color:var(--navy)">${h(v||'—')}</span></div>`;

  let typeRows = '';
  if (campType === 'affiliate') {
    const metric = payoutMetric || (r.commission_rate ? 'discount_code' : 'views');
    typeRows += rowItem(t('cd-payout-method'), metric === 'discount_code' ? t('cd-discount-code') : t('cd-per-views'));
    if (metric === 'discount_code' && r.commission_rate) typeRows += rowItem(t('cd-commission-rate'), r.commission_rate + '%');
  } else if (campType === 'fixed') {
    if (r.reward_amount) typeRows += rowItem(t('cd-reward-per-infl'), `€${Number(r.reward_amount).toLocaleString()}`);
  } else if (campType === 'barter') {
    if (r.barter_description) typeRows += `<div style="margin-bottom:8px"><div style="font-size:.85rem;font-weight:700;color:var(--navy);margin-bottom:6px">${t('cd-product-service')}</div><div style="font-size:.88rem;color:var(--text-mid);line-height:1.65;padding:12px 14px;background:var(--blue-soft);border-radius:10px">${h(r.barter_description)}</div></div>`;
  } else if (campType === 'hybrid') {
    if (hybridTypes) typeRows += rowItem(t('cd-combined-types'), hybridTypes.split(',').join(' + '));
    if (r.reward_amount) typeRows += rowItem(t('cd-fixed-reward'), `€${Number(r.reward_amount).toLocaleString()}`);
    if (r.commission_rate) typeRows += rowItem(t('cd-commission-rate'), r.commission_rate + '%');
    if (r.barter_description) typeRows += `<div style="margin-bottom:8px"><div style="font-size:.85rem;font-weight:700;color:var(--navy);margin-bottom:6px">${t('cd-barter-details')}</div><div style="font-size:.88rem;color:var(--text-mid);line-height:1.65;padding:12px 14px;background:var(--blue-soft);border-radius:10px">${h(r.barter_description)}</div></div>`;
  }

  const niches = r.niche ? r.niche.split(',').map(n => `<span style="display:inline-block;padding:3px 10px;background:var(--blue-light);color:var(--blue);border-radius:20px;font-size:.78rem;font-weight:700;margin:2px">${h(n.trim())}</span>`).join('') : null;

  ov.innerHTML = `
    <div style="background:white;border-radius:20px;padding:36px;max-width:520px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.25);animation:slideUpModal .3s ease;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
        <div>
          <div style="margin-bottom:6px">${typeBadge(c.type)}</div>
          <h3 style="color:var(--navy);margin:0 0 4px">${h(c.name)}</h3>
          <div style="font-size:.88rem;color:var(--text-mid)">${h(c.brand)}</div>
        </div>
        <button onclick="document.getElementById('camp-detail-overlay').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-mid);line-height:1;padding:4px">×</button>
      </div>
      ${rowItem(t('cd-budget'), budget)}
      ${rowItem(t('cd-deadline-label'), deadline)}
      ${typeRows}
      ${niches ? `<div style="margin-bottom:8px"><div style="font-size:.85rem;font-weight:700;color:var(--navy);margin-bottom:6px">${t('cd-niches')}</div><div>${niches}</div></div>` : ''}
      <div style="margin-top:16px">
        <div style="font-size:.85rem;font-weight:700;color:var(--navy);margin-bottom:8px">${t('cd-brief-label')}</div>
        <div style="font-size:.88rem;color:var(--text-mid);line-height:1.65;padding:12px 14px;background:var(--blue-soft);border-radius:10px">${h(brief)}</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:22px">
        ${c.applied
          ? `<button style="flex:1;padding:11px;border:1.5px solid #10b981;background:#f0fdf4;color:#065f46;border-radius:9px;font-weight:700;cursor:default">${t('cd-applied')}</button>`
          : `<button class="btn btn-primary" style="flex:1;padding:11px" onclick="applyToCampaign('${c.id}');document.getElementById('camp-detail-overlay').remove()">${t('d-apply-now')}</button>`}
        <button class="btn btn-secondary" onclick="document.getElementById('camp-detail-overlay').remove()">${t('cd-close')}</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

function renderInflDiscover() {
  const data = APP.user ? APP.brands : (APP.brands.length ? APP.brands : _BRANDS_DEMO);
  const cards = data.map(_brandCard).join('');
  return `
  <div style="margin-bottom:24px">
    <h2 style="color:var(--navy);margin:0 0 4px">${t('dis-brands-title')}</h2>
    <p style="color:var(--text-mid);margin:0;font-size:.9rem" id="brand-count">${data.length} ${t('dis-brands-sub')}</p>
  </div>
  <div class="filter-bar">
    <select id="brand-industry-filter" onchange="filterBrands()"><option>${t('f-all-industries')}</option><option>Fashion</option><option>Beauty</option><option>Fitness</option><option>Food</option><option>Gaming</option><option>Travel</option></select>
    <input type="text" id="brand-search-input" placeholder="${t('f-search-brands')}" style="min-width:180px" oninput="filterBrands()">
  </div>
  <div id="brand-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">${cards}</div>`;
}

function renderInflMessages() {
  const filtered = filterMsgConvs(MESSAGES_INFL);
  const partner = MESSAGES_INFL.find(m => m.convId === S.chatPartner) || null;
  const chatMsgs = buildChatMsgs(partner, APP.user, 'infl');
  return `<div class="msg-layout">
    <div class="msg-convlist">
      <div class="msg-cl-header">
        <span class="msg-cl-title">${t('msg-conversations') || 'Messages'}</span>
        <button class="msg-find-btn" onclick="openFindUser('infl')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          ${t('msg-new-chat')||'New'} <kbd>⌘K</kbd>
        </button>
      </div>
      <div class="msg-search-wrap">
        <svg class="msg-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="msg-search-input" id="msg-search" placeholder="${t('f-search-infls')}" value="${h(S.msgSearch)}" oninput="setMsgSearch(this.value,'infl')">
      </div>
      <div class="msg-tabs">
        ${['all','unread','starred','creators'].map(f => `<button class="msg-tab${S.msgFilter === f ? ' active' : ''}" onclick="setMsgFilter('${f}','infl')">${msgFilterLabel(f)}</button>`).join('')}
      </div>
      <div class="msg-cl-list">${renderMsgConvList(MESSAGES_INFL, filtered, 'infl')}</div>
    </div>
    <div class="msg-chatview">
      ${partner ? `
      <div class="msg-cv-header">
        <div class="msg-cv-avatar" style="background:${partner.color}">${partner.avatar}</div>
        <div>
          <div class="msg-cv-name">${h(partner.name)}</div>
          <div class="msg-cv-sub">${t('msg-active-brand') || 'Brand'}</div>
        </div>
        <div class="msg-cv-actions">
          <button class="msg-cv-btn${S.msgInfoOpen ? ' active' : ''}" onclick="toggleMsgInfo('infl')" title="Info">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </button>
        </div>
      </div>
      <div class="msg-cv-msgs" id="chat-msgs">${chatMsgs}</div>
      <div class="msg-composer">
        <input type="file" id="chat-attach-infl" class="msg-attach-input" multiple>
        <button class="msg-attach-btn" onclick="document.getElementById('chat-attach-infl').click()" title="${t('msg-attach-title')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <input class="msg-composer-input" id="chat-in" placeholder="${t('msg-placeholder')}" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg('infl')}">
        <button class="msg-collab-btn" onclick="toast(t('collab-coming-soon'),'info')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 0 12 0A6 6 0 0 0 6 9"/><path d="M12 3v2M12 13v8M8.5 6.5L7 5M15.5 6.5L17 5M4 15l2-1M20 15l-2-1"/></svg>
          ${t('msg-collaborate')}
        </button>
        <button class="btn btn-primary" style="padding:10px 20px;border-radius:12px;font-size:.88rem;flex-shrink:0" onclick="sendMsg('infl')">${t('msg-send')}</button>
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
        <div class="msg-info-handle">${t('msg-active-brand') || 'Brand'}</div>
      </div>
      <div class="msg-info-section">
        <div class="msg-info-label">${t('msg-info-details')||'Details'}</div>
        ${partner.niche ? `<div class="msg-info-row"><span class="msg-info-key">${t('msg-info-industry')||'Industry'}</span><span class="msg-info-val">${h(partner.niche)}</span></div>` : ''}
      </div>
    </div>` : ''}
  </div>`;
}

function renderInflAnalytics() {
  const tab = S.inflAnalyticsTab;
  const pd = renderInflProfileData();
  const done = INFL_CAMPAIGNS.filter(c => c.applied && c.status === 'completed').length;
  const applied = INFL_CAMPAIGNS.filter(c => c.applied).length;
  return `
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px">
    ${statCard(t('d-total-earnings'), APP.profile?.total_earnings ? `€${Number(APP.profile.total_earnings).toLocaleString()}` : '€0', t('d-lifetime'), '', 'coin')}
    ${statCard(t('d-total-reach'), pd.followers, t('d-across-plat'), 'up', 'eye')}
    ${statCard(t('d-avg-er'), pd.er, t('d-er-label'), pd.er !== '—' ? 'up' : '', 'bar-chart')}
    ${statCard(t('an-camps-done'), done || applied || '0', t('an-total-collabs'), 'up', 'check-circle')}
  </div>
  <div class="card">
    <div class="tab-bar">
      ${['revenue','performance','campaigns','collaboration'].map(tb=>`<button class="tab-btn ${tab===tb?'active':''}" onclick="setInflAnalyticsTab('${tb}')">${t('tab-'+tb)}</button>`).join('')}
    </div>
    ${tab==='revenue' ? `
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('an-monthly-earnings')}</h4><div class="chart-wrap"><canvas id="infl-rev-chart"></canvas></div></div>
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('an-revenue-by-type')}</h4><div class="chart-wrap"><canvas id="infl-rev-type-chart"></canvas></div></div>
      </div>` : ''}
    ${tab==='performance' ? `
      <h4 style="color:var(--navy);margin:0 0 12px">${t('an-reach-er')}</h4>
      <div class="chart-wrap"><canvas id="infl-perf-chart"></canvas></div>` : ''}
    ${tab==='campaigns' ? `
      <h4 style="color:var(--navy);margin:0 0 12px">${t('an-camp-earnings')}</h4>
      <div class="chart-wrap"><canvas id="infl-camp-chart"></canvas></div>
      <table class="data-table" style="margin-top:20px">
        <thead><tr><th>${t('th-campaign')}</th><th>${t('th-brand')}</th><th>${t('th-type')}</th><th>${t('an-earned-col')}</th></tr></thead>
        <tbody>
          ${INFL_CAMPAIGNS.filter(c=>c.applied).map(c=>`<tr>
            <td style="font-weight:600">${h(c.name)}</td>
            <td>${c.brand}</td>
            <td>${typeBadge(c.type)}</td>
            <td style="font-weight:700;color:var(--blue)">${c.reward}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : ''}
    ${tab==='collaboration' ? `
      <h4 style="color:var(--navy);margin:0 0 12px">${t('an-collab-history')}</h4>
      <div class="chart-wrap"><canvas id="infl-collab-chart"></canvas></div>` : ''}
  </div>`;
}

function renderInflWallet() {
  const tab = S.inflWalletTab;
  const w = APP.wallet;
  const balance = w ? `€${Number(w.balance||0).toLocaleString()}` : '€0';
  const pendingAmt = w ? `€${Number(w.pending||0).toLocaleString()}` : '€0';
  const totalEarned = w ? `€${Number(w.total_earned||0).toLocaleString()}` : (APP.profile?.total_earnings ? `€${Number(APP.profile.total_earnings).toLocaleString()}` : '—');
  const totalWithdrawn = w ? `€${Number(w.total_withdrawn||0).toLocaleString()}` : '—';
  const campsDone = INFL_CAMPAIGNS.filter(c => c.applied && c.status === 'completed').length || 0;
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px">
    <div class="wallet-card">
      <div style="font-size:.85rem;opacity:.7;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">${t('w-avail-bal')}</div>
      <div style="font-size:3rem;font-weight:900;margin-bottom:4px">${balance}</div>
      <div style="font-size:.88rem;opacity:.7">${t('w-pending-prefix')} ${pendingAmt} ${t('w-processing-suffix')}</div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button style="padding:10px 22px;background:rgba(255,255,255,.2);color:white;border:1.5px solid rgba(255,255,255,.3);border-radius:10px;font-weight:700;cursor:pointer" onclick="setInflWalletTab('payouts')">${t('w-withdraw-btn')}</button>
        <button style="padding:10px 22px;background:rgba(255,255,255,.1);color:white;border:1.5px solid rgba(255,255,255,.2);border-radius:10px;font-weight:700;cursor:pointer" onclick="setInflWalletTab('payouts')">${t('w-add-iban-btn')}</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${statCard(t('w-total-earned-lbl'),totalEarned,t('w-lifetime'),'','coin')}
      ${statCard(t('w-total-withdrawn-lbl'),totalWithdrawn,t('w-to-bank'),'','bank')}
      ${statCard(t('w-pending-label'),pendingAmt,t('w-processing'),'','hourglass')}
      ${statCard(t('w-camps-label'),String(campsDone),t('w-completed'),'','check-circle')}
    </div>
  </div>
  <div class="card">
    <div class="tab-bar">
      ${['overview','transactions','payouts'].map(tb=>`<button class="tab-btn ${tab===tb?'active':''}" onclick="setInflWalletTab('${tb}')">${t('tab-'+tb)}</button>`).join('')}
    </div>
    ${tab==='overview' ? `
      <div>
        <h4 style="color:var(--navy);margin:0 0 12px">${t('w-monthly-earnings')}</h4>
        <div class="chart-wrap"><canvas id="infl-wallet-chart"></canvas></div>
      </div>` : ''}
    ${tab==='transactions' ? `
      <table class="data-table">
        <thead><tr><th>${t('w-date')}</th><th>${t('w-description')}</th><th>${t('w-amount')}</th></tr></thead>
        <tbody>
          ${INFL_TRANSACTIONS.length ? INFL_TRANSACTIONS.map(tr=>`<tr>
            <td style="color:var(--text-mid);font-size:.85rem">${tr.date}</td>
            <td>${tr.desc}</td>
            <td style="font-weight:700;color:${tr.type==='credit'?'#10b981':'#ef4444'}">${tr.amount}</td>
          </tr>`).join('') : `<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--text-mid)">${t('w-no-transactions')}</td></tr>`}
        </tbody>
      </table>` : ''}
    ${tab==='payouts' ? `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="padding:16px 20px;background:var(--blue-soft);border-radius:12px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;color:var(--navy)">${t('w-request-withdrawal')}</div>
            <div style="font-size:.85rem;color:var(--text-mid);margin-top:2px">${t('w-min-info')} ${w ? `€${Number(w.balance||0).toLocaleString()}` : '€0'}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input id="withdraw-amount" type="number" min="50" placeholder="Amount €" style="width:110px;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;outline:none;font-size:.9rem" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
            <button class="btn btn-primary" style="padding:9px 18px;font-size:.88rem" onclick="requestWithdrawal(document.getElementById('withdraw-amount').value)">${t('w-withdraw-btn')}</button>
          </div>
        </div>
        <div><h4 style="color:var(--navy);margin:0 0 12px">${t('w-payout-history')}</h4>
        <table class="data-table">
          <thead><tr><th>${t('w-date')}</th><th>${t('w-description')}</th><th>${t('w-amount')}</th><th>${t('w-status-col')}</th></tr></thead>
          <tbody>
            ${INFL_TRANSACTIONS.filter(tr=>tr.type==='debit').length ? INFL_TRANSACTIONS.filter(tr=>tr.type==='debit').map(tr=>`<tr>
              <td>${tr.date}</td><td>${tr.desc}</td>
              <td style="font-weight:700;color:#ef4444">${tr.amount}</td>
              <td><span class="badge badge-green">${t('w-requested-badge')}</span></td>
            </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-mid)">${t('w-no-payouts')}</td></tr>`}
          </tbody>
        </table></div>
      </div>` : ''}
  </div>`;
}

async function uploadInflBanner(file) {
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) { toast(t('upload-allowed-formats'), 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { toast(t('upload-max-size-banner'), 'error'); return; }

  const loading = document.getElementById('infl-banner-loading');
  const hover = document.getElementById('infl-banner-hover');
  if (loading) { loading.style.display = 'flex'; }
  if (hover) hover.style.opacity = '0';

  const uid = APP.user?.id;
  if (!uid) { toast(t('upload-not-logged-in'), 'error'); if (loading) loading.style.display = 'none'; return; }

  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${uid}/banner.${ext}`;

  const { error: upErr } = await _sb.storage.from('banners').upload(path, file, { upsert: true });
  if (upErr) { toast(t('upload-failed') + upErr.message, 'error'); if (loading) loading.style.display = 'none'; return; }

  const { data: urlData } = _sb.storage.from('banners').getPublicUrl(path);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) { toast(t('upload-banner-url-fail'), 'error'); if (loading) loading.style.display = 'none'; return; }

  const cacheBusted = publicUrl + '?t=' + Date.now();
  await _sb.from('influencer_profiles').update({ banner_url: publicUrl }).eq('user_id', uid);
  APP.profile = Object.assign(APP.profile || {}, { banner_url: publicUrl });

  const bannerEl = document.getElementById('infl-banner');
  if (bannerEl) bannerEl.style.backgroundImage = `url('${cacheBusted}')`;
  if (loading) loading.style.display = 'none';
  toast(t('upload-banner-success'), 'success');
}

async function uploadInflAvatar(file) {
  if (!file) return;
  const allowed = ['image/jpeg','image/png','image/webp'];
  if (!allowed.includes(file.type)) { toast(t('upload-allowed-formats'), 'error'); return; }
  if (file.size > 5*1024*1024) { toast(t('upload-max-size-avatar'), 'error'); return; }

  const loading = document.getElementById('infl-avatar-loading');
  const hover   = document.getElementById('infl-avatar-hover');
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
  await _sb.from('influencer_profiles').update({ avatar_url: publicUrl }).eq('user_id', uid);
  APP.profile = Object.assign(APP.profile || {}, { avatar_url: publicUrl });

  const imgEl = document.getElementById('infl-avatar-img');
  if (imgEl) { imgEl.style.background = `url('${cacheBusted}') center/cover no-repeat`; imgEl.textContent = ''; }

  const topbarAv = document.getElementById('infl-topbar-avatar');
  if (topbarAv) topbarAv.innerHTML = `<img src="${cacheBusted}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;

  if (loading) loading.style.display = 'none';
  toast(t('upload-avatar-success'), 'success');
}

function toggleInflProfileEdit() {
  S._inflProfileEdit = !S._inflProfileEdit;
  const content = document.getElementById('infl-content');
  if (content) content.innerHTML = renderInflProfile();
}

function saveInflProfileInline() {
  const p = {
    full_name: document.getElementById('infl-prof-name')?.value.trim() || null,
    username: document.getElementById('infl-prof-username')?.value.trim().replace(/^@/,'') || null,
    niche: document.getElementById('infl-prof-niche')?.value.trim() || null,
    country: document.getElementById('infl-prof-country')?.value || null,
    region: document.getElementById('infl-prof-region')?.value || null,
    city: document.getElementById('infl-prof-city')?.value || null,
    price_range: document.getElementById('infl-prof-price')?.value.trim() || null,
    bio: document.getElementById('infl-prof-bio')?.value.trim() || null,
  };
  _sb.from('influencer_profiles').update(p).eq('user_id', APP.user.id).then(({ error }) => {
    if (error) { toast(error.message, 'error'); return; }
    APP.profile = Object.assign(APP.profile || {}, p);
    S._inflProfileEdit = false;
    const content = document.getElementById('infl-content');
    if (content) content.innerHTML = renderInflProfile();
    toast(t('toast-profile-saved'), 'success');
  });
}

function renderInflProfile() {
  if (APP.user && !APP.profile) return `<div style="display:flex;align-items:center;justify-content:center;height:260px;color:var(--text-mid)"><div style="text-align:center"><div style="width:48px;height:48px;border:3px solid var(--blue-mid);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div>${t('prof-loading')}</div></div>`;
  const pd = renderInflProfileData();
  const initials = pd.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  const activeCamps = INFL_CAMPAIGNS.filter(c=>c.applied).length;
  const editing = S._inflProfileEdit;
  const p = APP.profile || {};
  return `
  <div style="max-width:760px">
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
      <div class="profile-banner" id="infl-banner-area" style="position:relative;cursor:pointer"
           onclick="document.getElementById('infl-banner-input').click()"
           onmouseover="document.getElementById('infl-banner-hover').style.opacity='1'"
           onmouseout="document.getElementById('infl-banner-hover').style.opacity='0'">
        <input type="file" id="infl-banner-input" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="uploadInflBanner(this.files[0])">
        <div id="infl-banner" style="position:absolute;inset:0;background-size:cover;background-position:center;border-radius:inherit${APP.profile?.banner_url ? `;background-image:url('${APP.profile.banner_url}')` : ''}"></div>
        <div id="infl-banner-hover" style="position:absolute;inset:0;background:rgba(0,0,0,.35);border-radius:inherit;display:flex;align-items:center;justify-content:center;gap:8px;opacity:0;transition:opacity .2s;pointer-events:none">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="13" r="4"/><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>
          <span style="color:white;font-size:.85rem;font-weight:700">${t('prof-change-banner')||'Zmeniť banner'}</span>
        </div>
        <div id="infl-banner-loading" style="position:absolute;inset:0;background:rgba(13,27,62,.5);border-radius:inherit;display:none;align-items:center;justify-content:center">
          <div style="width:32px;height:32px;border:3px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite"></div>
        </div>
        <div id="infl-avatar-area"
             style="position:absolute;bottom:-45px;left:28px;width:90px;height:90px;border-radius:50%;border:4px solid white;box-shadow:0 4px 16px rgba(0,0,0,.12);overflow:hidden;cursor:pointer"
             onclick="document.getElementById('infl-avatar-input').click()"
             onmouseover="document.getElementById('infl-avatar-hover').style.opacity='1'"
             onmouseout="document.getElementById('infl-avatar-hover').style.opacity='0'">
          <input type="file" id="infl-avatar-input" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="uploadInflAvatar(this.files[0])">
          <div id="infl-avatar-img" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.3rem;${APP.profile?.avatar_url ? `background:url('${APP.profile.avatar_url}?t=${Date.now()}') center/cover no-repeat` : 'background:linear-gradient(135deg,var(--blue),#7c3aed)'}">
            ${APP.profile?.avatar_url ? '' : initials}
          </div>
          <div id="infl-avatar-hover" style="position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;pointer-events:none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="13" r="4"/><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>
          </div>
          <div id="infl-avatar-loading" style="position:absolute;inset:0;background:rgba(13,27,62,.6);display:none;align-items:center;justify-content:center">
            <div style="width:24px;height:24px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite"></div>
          </div>
        </div>
      </div>
      <div style="padding:60px 28px 28px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <h2 style="color:var(--navy);margin:0 0 2px">${h(pd.handle || pd.name)}${APP.profile?.verified ? ` <span style="color:var(--blue);font-size:1rem">${t('prof-verified')}</span>` : ''}</h2>
            <div style="font-size:.88rem;color:var(--text-mid);margin-bottom:4px">${h(pd.name)}</div>
            <div style="color:var(--text-mid);margin-bottom:12px;font-size:.88rem">${h(pd.niche)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${pd.niche ? `<span class="badge badge-blue">${h(pd.niche)}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-primary" style="padding:9px 18px" onclick="toggleInflProfileEdit()">${t('prof-edit-btn')}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px">
          ${miniStat(t('prof-followers'), pd.followers)} ${miniStat(t('prof-avg-er'), pd.er)} ${miniStat(t('prof-campaigns'), activeCamps)} ${miniStat(t('prof-rating-label'), pd.rating ? Number(pd.rating).toFixed(1)+' '+starSvg(14) : '—')}
        </div>
        ${editing ? `
        <div style="margin-top:22px;border-top:1px solid var(--border);padding-top:22px">
          <h4 style="color:var(--navy);margin:0 0 16px">${t('prof-edit-infl')}</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            ${settingField(t('fld-full-name'), p.full_name || p.name || '', 'infl-prof-name')}
            ${settingField(t('fld-username'), p.username || (p.handle ? p.handle.replace(/^@/,'') : ''), 'infl-prof-username')}
            ${settingSelect(t('fld-niche'), p.niche || '', 'infl-prof-niche', NICHES)}
            ${settingCountry(t('fld-country')||'Krajina', p.country||'', 'infl-prof-country', p.region||'', 'infl-prof-region', p.city||'', 'infl-prof-city')}
            ${settingField(t('fld-price-range'), p.price_range || '', 'infl-prof-price')}
          </div>
          <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-top:14px;margin-bottom:6px">${t('fld-bio')}</label>
          <textarea id="infl-prof-bio" rows="3" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;resize:vertical">${h(p.bio||'')}</textarea>
          <div style="display:flex;gap:10px;margin-top:14px">
            <button class="btn btn-primary" onclick="saveInflProfileInline()">${t('prof-save')}</button>
            <button class="btn btn-secondary" onclick="toggleInflProfileEdit()">${t('prof-cancel')}</button>
          </div>
        </div>` : ''}
      </div>
    </div>
    ${(()=>{
      const _pmMap = {ig:{name:'Instagram',icon:'instagram',color:'#e1306c'},tt:{name:'TikTok',icon:'tiktok',color:'#010101'},yt:{name:'YouTube',icon:'youtube',color:'#ff0000'},fb:{name:'Facebook',icon:'facebook',color:'#1877f2'}};
      const _platforms = APP.profile?.platforms || [];
      const platformsHtml = _platforms.length
        ? _platforms.map(p=>{ const pm=_pmMap[p]||{name:p,icon:'profile',color:'var(--blue)'}; return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--blue-soft);border-radius:10px"><svg width="22" height="22" viewBox="0 0 24 24" style="color:${pm.color}"><use href="#ico-${pm.icon}"/></svg><div style="font-weight:700;font-size:.88rem;color:var(--navy)">${pm.name}</div></div>`; }).join('')
        : `<div style="color:var(--text-mid);font-size:.88rem;line-height:1.7">${t('prof-no-platforms')}<br><button onclick="inflPage('settings')" style="margin-top:6px;color:var(--blue);border:none;background:none;cursor:pointer;font-weight:600;padding:0;font-size:.88rem">${t('prof-add-platforms')}</button></div>`;
      const _p = APP.profile || {};
      const country = _p.country || _p.location || null;
      const priceRange = pd.price && pd.price !== '—' ? pd.price : null;
      const totalEarned = _p.total_earnings ? `€${Number(_p.total_earnings).toLocaleString()}` : null;
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-about-me')}</h4>
        <p style="color:var(--text-mid);font-size:.9rem;line-height:1.6;margin:0 0 16px">${h(pd.bio)}</p>
        ${country ? `<div style="display:flex;align-items:center;gap:6px;color:var(--text-mid);font-size:.85rem"><svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--text-mid)"><use href="#ico-pin"/></svg>${h(country)}</div>` : ''}
      </div>
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-connected-platforms')}</h4>
        <div style="display:flex;flex-direction:column;gap:10px">${platformsHtml}</div>
      </div>
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-campaign-stats')}</h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${[
            [t('prof-camps-applied'), activeCamps || '0'],
            [t('prof-camps-completed'), String(INFL_CAMPAIGNS.filter(c=>c.status==='completed'&&c.applied).length||0)],
            [t('prof-total-earnings'), totalEarned||'€0'],
            [t('prof-avg-er-rate'), pd.er],
          ].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:9px 14px;background:var(--blue-soft);border-radius:10px"><div style="font-size:.88rem;color:var(--text-mid)">${k}</div><div style="font-weight:700;font-size:.88rem;color:var(--navy)">${v}</div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:22px">
        <h4 style="color:var(--navy);margin:0 0 14px">${t('prof-pricing')}</h4>
        ${priceRange
          ? `<div style="padding:14px;background:var(--blue-soft);border-radius:10px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:.9rem;color:var(--text-mid)">${t('prof-price-per-post')}</span><strong style="color:var(--navy)">${priceRange}</strong></div>`
          : `<div style="color:var(--text-mid);font-size:.88rem;line-height:1.7">${t('prof-no-pricing')}<br><button onclick="inflPage('settings')" style="margin-top:6px;color:var(--blue);border:none;background:none;cursor:pointer;font-weight:600;padding:0;font-size:.88rem">${t('prof-set-price')}</button></div>`}
      </div>
    </div>
    ${renderPlatformScoreCards()}`;
    })()}
  </div>`;
}

function renderInflSettings() {
  if (APP.user && !APP.profile) return `<div style="display:flex;align-items:center;justify-content:center;height:260px;color:var(--text-mid)"><div style="text-align:center"><div style="width:48px;height:48px;border:3px solid var(--blue-mid);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px"></div>${t('set-loading')}</div></div>`;
  const p = APP.profile || {};
  const nameParts = (p.full_name || p.name || '').split(' ');
  return `
  <div style="max-width:700px">
    <h2 style="color:var(--navy);margin:0 0 24px">${t('set-title')}</h2>
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">${t('set-personal-info')}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        ${settingField(t('fld-first-name'), nameParts[0] || '', 'iset-first')}
        ${settingField(t('fld-last-name'), nameParts.slice(1).join(' ') || '', 'iset-last')}
        ${settingField(t('fld-email'), APP.user?.email || p.email || '', 'iset-email')}
        ${settingField(t('fld-username'), p.username || (p.handle ? p.handle.replace(/^@/,'') : ''), 'iset-username')}
        ${settingCountry(t('fld-country')||'Krajina', p.country||'', 'iset-country', p.region||'', 'iset-region', p.city||'', 'iset-city')}
        ${settingSelect(t('fld-primary-niche'), p.niche || '', 'iset-niche', NICHES)}
      </div>
      <div style="margin-top:18px">
        <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-bottom:6px">${t('fld-bio')}</label>
        <textarea id="iset-bio" rows="3" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;resize:vertical">${p.bio || ''}</textarea>
      </div>
      <div id="iset-err" style="color:#ef4444;font-size:.85rem;margin-top:6px;display:none"></div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="saveInflProfile()">${t('prof-save')}</button>
    </div>
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">
        ${t('prof-connected-platforms')}
      </h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${[
          {id:'ig', name:'Instagram',
            color:'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366)'},
          {id:'tt', name:'TikTok', color:'#010101'},
          {id:'yt', name:'YouTube', color:'#ff0000'},
          {id:'fb', name:'Facebook', color:'#1877f2'},
        ].map(pl => {
          const connected = (APP.profile?.platforms || []).includes(pl.id);
          return `<div style="display:flex;align-items:center;
            justify-content:space-between;padding:12px 16px;
            background:var(--blue-soft);border-radius:12px;
            border:1.5px solid ${connected
              ? 'var(--blue)' : 'var(--border)'}">
            <div style="display:flex;align-items:center;gap:12px">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <use href="#ico-${pl.id}"/></svg>
              <span style="font-weight:700;font-size:.9rem">
                ${pl.name}</span>
            </div>
            ${connected
              ? `<span style="font-size:.8rem;font-weight:700;
                   color:var(--blue)">✓ ${t('ver-connected-btn')}</span>`
              : `<button class="btn btn-primary"
                   style="padding:6px 16px;font-size:.82rem"
                   onclick="connectSocial('${pl.id}')">
                   ${t('ver-connect-btn')}
                 </button>`
            }
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">${t('set-notifications')}</h3>
      ${toggle(t('notif-invites'),t('notif-invites-desc'),true)}
      ${toggle(t('notif-messages'),t('notif-msg-infl-desc'),true)}
      ${toggle(t('notif-payment'),t('notif-payment-desc'),true)}
      ${toggle(t('notif-deadline'),t('notif-deadline-desc'),true)}
      ${toggle(t('notif-weekly-perf'),t('notif-weekly-perf-desc'),false)}
    </div>
    <div class="card" style="margin-bottom:20px;padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">
        ${t('sett-invite-prefs')}
      </h3>
      <div style="margin-bottom:12px">
        <label style="font-size:.85rem;font-weight:600;
          color:var(--navy);display:block;margin-bottom:8px">
          ${t('sett-who-can-invite')}
        </label>
        <select id="iset-invite-pref"
          style="width:100%;padding:11px 14px;
            border:1.5px solid var(--border);border-radius:10px;
            font-size:.9rem;background:#fff;outline:none">
          ${[
            ['everyone', t('invite-pref-all')],
            ['collaborators', t('invite-pref-collab')],
            ['nobody', t('invite-pref-none')],
          ].map(([v, l]) => `
            <option value="${v}"
              ${(APP.profile?.invite_preference || 'everyone') === v ? 'selected' : ''}>
              ${l}
            </option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary"
        style="padding:9px 20px"
        onclick="saveInflInvitePref()">
        ${t('prof-save')}
      </button>
    </div>
    <div class="card" style="padding:28px">
      <h3 style="color:var(--navy);margin:0 0 20px">${t('set-security')}</h3>
      <button class="btn btn-secondary" style="margin-right:12px" onclick="showChangePassword()">${t('set-change-pwd')}</button>
      <button class="btn btn-secondary" id="btn-2fa" onclick="show2FASetup()">${t('set-enable-2fa')}</button>
      <div style="margin-top:20px;padding:14px;background:#fff5f5;border-radius:10px;border:1px solid #fecaca">
        <div style="font-weight:700;color:#991b1b;margin-bottom:4px">${t('set-danger-zone')}</div>
        <div style="font-size:.88rem;color:#b91c1c;margin-bottom:10px">${t('set-delete-warn-infl')}</div>
        <button style="padding:8px 16px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:.85rem">${t('set-delete-account')}</button>
      </div>
    </div>
  </div>`;
}

async function saveInflInvitePref() {
  const val = document.getElementById('iset-invite-pref')?.value;
  if (!val) return;
  if (APP.profileId) {
    await _sb.from('influencer_profiles')
      .update({ invite_preference: val })
      .eq('id', APP.profileId);
  }
  APP.profile = Object.assign(APP.profile || {}, { invite_preference: val });
  toast(t('sett-saved') || 'Uložené', 'success');
}

// ══════════════════ PLATFORM SCORE ════════════════════════════════════════════

const _PS_META = {
  ig: { name:'Instagram', icon:'instagram', color:'#e1306c', bg:'rgba(225,48,108,.1)' },
  tt: { name:'TikTok',    icon:'tiktok',    color:'#010101', bg:'rgba(0,0,0,.07)'      },
  yt: { name:'YouTube',   icon:'youtube',   color:'#ff0000', bg:'rgba(255,0,0,.08)'    },
  fb: { name:'Facebook',  icon:'facebook',  color:'#1877f2', bg:'rgba(24,119,242,.1)'  },
};

function _psScoreColor(s) {
  if (!s) return 'var(--text-mid)';
  if (s >= 10000) return '#7c3aed';
  if (s >= 1000)  return '#10b981';
  return 'var(--blue)';
}

function _psFmt(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','')+'M';
  if (n >= 1000)    return (n/1000).toFixed(0)+'K';
  return String(n);
}

function _platformStatForm(pid, s) {
  const sv = s || {};
  return `
  <div style="padding:14px;background:var(--blue-soft);border-radius:10px;margin-top:12px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <label style="font-size:.75rem;font-weight:600;color:var(--navy);display:block;margin-bottom:4px">${t('ps-handle')}</label>
        <input id="ps-handle-${pid}" value="${h(sv.handle||'')}" placeholder="@username"
          style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:.82rem;box-sizing:border-box;outline:none">
      </div>
      <div>
        <label style="font-size:.75rem;font-weight:600;color:var(--navy);display:block;margin-bottom:4px">${t('ps-followers')}</label>
        <input id="ps-followers-${pid}" type="number" value="${sv.followers||0}" min="0"
          style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:.82rem;box-sizing:border-box;outline:none">
      </div>
      <div>
        <label style="font-size:.75rem;font-weight:600;color:var(--navy);display:block;margin-bottom:4px">${t('ps-avg-views')}</label>
        <input id="ps-avgviews-${pid}" type="number" value="${sv.avg_views||0}" min="0"
          style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:.82rem;box-sizing:border-box;outline:none">
      </div>
      <div>
        <label style="font-size:.75rem;font-weight:600;color:var(--navy);display:block;margin-bottom:4px">${t('ps-er')} (%)</label>
        <input id="ps-er-${pid}" type="number" value="${Number(sv.engagement_rate||0).toFixed(2)}" min="0" max="100" step="0.01"
          style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:.82rem;box-sizing:border-box;outline:none">
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" style="flex:1;padding:8px;font-size:.8rem" onclick="savePlatformStats('${pid}')">${t('ps-save-stats')}</button>
      <button class="btn btn-secondary" style="flex:1;padding:8px;font-size:.8rem" onclick="togglePlatformStatEdit('${pid}')">${t('ps-cancel')}</button>
    </div>
  </div>`;
}

function renderPlatformScoreCards() {
  const connected = APP.profile?.platforms || [];
  const stats = APP._platformStats || [];

  const cards = Object.entries(_PS_META).map(([pid, pm]) => {
    const isConnected = connected.includes(pid);
    const stat = stats.find(s => s.platform === pid);

    if (!isConnected) {
      return `
      <div class="card" style="padding:20px;border:2px dashed var(--border)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:44px;height:44px;border-radius:12px;background:${pm.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="24" height="24" viewBox="0 0 24 24" style="color:${pm.color}"><use href="#ico-${pm.icon}"/></svg>
          </div>
          <div>
            <div style="font-weight:700;color:var(--navy)">${pm.name}</div>
            <div style="font-size:.75rem;color:var(--text-mid)">${t('ps-not-connected')}</div>
          </div>
        </div>
        <button class="btn btn-secondary" style="width:100%;padding:9px;font-size:.82rem" onclick="inflPage('settings')">${t('ps-connect')}</button>
      </div>`;
    }

    if (!stat) {
      return `
      <div class="card" style="padding:20px" id="ps-card-${pid}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:${pm.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="24" height="24" viewBox="0 0 24 24" style="color:${pm.color}"><use href="#ico-${pm.icon}"/></svg>
          </div>
          <div style="flex:1">
            <div style="font-weight:700;color:var(--navy)">${pm.name}</div>
            <div style="font-size:.75rem;color:var(--text-mid)">${t('ps-no-stats')}</div>
          </div>
        </div>
        <div id="ps-edit-${pid}" style="display:none">${_platformStatForm(pid, null)}</div>
        <button class="btn btn-primary" style="width:100%;padding:9px;font-size:.82rem" onclick="togglePlatformStatEdit('${pid}')">${t('ps-add-stats')}</button>
      </div>`;
    }

    const score = stat.score || 0;
    const sc = _psScoreColor(score);
    return `
    <div class="card" style="padding:20px" id="ps-card-${pid}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:44px;height:44px;border-radius:12px;background:${pm.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="24" height="24" viewBox="0 0 24 24" style="color:${pm.color}"><use href="#ico-${pm.icon}"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;color:var(--navy)">${pm.name}</div>
          <div style="font-size:.75rem;color:var(--text-mid);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${stat.handle ? h(stat.handle) : '—'}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:1.6rem;font-weight:900;color:${sc};line-height:1">${_psFmt(score)}</div>
          <div style="font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-mid);margin-top:2px" title="${t('ps-formula')}">${t('ps-score')} ⓘ</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:var(--blue-soft);border-radius:8px;padding:9px;text-align:center">
          <div style="font-weight:700;color:var(--navy);font-size:.88rem">${_psFmt(stat.followers)}</div>
          <div style="font-size:.66rem;color:var(--text-mid)">${t('ps-followers')}</div>
        </div>
        <div style="background:var(--blue-soft);border-radius:8px;padding:9px;text-align:center">
          <div style="font-weight:700;color:var(--navy);font-size:.88rem">${_psFmt(stat.avg_views)}</div>
          <div style="font-size:.66rem;color:var(--text-mid)">${t('ps-avg-views')}</div>
        </div>
        <div style="background:var(--blue-soft);border-radius:8px;padding:9px;text-align:center">
          <div style="font-weight:700;color:var(--navy);font-size:.88rem">${Number(stat.engagement_rate||0).toFixed(2)}%</div>
          <div style="font-size:.66rem;color:var(--text-mid)">${t('ps-er')}</div>
        </div>
      </div>
      <div id="ps-edit-${pid}" style="display:none">${_platformStatForm(pid, stat)}</div>
      <button class="btn btn-secondary" style="width:100%;padding:8px;font-size:.8rem" onclick="togglePlatformStatEdit('${pid}')">${t('ps-edit-stats')}</button>
      ${stat.last_updated ? `<div style="font-size:.66rem;color:var(--text-mid);margin-top:8px;text-align:center">${t('ps-last-updated')}: ${stat.last_updated.slice(0,10)}</div>` : ''}
    </div>`;
  });

  return `
  <div class="card" style="padding:22px;margin-top:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
      <div>
        <h4 style="color:var(--navy);margin:0 0 3px">${t('ps-title')}</h4>
        <div style="font-size:.78rem;color:var(--text-mid)">${t('ps-formula')}</div>
      </div>
      <button class="btn btn-secondary" style="padding:7px 14px;font-size:.8rem;display:flex;align-items:center;gap:6px" onclick="refreshPlatformStats()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>${t('ps-refresh')}
      </button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      ${cards.join('')}
    </div>
  </div>`;
}

function togglePlatformStatEdit(pid) {
  const el = document.getElementById('ps-edit-' + pid);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

async function savePlatformStats(pid) {
  if (!APP.profileId) return;
  const handle    = document.getElementById('ps-handle-' + pid)?.value?.trim() || null;
  const followers = parseInt(document.getElementById('ps-followers-' + pid)?.value || '0') || 0;
  const avgViews  = parseInt(document.getElementById('ps-avgviews-' + pid)?.value  || '0') || 0;
  const er        = parseFloat(document.getElementById('ps-er-' + pid)?.value || '0') || 0;

  const { error } = await _sb.from('platform_stats').upsert({
    influencer_id: APP.profileId,
    platform: pid,
    handle,
    followers,
    avg_views: avgViews,
    engagement_rate: er,
    last_updated: new Date().toISOString(),
  }, { onConflict: 'influencer_id,platform' });

  if (error) { toast(t('upload-stats-error') + error.message, 'error'); return; }

  const { data } = await _sb.from('platform_stats').select('*').eq('influencer_id', APP.profileId);
  APP._platformStats = data || [];
  inflPage('profile');
  toast(t('ps-saved'), 'success');
}

async function refreshPlatformStats() {
  if (!APP.profileId) return;
  const { data } = await _sb.from('platform_stats').select('*').eq('influencer_id', APP.profileId);
  APP._platformStats = data || [];
  inflPage('profile');
}
