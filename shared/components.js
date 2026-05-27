// ══════════════════ SHARED UI COMPONENTS ══════════════════════════════════

function statCard(label, val, sub, dir, icon) {
  return `<div class="stat-card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div class="stat-label">${label}</div>
      <div style="width:40px;height:40px;border-radius:11px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-${icon}"/></svg>
      </div>
    </div>
    <div class="stat-val">${val}</div>
    <div class="stat-delta ${dir==='up'?'delta-up':dir==='dn'?'delta-dn':''}" style="margin-top:6px;font-size:.82rem">${sub}</div>
  </div>`;
}

function starSvg(size=13, color='#f59e0b') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="color:${color};vertical-align:middle;margin-left:1px;flex-shrink:0"><use href="#ico-star"/></svg>`;
}

function starRating(n, size=12) {
  return Array(Math.min(n,5)).fill(0).map(()=>starSvg(size)).join('');
}

function miniStat(label, val) {
  return `<div style="background:var(--blue-soft);border-radius:10px;padding:12px;text-align:center">
    <div style="font-weight:800;color:var(--navy);font-size:1.1rem">${val}</div>
    <div style="font-size:.75rem;color:var(--text-mid);margin-top:2px">${label}</div>
  </div>`;
}

function typeBadge(type) {
  const map = { Affiliate:'badge-purple', Fixed:'badge-blue', Barter:'badge-yellow', Hybrid:'badge-green' };
  return `<span class="badge ${map[type]||'badge-gray'}">${type}</span>`;
}

function statusBadge(s) {
  const map = { active:'badge-green', paused:'badge-yellow', completed:'badge-gray', draft:'badge-blue' };
  return `<span class="badge ${map[s]||'badge-gray'}">${t('status-'+s) || s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
}

function settingField(label, val, id='') {
  return `<div>
    <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-bottom:6px">${label}</label>
    <input ${id ? `id="${id}"` : ''} type="text" value="${val}" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
  </div>`;
}

function toggle(label, desc, checked) {
  const id = 'tog-' + Math.random().toString(36).slice(2,7);
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border)">
    <div>
      <div style="font-weight:600;color:var(--navy);font-size:.9rem">${label}</div>
      <div style="font-size:.82rem;color:var(--text-mid)">${desc}</div>
    </div>
    <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
      <input type="checkbox" ${checked?'checked':''} style="opacity:0;width:0;height:0" onchange="this.nextElementSibling.style.background=this.checked?'var(--blue)':'var(--border)'">
      <span id="${id}" style="position:absolute;inset:0;border-radius:24px;background:${checked?'var(--blue)':'var(--border)'};transition:.2s">
        <span style="position:absolute;top:3px;left:${checked?'23px':'3px'};width:18px;height:18px;border-radius:50%;background:white;transition:.2s;display:block"></span>
      </span>
    </label>
  </div>`;
}

// ── Profile banner / avatar preview (used in both biz and infl profile) ───
function previewBanner(input, targetId) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById(targetId);
    if (el) el.style.backgroundImage = `url('${e.target.result}')`;
  };
  reader.readAsDataURL(file);
}

function previewAvatar(input, targetId) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.style.backgroundImage = `url('${e.target.result}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  };
  reader.readAsDataURL(file);
}

// ── Profile data helpers ───────────────────────────────────────────────────
function renderBizProfileData() {
  const p = APP.profile || {};
  return {
    name: p.company_name || 'Your Company',
    industry: p.industry || '—',
    website: p.website || '',
    about: p.about || p.description || 'Add your company description in Settings.',
    country: p.country || p.location || '—',
  };
}

function renderInflProfileData() {
  const p = APP.profile || {};
  const er = p.engagement_rate || p.avg_engagement_rate;
  return {
    name: p.full_name || p.name || p.username || p.handle || 'Your Name',
    handle: p.username ? `@${p.username}` : (p.handle || '@yourhandle'),
    niche: p.niche || '—',
    bio: p.bio || 'Add your bio in Settings.',
    followers: fmtFollowers(p.follower_count),
    er: er ? `${er}%` : '—',
    rating: p.avg_rating || p.rating || 0,
    campaigns: p.campaign_count || 0,
    price: p.price_range || '—',
  };
}

// ── Campaign card (used in biz renders) ───────────────────────────────────
function bizCampCard(c) {
  const spentRaw = parseInt(String(c.spent).replace(/[€,]/g,'')) || 0;
  const budgetRaw = parseInt(String(c.budget).replace(/[€,]/g,'')) || 1;
  const pct = Math.min(Math.round(spentRaw/budgetRaw*100), 100);
  return `
  <div class="campaign-card" id="biz-camp-${c.id}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
      <div>
        <div style="font-weight:800;color:var(--navy);font-size:1rem;margin-bottom:4px">${h(c.name)}</div>
        <div style="display:flex;gap:6px">${typeBadge(c.type)} ${statusBadge(c.status)}</div>
      </div>
      <div style="text-align:right;font-size:.82rem;color:var(--text-mid)">Budget<br><span style="font-weight:800;color:var(--navy);font-size:1rem">${c.budget}</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      ${miniStat('Applications', c.apps)} ${miniStat('Accepted', c.accepted)} ${miniStat('Reach', c.reach)} ${miniStat('Conversions', c.conversions)}
    </div>
    <div style="background:var(--blue-light);border-radius:8px;height:6px;margin-bottom:12px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:var(--blue);border-radius:8px"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--text-mid);align-items:center">
      <span>Spent: <strong style="color:var(--navy)">${c.spent}</strong></span>
      <div style="display:flex;gap:6px">
        <button onclick="viewApplications('${c.id}')" style="padding:5px 12px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:7px;font-size:.8rem;cursor:pointer;color:var(--blue);font-weight:600">Applications ${c.apps > 0 ? `<span style="background:var(--blue);color:white;border-radius:50%;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;margin-left:4px">${c.apps}</span>` : ''}</button>
        ${c.status === 'active' || c.status === 'paused' ? `<button onclick="showUpdateStats('${c.id}')" style="padding:5px 10px;border:1.5px solid #8b5cf6;background:#f5f3ff;border-radius:7px;font-size:.8rem;cursor:pointer;color:#5b21b6;font-weight:600">Stats</button>` : ''}
        ${c.status === 'active' ? `<button onclick="setCampaignStatus('${c.id}','paused')" style="padding:5px 10px;border:1.5px solid #f59e0b;background:#fffbeb;border-radius:7px;font-size:.8rem;cursor:pointer;color:#92400e;font-weight:600">Pause</button>` : ''}
        ${c.status === 'paused' ? `<button onclick="setCampaignStatus('${c.id}','active')" style="padding:5px 10px;border:1.5px solid #10b981;background:#f0fdf4;border-radius:7px;font-size:.8rem;cursor:pointer;color:#065f46;font-weight:600">Resume</button>` : ''}
        ${c.status === 'draft' ? `<button onclick="setCampaignStatus('${c.id}','active')" style="padding:5px 10px;border:none;background:var(--blue);color:white;border-radius:7px;font-size:.8rem;cursor:pointer;font-weight:600">Launch</button>` : ''}
      </div>
    </div>
  </div>`;
}

// ── Campaign creation wizard ───────────────────────────────────────────────

function renderCampWizard() {
  const STEPS = [
    { id:1, label:t('wiz-step-type')||'Typ' },
    { id:2, label:t('wiz-step-details')||'Detaily' },
    { id:3, label:t('wiz-step-budget')||'Budget' },
    { id:4, label:t('wiz-step-audience')||'Publikum' },
    { id:5, label:t('wiz-step-schedule')||'Rozvrh' },
  ];
  const stepper = STEPS.map((s,i) => {
    const done = s.id < _wizStep, active = s.id === _wizStep;
    const dotCls = active ? 'wiz-step-dot active' : done ? 'wiz-step-dot done' : 'wiz-step-dot';
    return `<button class="wiz-step-btn" ${s.id <= _wizStep ? `onclick="wizSetStep(${s.id})"` : 'disabled'} type="button">
      <div class="${dotCls}">${done ? '✓' : s.id}</div>
      <span class="wiz-step-label${active?' active':''}">${s.label}</span>
    </button>${i < STEPS.length-1 ? `<div class="wiz-step-line${s.id < _wizStep?' done':''}"></div>` : ''}`;
  }).join('');
  const steps = [null, _wizStep1, _wizStep2, _wizStep3, _wizStep4, _wizStep5];
  const isLast = _wizStep === 5;
  return `<div class="wiz-layout" onclick="event.stopPropagation()">
    <div class="wiz-form-col">
      <div class="wiz-panel">
        <div class="wiz-header">
          <div>
            <h2 class="wiz-title">${t('camp-modal-title')||'Vytvoriť kampaň'}</h2>
            <p class="wiz-sub">${t('wiz-step-lbl')||'Krok'} ${_wizStep} z 5 · ${STEPS[_wizStep-1].label}</p>
          </div>
          <button class="wiz-close" onclick="hideCampaignForm()" type="button">✕</button>
        </div>
        <div class="wiz-stepper">${stepper}</div>
        <div class="wiz-body">${steps[_wizStep]()}</div>
        <div class="wiz-footer">
          <button class="wiz-btn-ghost" onclick="wizBack()" type="button"${_wizStep===1?' disabled':''}>← ${t('wiz-back')||'Späť'}</button>
          <div style="flex:1"></div>
          <div id="wiz-err" class="wiz-err"></div>
          <button class="wiz-btn-draft" onclick="saveCampaign('draft')" type="button">${t('wiz-save-draft')||'Uložiť koncept'}</button>
          ${isLast
            ? `<button class="wiz-btn-primary" onclick="saveCampaign('active')" id="cc-launch-btn" type="button">🚀 ${t('wiz-launch')||'Spustiť kampaň'}</button>`
            : `<button class="wiz-btn-primary" onclick="wizNext()" type="button">${t('wiz-next')||'Pokračovať'} →</button>`}
        </div>
      </div>
    </div>
    <div class="wiz-preview-col">
      ${_renderCampPreview()}
    </div>
  </div>`;
}

function _renderCampPreview() {
  const TYPE_META = {
    affiliate:{ label:'Affiliate', icon:'ico-bar-chart' },
    fixed:    { label:'Fixed fee', icon:'ico-coin' },
    barter:   { label:'Barter',    icon:'ico-gift' },
    hybrid:   { label:'Hybrid',    icon:'ico-bolt' },
  };
  const tm = TYPE_META[_wizData.type] || TYPE_META.affiliate;
  const hasContent = _wizData.name || _wizData.budget || _wizData.niches.length > 0;
  const delvs = [];
  if (_wizData.reels > 0) delvs.push(`<span class="wiz-preview-delv-pill">${_wizData.reels} reels</span>`);
  if (_wizData.stories > 0) delvs.push(`<span class="wiz-preview-delv-pill">${_wizData.stories} stories</span>`);
  if (_wizData.posts > 0) delvs.push(`<span class="wiz-preview-delv-pill">${_wizData.posts} posts</span>`);
  const deadlineStr = _wizData.deadline
    ? new Date(_wizData.deadline).toLocaleDateString('sk',{day:'numeric',month:'short',year:'numeric'})
    : 'Open-ended';
  const payoutVal = _wizData.type==='fixed' && _wizData.fixedFee ? `€${_wizData.fixedFee}`
    : _wizData.payoutMethod==='views' && _wizData.cpmRate ? `€${_wizData.cpmRate}/1K`
    : _wizData.commission ? `${_wizData.commission}%` : '—';
  const payoutLbl = _wizData.type==='fixed' ? 'Honorár' : _wizData.payoutMethod==='views' ? 'CPM' : 'Provízia';
  return `<div class="wiz-preview-header">
    <span class="wiz-preview-eyebrow">Náhľad pre influencera</span>
    <span class="wiz-preview-device">Marketplace card</span>
  </div>
  <div class="wiz-preview-card">
    <div class="wiz-preview-cover type-${_wizData.type}">
      <div class="wiz-preview-brand-row">
        <div class="wiz-preview-brand-avatar">IB</div>
        <div class="wiz-preview-brand-info">
          <span class="wiz-preview-brand-name">ibbi brand</span>
          <span class="wiz-preview-brand-handle">@ibbi.sk · overené</span>
        </div>
      </div>
      <div class="wiz-preview-type-badge">
        <svg width="12" height="12"><use href="#${tm.icon}"/></svg>
        ${tm.label}
      </div>
    </div>
    <div class="wiz-preview-body">
      <h3 class="wiz-preview-title" id="wiz-prev-title">${_wizData.name ? h(_wizData.name) : '<span class="wiz-preview-title-empty">Názov kampane…</span>'}</h3>
      <div class="wiz-preview-meta-grid">
        <div class="wiz-preview-meta"><div class="wiz-preview-meta-label">Budget</div><div class="wiz-preview-meta-value">${_wizData.budget ? `€${Number(_wizData.budget).toLocaleString('sk')}` : '—'}</div></div>
        <div class="wiz-preview-meta"><div class="wiz-preview-meta-label">${payoutLbl}</div><div class="wiz-preview-meta-value">${payoutVal}</div></div>
        <div class="wiz-preview-meta"><div class="wiz-preview-meta-label">Termín</div><div class="wiz-preview-meta-value">${deadlineStr}</div></div>
      </div>
      ${_wizData.niches.length > 0 ? `<div class="wiz-preview-tags">${_wizData.niches.map(n => `<span class="wiz-preview-tag">#${n}</span>`).join('')}</div>` : ''}
      ${_wizData.description
        ? `<p class="wiz-preview-desc" id="wiz-prev-desc">${h(_wizData.description)}</p>`
        : !hasContent ? `<div class="wiz-preview-empty">Vyplň formulár vľavo a sleduj ako bude kampaň vyzerať.</div>` : ''}
      <div class="wiz-preview-delv">
        <div class="wiz-preview-delv-label">Deliverables</div>
        <div class="wiz-preview-delv-row">${delvs.length > 0 ? delvs.join('') : '<span class="wiz-preview-delv-empty">Nastav v kroku 5</span>'}</div>
      </div>
      <button class="wiz-preview-cta type-${_wizData.type}">Mám záujem</button>
    </div>
  </div>
  <div class="wiz-preview-footer">ℹ️ Náhľad sa aktualizuje v reálnom čase</div>`;
}

function _wizStep1() {
  const TYPES = [
    { id:'affiliate', label:'Affiliate', sub:'Pay per result',     icon:'ico-bar-chart', desc:'Influencer dostane unikátny kód alebo link a zarába % z predaja.' },
    { id:'fixed',     label:'Fixed fee', sub:'Set fee per creator', icon:'ico-coin',      desc:'Fixný honorár za jasne definované deliverables.' },
    { id:'barter',    label:'Barter',    sub:'Product / service',  icon:'ico-gift',      desc:'Influencer dostane produkt alebo službu výmenou za obsah.' },
    { id:'hybrid',    label:'Hybrid',    sub:'Mix & match',        icon:'ico-bolt',      desc:'Kombinácia fixného honoráru + provízie alebo produktu.' },
  ];
  const cards = TYPES.map(tp => {
    const isActive = _wizData.type === tp.id;
    return `<button type="button" class="wiz-type-card type-${tp.id}${isActive?' active':''}" onclick="_wizSet('type','${tp.id}');_wizRefresh()">
      <div class="wiz-type-icon ${tp.id}">
        <svg width="22" height="22"><use href="#${tp.icon}"/></svg>
      </div>
      <div class="wiz-type-label">${tp.label}</div>
      <div class="wiz-type-sub">${tp.sub}</div>
      <div class="wiz-type-desc">${tp.desc}</div>
      ${isActive ? `<div class="wiz-type-check ${tp.id}">✓</div>` : ''}
    </button>`;
  }).join('');
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s1-title')||'Aký typ kampane vytváraš?'}</h3>
    <p class="wiz-section-sub">${t('wiz-s1-sub')||'Vyber model platby, ktorý najviac sedí tvojim cieľom.'}</p>
    <div class="wiz-type-grid">${cards}</div>
  </div>`;
}

function _wizStep2() {
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s2-title')||'Základné informácie'}</h3>
    <p class="wiz-section-sub">${t('wiz-s2-sub')||'Toto uvidí každý influencer pri prezeraní tvojej kampane.'}</p>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-camp-name-label')||'Názov kampane'} <span class="wiz-req">*</span></label>
      <input class="wiz-input" id="wiz-name" value="${h(_wizData.name)}" oninput="_wizSet('name',this.value);_wizPreviewUpdate()" placeholder="napr. Letná kolekcia 2026 – skincare">
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-camp-brief-label')||'Popis a brief'}</label>
      <div class="wiz-label-hint">Čo je produkt/služba, aký obsah očakávaš, tone of voice, hashtags, kľúčové frázy.</div>
      <textarea class="wiz-textarea" id="wiz-desc" oninput="_wizSet('description',this.value);document.getElementById('wiz-char').textContent=this.value.length+' / 1000';_wizPreviewUpdate()" placeholder="${t('wiz-brief-ph')||'Popíš čo kampaň prezentuje…'}">${h(_wizData.description)}</textarea>
      <div class="wiz-char-count" id="wiz-char">${_wizData.description.length} / 1000</div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">Brief dokument</label>
      <div class="wiz-label-hint">Voliteľné — PDF s podrobnejším zadaním (max 10MB).</div>
      <button type="button" class="wiz-upload-btn">
        <svg width="16" height="16"><use href="#ico-link"/></svg>
        Pridať brief PDF
        <span class="wiz-upload-hint">alebo presuň súbor sem</span>
      </button>
    </div>
  </div>`;
}

function _wizBudgetTotals() {
  return `<div class="wiz-grid-2">
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-budget-label')||'Celkový budget'} <span class="wiz-req">*</span></label>
      <div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.budget}" oninput="_wizSet('budget',this.value)" placeholder="5000"></div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">Max budget na tvorcu</label>
      <div class="wiz-label-hint">Voliteľné — bez limitu ak prázdne.</div>
      <div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.maxPerCreator}" oninput="_wizSet('maxPerCreator',this.value)" placeholder="bez limitu"></div>
    </div>
  </div>`;
}

function _wizPayoutSelector() {
  const pm = _wizData.payoutMethod;
  const PAYOUT = [
    { id:'discount', label:'Discount code', desc:'Unikátny promo kód; provízia z každého predaja.', icon:'ico-credit-card' },
    { id:'views',    label:'Views / CPM',   desc:'Platba za dosiahnuté zhliadnutia (CPM milestones).', icon:'ico-eye' },
  ];
  const cards = PAYOUT.map(p => `
    <button type="button" class="wiz-payout-card${pm===p.id?' active':''}" onclick="_wizSet('payoutMethod','${p.id}');_wizRefresh()">
      <div class="wiz-payout-icon">
        <svg width="16" height="16"><use href="#${p.icon}"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="wiz-payout-label">${p.label}</div>
        <div class="wiz-payout-desc">${p.desc}</div>
      </div>
      <div class="wiz-payout-radio${pm===p.id?' active':''}">${pm===p.id?'<div class="wiz-payout-radio-dot"></div>':''}</div>
    </button>`).join('');
  const rateField = pm==='views'
    ? `<div class="wiz-field">
        <label class="wiz-label">${t('wiz-cpm')||'Sadzba za 1 000 views (CPM)'} <span class="wiz-req">*</span></label>
        <div class="wiz-label-hint">Koľko influencer dostane za každých 1 000 dosiahnutých views.</div>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.cpmRate}" oninput="_wizSet('cpmRate',this.value)" placeholder="8"><span class="wiz-suffix">/ 1K</span></div></div>
      </div>`
    : `<div class="wiz-field">
        <label class="wiz-label">${t('wiz-commission-label')||'Provízia z predaja'} <span class="wiz-req">*</span></label>
        <div class="wiz-label-hint">Percento z hodnoty každého predaja, ktoré influencer dostane.</div>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><input class="wiz-input-plain" type="number" value="${_wizData.commission}" oninput="_wizSet('commission',this.value)" placeholder="10"><span class="wiz-suffix">%</span></div></div>
      </div>`;
  return `<div class="wiz-field">
    <label class="wiz-label">${t('wiz-payout-method')||'Spôsob vyplácania'}</label>
    <div class="wiz-payout-grid">${cards}</div>
  </div>
  ${rateField}`;
}

function _wizHybridBlock(key, title, sub, iconClass, iconId, children) {
  const isOn = !!_wizData[key];
  return `<div class="wiz-hybrid-block${isOn?' on':''}">
    <button type="button" class="wiz-hybrid-trigger" onclick="_wizSet('${key}',!_wizData['${key}']);_wizRefresh()">
      <div class="wiz-hybrid-icon ${iconClass}">
        <svg width="18" height="18"><use href="#${iconId}"/></svg>
      </div>
      <div class="wiz-hybrid-text">
        <div class="wiz-hybrid-title">${title}</div>
        <div class="wiz-hybrid-sub">${sub}</div>
      </div>
      <div class="wiz-hybrid-toggle${isOn?' on':''}">
        <span class="wiz-hybrid-toggle-thumb"></span>
      </div>
    </button>
    ${isOn ? `<div class="wiz-hybrid-body">${children}</div>` : ''}
  </div>`;
}

function _wizStep3() {
  let content = '';
  if (_wizData.type === 'affiliate') {
    content = `${_wizBudgetTotals()}${_wizPayoutSelector()}
    <div class="wiz-info">ℹ️ ${t('wiz-budget-info')||'Budget slúži ako horný strop celkovo vyplatených provízií. Kampaň automaticky končí po jeho vyčerpaní.'}</div>`;
  } else if (_wizData.type === 'fixed') {
    content = `<div class="wiz-field">
      <label class="wiz-label">${t('wiz-fixed-fee-label')||'Fixná odmena za content'} <span class="wiz-req">*</span></label>
      <div class="wiz-label-hint">Suma ktorú dostane každý influencer za splnené deliverables.</div>
      <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.fixedFee}" oninput="_wizSet('fixedFee',this.value)" placeholder="450"></div></div>
    </div>
    <div class="wiz-info">ℹ️ Pri Fixed fee modeli sa každému schválenému creator-ovi automaticky rezervuje suma pri prijatí do kampane.</div>`;
  } else if (_wizData.type === 'barter') {
    content = `<div class="wiz-field">
      <label class="wiz-label">Produkt alebo služba <span class="wiz-req">*</span></label>
      <input class="wiz-input" value="${h(_wizData.barterProduct)}" oninput="_wizSet('barterProduct',this.value)" placeholder="napr. Skincare set – krém + sérum + tonik">
    </div>
    <div class="wiz-field">
      <label class="wiz-label">Popis produktu / služby <span class="wiz-req">*</span></label>
      <div class="wiz-label-hint">Čo presne influencer dostane, čo to robí, prečo je to zaujímavé.</div>
      <textarea class="wiz-textarea" oninput="_wizSet('barterDescription',this.value)" placeholder="Popíš čo influencer dostane výmenou za content…">${h(_wizData.barterDescription)}</textarea>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-product-value')||'Hodnota produktu'}</label>
      <div class="wiz-label-hint">Voliteľné — pre transparentnosť a daňové účely.</div>
      <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.productValue}" oninput="_wizSet('productValue',this.value)" placeholder="120"></div></div>
    </div>
    <div class="wiz-info">ℹ️ Pri Barter modeli neprebieha žiadna peňažná transakcia. Influencer dostane produkt/službu výmenou za dohodnutý obsah.</div>`;
  } else {
    const fixedBlock = _wizHybridBlock('hybridFixed', 'Fixná odmena', 'Garantovaná suma za splnené deliverables', 'fixed', 'ico-coin',
      `${_wizBudgetTotals()}
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-fixed-fee-label')||'Fixná odmena za content'} <span class="wiz-req">*</span></label>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.fixedFee}" oninput="_wizSet('fixedFee',this.value)" placeholder="300"></div></div>
      </div>`
    );
    const affBlock = _wizHybridBlock('hybridAffiliate', 'Affiliate provízia', 'Bonus za výsledky — % z predaja alebo CPM', 'affiliate', 'ico-bar-chart',
      _wizPayoutSelector()
    );
    const barterBlock = _wizHybridBlock('hybridBarter', 'Produkt / služba (Barter)', 'Vec ktorú influencer dostane navyše', 'barter', 'ico-gift',
      `<div class="wiz-field">
        <label class="wiz-label">Produkt alebo služba <span class="wiz-req">*</span></label>
        <input class="wiz-input" value="${h(_wizData.barterProduct)}" oninput="_wizSet('barterProduct',this.value)" placeholder="napr. Skincare set">
      </div>
      <div class="wiz-field">
        <label class="wiz-label">Popis</label>
        <textarea class="wiz-textarea" oninput="_wizSet('barterDescription',this.value)" placeholder="Stručný popis…">${h(_wizData.barterDescription)}</textarea>
      </div>
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-product-value')||'Hodnota produktu'}</label>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.productValue}" oninput="_wizSet('productValue',this.value)" placeholder="120"></div></div>
      </div>`
    );
    const noneSelected = !_wizData.hybridFixed && !_wizData.hybridAffiliate && !_wizData.hybridBarter;
    content = `<div class="wiz-hybrid-intro">Vyber ktoré zložky chceš kombinovať. Influencer dostane všetko zapnuté.</div>
    ${fixedBlock}${affBlock}${barterBlock}
    ${noneSelected ? '<div class="wiz-info">ℹ️ Zapni aspoň jednu zložku vyššie.</div>' : ''}`;
  }
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s3-title')||'Rozpočet a spôsob platby'}</h3>
    <p class="wiz-section-sub">${t('wiz-s3-sub')||'Konfigurácia sa mení podľa typu kampane z kroku 1.'}</p>
    ${content}
  </div>`;
}

function _wizStep4() {
  const NICHES = ['Fashion','Beauty','Fitness','Food','Tech','Travel','Gaming','Lifestyle','Health','Business','Parenting','Auto'];
  const GEO = ['SK','CZ','AT','HU','PL','DE'];
  const nicheChips = NICHES.map(n => `<button type="button" class="wiz-chip${_wizData.niches.includes(n)?' active':''}" onclick="_wizToggle('niches','${n}');this.classList.toggle('active')">${n}</button>`).join('');
  const geoChips = GEO.map(g => `<button type="button" class="wiz-chip${_wizData.geo.includes(g)?' active':''}" onclick="_wizToggle('geo','${g}');this.classList.toggle('active')">${g}</button>`).join('');
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s4-title')||'Cieľová skupina'}</h3>
    <p class="wiz-section-sub">${t('wiz-s4-sub')||'Aký typ influencerov hľadáš a aké publikum chceš osloviť.'}</p>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-niches')||'Nichy / kategórie'} <span class="wiz-req">*</span></label>
      <div class="wiz-label-hint">${t('wiz-niches-hint')||'Vyber všetky relevantné — kampaň sa zobrazí len creator-om z týchto kategórií.'}</div>
      <div class="wiz-chips">${nicheChips}</div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-audience-size')||'Veľkosť publika (followers)'}</label>
      <div class="wiz-range-row">
        <div style="flex:1"><div class="wiz-range-label">Od</div><input class="wiz-input" type="number" id="wiz-aud-min" value="${_wizData.audienceMin}" oninput="_wizSet('audienceMin',+this.value)"></div>
        <div class="wiz-range-dash">—</div>
        <div style="flex:1"><div class="wiz-range-label">Do</div><input class="wiz-input" type="number" id="wiz-aud-max" value="${_wizData.audienceMax}" oninput="_wizSet('audienceMax',+this.value)"></div>
      </div>
      <div class="wiz-range-presets">
        <button type="button" class="wiz-preset" onclick="_wizSetRange(1000,10000)">Nano (1K–10K)</button>
        <button type="button" class="wiz-preset" onclick="_wizSetRange(10000,100000)">Micro (10K–100K)</button>
        <button type="button" class="wiz-preset" onclick="_wizSetRange(100000,500000)">Mid (100K–500K)</button>
        <button type="button" class="wiz-preset" onclick="_wizSetRange(500000,5000000)">Macro (500K+)</button>
      </div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-geo')||'Geo & jazyk'}</label>
      <div class="wiz-chips">${geoChips}</div>
    </div>
  </div>`;
}

function _wizStep5() {
  const PLATFORMS = [{id:'instagram',label:'Instagram'},{id:'tiktok',label:'TikTok'},{id:'youtube',label:'YouTube'},{id:'facebook',label:'Facebook'}];
  const platformChips = PLATFORMS.map(p => `<button type="button" class="wiz-chip${_wizData.platforms.includes(p.id)?' active':''}" onclick="_wizToggle('platforms','${p.id}');this.classList.toggle('active')">${p.label}</button>`).join('');
  const counter = (label, key) => `<div class="wiz-counter">
    <div class="wiz-counter-label">${label}</div>
    <div class="wiz-counter-row">
      <button type="button" class="wiz-counter-btn" onclick="_wizDec('${key}')">−</button>
      <span class="wiz-counter-value${_wizData[key]>0?' positive':''}" id="wiz-cnt-${key}">${_wizData[key]}</span>
      <button type="button" class="wiz-counter-btn inc" onclick="_wizInc('${key}')">+</button>
    </div>
  </div>`;
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s5-title')||'Rozvrh a deliverables'}</h3>
    <p class="wiz-section-sub">${t('wiz-s5-sub')||'Kedy kampaň prebieha a aký obsah od influencera očakávaš.'}</p>
    <div class="wiz-grid-2">
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-start-date')||'Štart kampane'}</label>
        <input type="date" class="wiz-input" value="${_wizData.startDate}" oninput="_wizSet('startDate',this.value)">
      </div>
      <div class="wiz-field">
        <label class="wiz-label">${t('c-form-deadline')||'Uzávierka'}</label>
        <div class="wiz-label-hint">${(_wizData.type === 'affiliate' || (_wizData.type === 'hybrid' && _wizData.hybridAffiliate)) ? 'Voliteľné — bez dátumu beží do vyčerpania budgetu.' : 'Voliteľné.'}</div>
        <input type="date" class="wiz-input" value="${_wizData.deadline}" oninput="_wizSet('deadline',this.value)">
      </div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-platforms')||'Platformy'}</label>
      <div class="wiz-chips">${platformChips}</div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-deliverables')||'Deliverables na influencera'}</label>
      <div class="wiz-delv-grid">
        ${counter('Reels / videá','reels')}
        ${counter('Stories','stories')}
        ${counter('Statické posty','posts')}
      </div>
    </div>
  </div>`;
}
