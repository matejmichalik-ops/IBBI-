// ══════════════════ INTERACTION HANDLERS ══════════════════════════════════

function setBizAnalyticsTab(t) {
  S.bizAnalyticsTab = t;
  const content = document.getElementById('biz-content');
  if (content) { destroyCharts(); content.innerHTML = renderBizAnalytics(); initBizCharts(); }
}

function setInflAnalyticsTab(t) {
  S.inflAnalyticsTab = t;
  const content = document.getElementById('infl-content');
  if (content) { destroyCharts(); content.innerHTML = renderInflAnalytics(); initInflCharts(); }
}

function setBizWalletTab(t) {
  S.bizWalletTab = t;
  const content = document.getElementById('biz-content');
  if (content) { destroyCharts(); content.innerHTML = renderBizWallet(); if(t==='overview') initBizWalletCharts(); }
}

function setInflWalletTab(t) {
  S.inflWalletTab = t;
  const content = document.getElementById('infl-content');
  if (content) { destroyCharts(); content.innerHTML = renderInflWallet(); if(t==='overview') initInflWalletCharts(); }
}

// ── Campaign wizard state ─────────────────────────────────────────────────
let _wizStep = 1;
let _wizData = {};

function _wizReset() {
  _wizStep = 1;
  _wizData = {
    type: 'affiliate', name: '', description: '', budget: '', payoutMethod: 'discount',
    commission: '', fixedFee: '', cpmRate: '', productValue: '',
    maxPerCreator: '', barterProduct: '', barterDescription: '',
    hybridFixed: true, hybridAffiliate: false, hybridBarter: false,
    niches: [], audienceMin: 10000, audienceMax: 200000,
    platforms: ['instagram'], geo: ['SK', 'CZ'],
    deadline: '', startDate: '', reels: 0, stories: 0, posts: 0,
  };
}

function showCreateCampaign() {
  document.getElementById('create-camp-modal')?.remove();
  _wizReset();
  const ov = document.createElement('div');
  ov.id = 'create-camp-modal';
  ov.className = 'wiz-overlay';
  ov.innerHTML = renderCampWizard();
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) hideCampaignForm(); });
}

function hideCampaignForm() { document.getElementById('create-camp-modal')?.remove(); }

function _wizRefresh() {
  const ov = document.getElementById('create-camp-modal');
  if (ov) ov.innerHTML = renderCampWizard();
}

function _wizPreviewUpdate() {
  const titleEl = document.getElementById('wiz-prev-title');
  if (titleEl) titleEl.innerHTML = _wizData.name ? h(_wizData.name) : '<span class="wiz-preview-title-empty">Názov kampane…</span>';
  const descEl = document.getElementById('wiz-prev-desc');
  if (descEl) { descEl.textContent = _wizData.description; descEl.style.display = _wizData.description ? '' : 'none'; }
}

function _wizSet(k, v) { _wizData[k] = v; }

function _wizToggle(k, v) {
  const arr = _wizData[k];
  _wizData[k] = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

function _wizInc(k) {
  _wizData[k]++;
  const el = document.getElementById('wiz-cnt-' + k);
  if (el) { el.textContent = _wizData[k]; el.className = 'wiz-counter-value' + (_wizData[k] > 0 ? ' positive' : ''); }
}

function _wizDec(k) {
  if (_wizData[k] <= 0) return;
  _wizData[k]--;
  const el = document.getElementById('wiz-cnt-' + k);
  if (el) { el.textContent = _wizData[k]; el.className = 'wiz-counter-value' + (_wizData[k] > 0 ? ' positive' : ''); }
}

function _wizSetRange(min, max) {
  _wizData.audienceMin = min; _wizData.audienceMax = max;
  const minEl = document.getElementById('wiz-aud-min');
  const maxEl = document.getElementById('wiz-aud-max');
  if (minEl) minEl.value = min;
  if (maxEl) maxEl.value = max;
}

function wizNext() { _wizStep = Math.min(5, _wizStep + 1); _wizRefresh(); }
function wizBack() { _wizStep = Math.max(1, _wizStep - 1); _wizRefresh(); }
function wizSetStep(n) { if (n <= _wizStep) { _wizStep = n; _wizRefresh(); } }

// ── Campaign CRUD ─────────────────────────────────────────────────────────
async function saveCampaign(status) {
  const name = _wizData.name.trim();
  const brief = _wizData.description.trim();
  const budget = parseFloat(_wizData.budget) || 0;
  const errEl = document.getElementById('wiz-err') || document.getElementById('cc-err');
  if (errEl) errEl.style.display = 'none';
  if (!name) { if (errEl) { errEl.textContent = t('err-camp-name-brief'); errEl.style.display = 'block'; } return; }
  const btn = document.getElementById('cc-launch-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('btn-saving'); }

  const payload = {
    name, type: _wizData.type, campaign_type: _wizData.type, budget, status,
    niche: _wizData.niches.join(', ') || null,
    deadline: _wizData.deadline || null,
    brief: brief || null, description: brief || null,
    requirements: JSON.stringify({
      payoutMethod: _wizData.payoutMethod, cpmRate: _wizData.cpmRate,
      maxPerCreator: _wizData.maxPerCreator, platforms: _wizData.platforms,
      geo: _wizData.geo, startDate: _wizData.startDate,
      reels: _wizData.reels, stories: _wizData.stories, posts: _wizData.posts,
      productValue: _wizData.productValue,
      barterProduct: _wizData.barterProduct, barterDescription: _wizData.barterDescription,
      hybridFixed: _wizData.hybridFixed, hybridAffiliate: _wizData.hybridAffiliate, hybridBarter: _wizData.hybridBarter,
    }),
    commission_rate: _wizData.commission ? parseFloat(_wizData.commission) : null,
    reward_amount: _wizData.fixedFee ? parseFloat(_wizData.fixedFee) : null,
    barter_description: _wizData.barterDescription || (_wizData.productValue ? `Hodnota produktu: €${_wizData.productValue}` : null),
    budget_min: _wizData.audienceMin, budget_max: _wizData.audienceMax,
    business_id: APP.profileId || null,
    spent: 0, accepted_count: 0, total_reach: 0, conversions: 0,
  };

  if (APP.user && APP.profileId) {
    const { data, error } = await _sb.from('campaigns').insert(payload).select().single();
    if (btn) { btn.disabled = false; btn.textContent = status === 'active' ? t('c-launch') : t('c-draft'); }
    if (error) { if (errEl) { errEl.textContent = error.message; errEl.style.display = 'block'; } return; }
    BIZ_CAMPAIGNS.unshift({
      id: data.id, name: data.name, type: data.type || data.campaign_type, status: data.status,
      budget: `€${Number(data.budget||0).toLocaleString()}`, spent: '€0',
      apps: 0, accepted: 0, reach: '—', conversions: 0, brief: data.brief,
    });
  } else {
    BIZ_CAMPAIGNS.unshift({ id: Date.now(), name, type: _wizData.type, status, budget: `€${budget.toLocaleString()}`, spent: '€0', apps: 0, accepted: 0, reach: '—', conversions: 0 });
    if (btn) { btn.disabled = false; btn.textContent = status === 'active' ? t('c-launch') : t('c-draft'); }
  }
  hideCampaignForm();
  toast(`Campaign "${name}" ${status === 'active' ? 'launched' : 'saved as draft'}!`, 'success');
  const grid = document.getElementById('biz-camp-grid');
  if (grid) grid.innerHTML = BIZ_CAMPAIGNS.map(c => bizCampCard(c)).join('');
  const countEl = document.querySelector('#biz-content p');
  if (countEl) countEl.textContent = `${BIZ_CAMPAIGNS.length} ${t('c-total-label')}`;
}

async function setCampaignStatus(id, newStatus) {
  if (APP.profileId) {
    await _sb.from('campaigns').update({ status: newStatus }).eq('id', id).eq('business_id', APP.profileId);
  }
  const c = BIZ_CAMPAIGNS.find(c => String(c.id) === String(id));
  if (c) c.status = newStatus;
  const card = document.getElementById(`biz-camp-${id}`);
  if (card) card.outerHTML = BIZ_CAMPAIGNS.find(c => String(c.id)===String(id)) ? bizCampCard(BIZ_CAMPAIGNS.find(c=>String(c.id)===String(id))) : '';
  toast(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`, 'info');
}

async function viewApplications(campId) {
  const drawer = document.getElementById('applications-drawer');
  const content = document.getElementById('apps-drawer-content');
  const title = document.getElementById('apps-drawer-title');
  const camp = BIZ_CAMPAIGNS.find(c => String(c.id) === String(campId));
  if (title) title.textContent = `Applications — ${camp?.name || ''}`;
  drawer.classList.remove('hidden');
  content.innerHTML = `<p style="color:var(--text-mid)">${t('camp-loading-apps')}</p>`;
  drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!APP.user) {
    content.innerHTML = '<p style="color:var(--text-mid)">Sign in to see real applications. (Demo mode)</p>';
    return;
  }
  const { data: apps, error } = await _sb
    .from('campaign_applications')
    .select('*, influencer_profiles(id, user_id, full_name, name, username, handle, niche, follower_count, avg_rating, rating, avg_engagement_rate, engagement_rate, verified, price_range)')
    .eq('campaign_id', campId)
    .order('created_at', { ascending: false });
  if (error || !apps?.length) {
    content.innerHTML = `<p style="color:var(--text-mid)">${t('app-no-apps')}</p>`; return;
  }
  content.innerHTML = apps.map(a => {
    const ip = a.influencer_profiles;
    const name = ip?.full_name || ip?.name || ip?.username || ip?.handle || 'Unknown';
    const initials = name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:12px;background:var(--blue-soft);margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.9rem">${initials}</div>
        <div>
          <div style="font-weight:700;color:var(--navy)">${name} ${ip?.verified ? '<span style="color:var(--blue)">✓</span>' : ''}</div>
          <div style="font-size:.82rem;color:var(--text-mid)">${ip?.niche || '—'} · ${fmtFollowers(ip?.follower_count)} followers · ER ${ip?.engagement_rate || ip?.avg_engagement_rate || '—'}%</div>
          <div style="font-size:.8rem;color:var(--text-mid);margin-top:2px">${starRating(Math.round(ip?.avg_rating || ip?.rating || 0))} ${(ip?.avg_rating || ip?.rating) ? (ip?.avg_rating || ip?.rating).toFixed(1) : t('app-no-rating')}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        ${a.status === 'pending' ? `
          <button onclick="respondApplication('${a.id}','${campId}','accepted')" style="padding:7px 16px;border:none;background:#10b981;color:white;border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer">${t('app-accept')}</button>
          <button onclick="respondApplication('${a.id}','${campId}','rejected')" style="padding:7px 16px;border:1.5px solid #ef4444;background:white;color:#ef4444;border-radius:8px;font-size:.83rem;font-weight:700;cursor:pointer">${t('app-reject')}</button>
        ` : `<span class="badge ${a.status === 'accepted' ? 'badge-green' : 'badge-red'}" style="text-transform:capitalize">${t('status-'+a.status)||a.status}</span>`}
      </div>
    </div>`;
  }).join('');
}

async function respondApplication(appId, campId, decision) {
  const { error } = await _sb.from('campaign_applications').update({ status: decision }).eq('id', appId);
  if (error) { toast(error.message, 'error'); return; }
  if (decision === 'accepted') {
    const camp = BIZ_CAMPAIGNS.find(c => String(c.id) === String(campId));
    if (camp) camp.accepted = (camp.accepted || 0) + 1;
  }
  toast(`Application ${decision}!`, decision === 'accepted' ? 'success' : 'info');
  viewApplications(campId);
}

function showUpdateStats(campId) {
  const c = BIZ_CAMPAIGNS.find(c => String(c.id) === String(campId));
  if (!c) return;
  const existing = document.getElementById('update-stats-overlay');
  if (existing) existing.remove();
  const currentReach = c._raw?.total_reach || 0;
  const currentConversions = c._raw?.conversions || 0;
  const overlay = document.createElement('div');
  overlay.id = 'update-stats-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:white;border-radius:18px;padding:32px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,.2)">
      <h3 style="color:var(--navy);margin:0 0 4px">${t('us-title')}</h3>
      <p style="font-size:.85rem;color:var(--text-mid);margin-bottom:20px">${h(c.name)}</p>
      <label style="display:block;font-size:.82rem;font-weight:600;color:var(--text-mid);margin-bottom:4px">${t('us-reach-lbl')}</label>
      <input id="us-reach" type="number" min="0" placeholder="e.g. 125000" value="${currentReach}"
        style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;margin-bottom:14px;box-sizing:border-box"
        onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <label style="display:block;font-size:.82rem;font-weight:600;color:var(--text-mid);margin-bottom:4px">${t('us-conv-lbl')}</label>
      <input id="us-conv" type="number" min="0" placeholder="e.g. 342" value="${currentConversions}"
        style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;margin-bottom:6px;box-sizing:border-box"
        onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <div id="us-err" style="display:none;color:#ef4444;font-size:.82rem;margin-bottom:10px"></div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <button onclick="document.getElementById('update-stats-overlay').remove()" style="flex:1;padding:11px;border:1.5px solid var(--border);background:white;border-radius:10px;font-weight:600;cursor:pointer;font-size:.9rem">${t('prof-cancel')}</button>
        <button onclick="doUpdateStats('${campId}')" class="btn btn-primary" id="us-btn" style="flex:1;padding:11px;font-size:.9rem">${t('us-save-btn')}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('us-reach').focus();
}

async function doUpdateStats(campId) {
  const reach = parseInt(document.getElementById('us-reach').value) || 0;
  const conversions = parseInt(document.getElementById('us-conv').value) || 0;
  const btn = document.getElementById('us-btn');
  const errEl = document.getElementById('us-err');
  btn.disabled = true; btn.textContent = t('btn-saving');

  if (APP.user) {
    const { error } = await _sb.from('campaigns').update({ total_reach: reach, conversions }).eq('id', campId);
    if (error) {
      errEl.textContent = error.message; errEl.style.display = 'block';
      btn.disabled = false; btn.textContent = t('us-save-btn');
      return;
    }
  }
  const c = BIZ_CAMPAIGNS.find(c => String(c.id) === String(campId));
  if (c) {
    c.reach = reach ? fmtFollowers(reach) : '—';
    c.conversions = conversions;
    if (c._raw) { c._raw.total_reach = reach; c._raw.conversions = conversions; }
  }
  document.getElementById('update-stats-overlay').remove();
  toast('Campaign stats updated', 'success');
  const grid = document.getElementById('biz-campaigns-grid');
  if (grid) grid.innerHTML = BIZ_CAMPAIGNS.map(c => bizCampCard(c)).join('');
}

async function applyToCampaign(id) {
  const c = INFL_CAMPAIGNS.find(c => String(c.id) === String(id));
  if (!c || c.applied) return;
  if (APP.user && APP.profileId) {
    const { error } = await _sb.from('campaign_applications').insert({
      campaign_id: id,
      influencer_id: APP.profileId,
      status: 'pending',
    });
    if (error) { toast(error.message, 'error'); return; }
  }
  c.applied = true;
  toast(`Applied to <strong>${h(c.name)}</strong> successfully!`, 'success');
  const content = document.getElementById('infl-content');
  if (content) content.innerHTML = S.inflPage === 'campaigns' ? renderInflCampaigns() : renderInflDashboard();
}
