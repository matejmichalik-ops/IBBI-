// ══════════════════ INTERACTION HANDLERS ══════════════════════════════════

function setBizAnalyticsTab(tab) {
  S.bizAnalyticsTab = tab;
  const content = document.getElementById('biz-content');
  if (content) {
    destroyCharts();
    content.innerHTML = renderBizAnalytics();
    setTimeout(() => { try { initBizCharts(); } catch(e) {} }, 50);
  }
}

function setInflAnalyticsTab(tab) {
  S.inflAnalyticsTab = tab;
  const content = document.getElementById('infl-content');
  if (content) {
    destroyCharts();
    content.innerHTML = renderInflAnalytics();
    setTimeout(() => { try { initInflCharts(); } catch(e) {} }, 50);
  }
}

function setBizWalletTab(tab) {
  S.bizWalletTab = tab;
  const content = document.getElementById('biz-content');
  if (content) {
    destroyCharts();
    content.innerHTML = renderBizWallet();
    if (tab === 'overview')
      setTimeout(() => { try { initBizWalletCharts(); } catch(e) {} }, 50);
  }
}

function setInflWalletTab(tab) {
  S.inflWalletTab = tab;
  const content = document.getElementById('infl-content');
  if (content) {
    destroyCharts();
    content.innerHTML = renderInflWallet();
    if (tab === 'overview')
      setTimeout(() => { try { initInflWalletCharts(); } catch(e) {} }, 50);
  }
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
    barterQty: null,
    niches: [], audienceMin: 10000, audienceMax: 200000,
    platforms: ['instagram'], geo: ['SK', 'CZ'],
    audienceCountry: null, audienceRegion: null, audienceCity: null,
    deadline: '', startDate: '', reels: 0, stories: 0, posts: 0,
    allow_reapply: false,
  };
}

function showCreateCampaign() {
  if (window.innerWidth < 768) { mobShowWizard(); return; }
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
  if (!ov) return;
  if (window.innerWidth < 768) {
    ov.innerHTML = _renderMobWizard();
  } else {
    ov.innerHTML = renderCampWizard();
  }
}

// ── Mobile Campaign Wizard ────────────────────────────────────────────────────
function mobShowWizard() {
  document.getElementById('create-camp-modal')?.remove();
  _wizReset();
  const ov = document.createElement('div');
  ov.id = 'create-camp-modal';
  ov.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;background:var(--blue-soft,#F0F7FF);overflow:hidden';
  ov.innerHTML = _renderMobWizard();
  document.body.appendChild(ov);
}

function _renderMobWizard() {
  const STEPS = [
    t('wiz-step-type')||'Typ',
    t('wiz-step-basics')||'Detaily',
    t('wiz-step-budget')||'Budget',
    t('wiz-step-audience')||'Publikum',
    t('wiz-step-review')||'Rozvrh',
  ];
  const stepDots = STEPS.map((lbl, i) => {
    const n = i + 1;
    const isDone = n < _wizStep, isCur = n === _wizStep;
    const dotStyle = (isCur || isDone)
      ? 'background:var(--blue,#2079FF);color:#fff'
      : 'background:var(--border,#D6E8FF);color:var(--text-light,#8EAFD4)';
    const lblStyle = isCur ? 'color:var(--blue,#2079FF)' : 'color:var(--text-light,#8EAFD4)';
    const lineStyle = isDone ? 'background:var(--blue,#2079FF)' : 'background:var(--border,#D6E8FF)';
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
        <div style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;${dotStyle}">
          ${isDone ? '✓' : n}
        </div>
        <div style="font-size:9px;font-weight:700;letter-spacing:.03em;${lblStyle}">${lbl}</div>
      </div>
      ${n < 5 ? `<div style="flex:1;height:2px;margin-bottom:18px;border-radius:2px;${lineStyle}"></div>` : ''}`;
  }).join('');

  const MobSteps = [null, _mobWizStep1, _mobWizStep2, _mobWizStep3, _mobWizStep4, _mobWizStep5];
  const stepFn = MobSteps[_wizStep];
  const stepHtml = stepFn ? stepFn() : '';
  const isLast = _wizStep === 5;

  return `
    <!-- Topbar -->
    <header style="display:flex;align-items:center;height:56px;padding:0 8px;background:#fff;border-bottom:1px solid var(--border,#D6E8FF);flex-shrink:0">
      <button onclick="hideCampaignForm()" style="width:44px;height:44px;border:none;background:none;cursor:pointer;color:var(--text-mid,#4A6FA5);display:flex;align-items:center;justify-content:center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
      <span style="flex:1;text-align:center;font-size:.92rem;font-weight:800;color:var(--navy,#0D1B3E)">${t('c-new')||'Nová kampaň'}</span>
      <div style="width:44px"></div>
    </header>
    <!-- Stepper -->
    <div style="padding:12px 16px 8px;background:#fff;border-bottom:1px solid var(--border,#D6E8FF);flex-shrink:0">
      <div style="display:flex;align-items:center">${stepDots}</div>
      <div style="text-align:center;font-size:11px;font-weight:700;color:var(--text-mid,#4A6FA5);margin-top:6px">
        ${t('wiz-step-of')||'Krok'} ${_wizStep} ${t('wiz-step-separator')||'z'} 5 · ${STEPS[_wizStep-1]}
      </div>
    </div>
    <!-- Content -->
    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px">
      <div id="mob-wiz-err" style="display:none;color:#EF4444;font-size:.8rem;font-weight:600;background:#fee2e2;border-radius:8px;padding:10px 12px;margin-bottom:12px"></div>
      ${stepHtml}
    </div>
    <!-- Footer -->
    <div style="flex-shrink:0;display:flex;gap:10px;padding:12px 16px;padding-bottom:max(12px,env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid var(--border,#D6E8FF);backdrop-filter:blur(10px)">
      ${_wizStep > 1 ? `<button onclick="wizBack()" style="flex:0 0 auto;padding:0 20px;height:52px;border-radius:12px;border:1.5px solid var(--blue,#2079FF);background:transparent;color:var(--blue,#2079FF);font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit">${t('wiz-back')||'← Späť'}</button>` : ''}
      ${isLast
        ? `<button onclick="saveCampaign('draft')" style="flex:1;height:52px;border-radius:12px;border:1.5px solid var(--border,#D6E8FF);background:#fff;color:var(--text-mid,#4A6FA5);font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit">${t('wiz-save-draft')||'Koncept'}</button>
           <button id="cc-launch-btn" onclick="saveCampaign('active')" style="flex:1;height:52px;border-radius:12px;border:none;background:var(--blue,#2079FF);color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit">🚀 ${t('wiz-launch')||'Spustiť'}</button>`
        : `<button onclick="wizNext()" style="flex:1;height:52px;border-radius:12px;border:none;background:var(--blue,#2079FF);color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit">${t('wiz-next')||'Ďalej →'}</button>`}
    </div>`;
}

function _mobWizCard(active) {
  return `background:${active?'var(--blue-light,#EBF3FF)':'#fff'};border:${active?'2px solid var(--blue,#2079FF)':'1.5px solid var(--border,#D6E8FF)'};border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:14px;cursor:pointer;width:100%;text-align:left;font-family:inherit;margin-bottom:10px`;
}

function _mobWizStep1() {
  const TYPES = [
    { id:'affiliate', ic:'📊', name:'Affiliate',  sub:'Platba za konverzie alebo views. Maximálne ROI.' },
    { id:'fixed',     ic:'💰', name:'Fixed Fee',   sub:'Fixná odmena za dohodnutý obsah. Jasné podmienky.' },
    { id:'barter',    ic:'🎁', name:'Barter',      sub:'Produkt za obsah. Ideálne pre nové značky.' },
    { id:'hybrid',    ic:'⚡', name:'Hybrid',      sub:'Kombinácia modelov. Maximálna flexibilita.' },
  ];
  return `<h3 style="font-size:1.05rem;font-weight:800;color:var(--navy,#0D1B3E);margin-bottom:4px">${t('wiz-type-label')||'Typ kampane'}</h3>
    <p style="font-size:.8rem;color:var(--text-mid,#4A6FA5);margin-bottom:16px">${t('wiz-type-sub')||'Zvol model odmeňovania influencerov'}</p>
    ${TYPES.map(tp => `
      <button style="${_mobWizCard(_wizData.type===tp.id)}" onclick="_wizSet('type','${tp.id}');_wizRefresh()">
        <div style="font-size:1.3rem;width:42px;height:42px;border-radius:11px;background:var(--blue-light,#EBF3FF);display:flex;align-items:center;justify-content:center;flex-shrink:0">${tp.ic}</div>
        <div style="flex:1">
          <div style="font-size:.92rem;font-weight:800;color:var(--navy,#0D1B3E)">${tp.name}</div>
          <div style="font-size:.75rem;color:var(--text-mid,#4A6FA5);margin-top:2px;line-height:1.4">${tp.sub}</div>
        </div>
        ${_wizData.type===tp.id ? '<div style="color:var(--blue,#2079FF);font-weight:900;font-size:1rem">✓</div>' : ''}
      </button>`).join('')}`;
}

function _mobWizStep2() {
  return `<h3 style="font-size:1.05rem;font-weight:800;color:var(--navy,#0D1B3E);margin-bottom:4px">${t('wiz-basics-label')||'Základné informácie'}</h3>
    <p style="font-size:.8rem;color:var(--text-mid,#4A6FA5);margin-bottom:16px">Toto uvidí každý influencer pri prezeraní tvojej kampane</p>
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-camp-name-label')||'Názov kampane'} *</label>
      <input style="width:100%;padding:12px 14px;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;font-size:.9rem;color:var(--navy,#0D1B3E);background:#fff;outline:none;font-family:inherit"
        id="wiz-mob-name" value="${h(_wizData.name)}"
        oninput="_wizSet('name',this.value)"
        placeholder="napr. Letná kolekcia 2026">
    </div>
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-brief-label')||'Popis a brief'}</label>
      <textarea style="width:100%;padding:12px 14px;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;font-size:.9rem;color:var(--navy,#0D1B3E);background:#fff;outline:none;font-family:inherit;resize:none;line-height:1.5"
        id="wiz-mob-desc" rows="5"
        oninput="_wizSet('description',this.value)"
        placeholder="Popíš kampaň, požiadavky na obsah, tone of voice…">${h(_wizData.description)}</textarea>
    </div>`;
}

function _mobWizStep3() {
  const type = _wizData.type;
  let fields = '';
  if (type === 'affiliate') {
    fields = `
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-budget-label')||'Celkový budget'} *</label>
        <div style="display:flex;align-items:center;gap:0;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;overflow:hidden;background:#fff">
          <span style="padding:12px 12px;font-size:.9rem;font-weight:700;color:var(--text-mid,#4A6FA5);background:var(--blue-soft,#F0F7FF);border-right:1px solid var(--border,#D6E8FF)">€</span>
          <input type="number" style="flex:1;padding:12px;border:none;font-size:.9rem;color:var(--navy,#0D1B3E);background:transparent;outline:none;font-family:inherit"
            value="${_wizData.budget}" oninput="_wizSet('budget',this.value)" placeholder="5000">
        </div>
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-commission-label')||'Provízia z predaja (%)'}</label>
        <div style="display:flex;align-items:center;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;overflow:hidden;background:#fff">
          <input type="number" style="flex:1;padding:12px;border:none;font-size:.9rem;color:var(--navy,#0D1B3E);background:transparent;outline:none;font-family:inherit"
            value="${_wizData.commission}" oninput="_wizSet('commission',this.value)" placeholder="10">
          <span style="padding:12px;font-size:.9rem;font-weight:700;color:var(--text-mid,#4A6FA5)">%</span>
        </div>
      </div>`;
  } else if (type === 'fixed') {
    fields = `
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-fixed-fee-label')||'Fixná odmena na tvorcu'} *</label>
        <div style="display:flex;align-items:center;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;overflow:hidden;background:#fff">
          <span style="padding:12px;font-size:.9rem;font-weight:700;color:var(--text-mid,#4A6FA5);background:var(--blue-soft,#F0F7FF);border-right:1px solid var(--border,#D6E8FF)">€</span>
          <input type="number" style="flex:1;padding:12px;border:none;font-size:.9rem;background:transparent;outline:none;font-family:inherit"
            value="${_wizData.fixedFee}" oninput="_wizSet('fixedFee',this.value)" placeholder="450">
        </div>
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-budget-label')||'Celkový budget'} *</label>
        <div style="display:flex;align-items:center;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;overflow:hidden;background:#fff">
          <span style="padding:12px;font-size:.9rem;font-weight:700;color:var(--text-mid,#4A6FA5);background:var(--blue-soft,#F0F7FF);border-right:1px solid var(--border,#D6E8FF)">€</span>
          <input type="number" style="flex:1;padding:12px;border:none;font-size:.9rem;background:transparent;outline:none;font-family:inherit"
            value="${_wizData.budget}" oninput="_wizSet('budget',this.value)" placeholder="5000">
        </div>
      </div>`;
  } else if (type === 'barter') {
    fields = `
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Produkt / služba *</label>
        <input style="width:100%;padding:12px 14px;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;font-size:.9rem;color:var(--navy,#0D1B3E);background:#fff;outline:none;font-family:inherit"
          value="${h(_wizData.barterProduct)}" oninput="_wizSet('barterProduct',this.value)"
          placeholder="napr. Skincare set – krém + sérum">
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-barter-qty-label')||'Počet produktov / influencerov'}</label>
        <input type="number" min="1" max="9999"
          style="width:100%;padding:12px 14px;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;font-size:.9rem;color:var(--navy,#0D1B3E);background:#fff;outline:none;font-family:inherit;box-sizing:border-box"
          value="${_wizData.barterQty || ''}"
          placeholder="napr. 10"
          oninput="_wizSet('barterQty', parseInt(this.value)||null)">
        <div style="font-size:.75rem;color:var(--text-mid,#4A6FA5);margin-top:4px">${t('wiz-barter-qty-hint')||'Každý produkt = 1 influencer. Kampaň sa uzavrie po minutí produktov.'}</div>
      </div>
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-product-value')||'Hodnota produktu (€)'}</label>
        <div style="display:flex;align-items:center;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;overflow:hidden;background:#fff">
          <span style="padding:12px;font-size:.9rem;font-weight:700;color:var(--text-mid,#4A6FA5);background:var(--blue-soft,#F0F7FF);border-right:1px solid var(--border,#D6E8FF)">€</span>
          <input type="number" style="flex:1;padding:12px;border:none;font-size:.9rem;background:transparent;outline:none;font-family:inherit"
            value="${_wizData.productValue}" oninput="_wizSet('productValue',this.value)" placeholder="80">
        </div>
      </div>`;
  } else {
    fields = `
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">${t('wiz-budget-label')||'Celkový budget'} *</label>
        <div style="display:flex;align-items:center;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;overflow:hidden;background:#fff">
          <span style="padding:12px;font-size:.9rem;font-weight:700;color:var(--text-mid,#4A6FA5);background:var(--blue-soft,#F0F7FF);border-right:1px solid var(--border,#D6E8FF)">€</span>
          <input type="number" style="flex:1;padding:12px;border:none;font-size:.9rem;background:transparent;outline:none;font-family:inherit"
            value="${_wizData.budget}" oninput="_wizSet('budget',this.value)" placeholder="5000">
        </div>
      </div>`;
  }
  return `<h3 style="font-size:1.05rem;font-weight:800;color:var(--navy,#0D1B3E);margin-bottom:4px">${t('wiz-s3-title')||'Budget a odmeňovanie'}</h3>
    <p style="font-size:.8rem;color:var(--text-mid,#4A6FA5);margin-bottom:16px">Typ: <strong>${_wizData.type||'affiliate'}</strong></p>
    ${fields}`;
}

function _mobWizStep4() {
  const NICHES = ['Fashion','Beauty','Fitness','Food','Travel','Tech','Gaming','Lifestyle','Business'];
  const PLATS  = ['instagram','tiktok','youtube','facebook'];
  const nChips = NICHES.map(n => {
    const on = _wizData.niches.includes(n);
    return `<button onclick="_wizToggle('niches','${n}');_wizRefresh()" style="padding:8px 14px;border-radius:50px;border:1.5px solid ${on?'var(--blue,#2079FF)':'var(--border,#D6E8FF)'};background:${on?'var(--blue-light,#EBF3FF)':'#fff'};color:${on?'var(--blue,#2079FF)':'var(--text-mid,#4A6FA5)'};font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;margin:0 6px 8px 0">${n}</button>`;
  }).join('');
  const pChips = PLATS.map(p => {
    const on = _wizData.platforms.includes(p);
    return `<button onclick="_wizToggle('platforms','${p}');_wizRefresh()" style="padding:8px 14px;border-radius:50px;border:1.5px solid ${on?'var(--blue,#2079FF)':'var(--border,#D6E8FF)'};background:${on?'var(--blue-light,#EBF3FF)':'#fff'};color:${on?'var(--blue,#2079FF)':'var(--text-mid,#4A6FA5)'};font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;margin:0 6px 8px 0;text-transform:capitalize">${p}</button>`;
  }).join('');
  const mobGeoSelector = settingCountry(
    t('wiz-geo-label')||'Cieľová krajina',
    _wizData.audienceCountry || '',
    'wiz-geo-country',
    _wizData.audienceRegion || '',
    'wiz-geo-region',
    _wizData.audienceCity || '',
    'wiz-geo-city'
  )
  .replace(
    `onchange="_onCountryChange('wiz-geo-country','wiz-geo-region','wiz-geo-city')"`,
    `onchange="_onCountryChange('wiz-geo-country','wiz-geo-region','wiz-geo-city');_wizSet('audienceCountry',this.value);_wizSet('audienceRegion','');_wizSet('audienceCity','')"`
  )
  .replace(
    `onchange="_onRegionChange('wiz-geo-country','wiz-geo-region','wiz-geo-city')"`,
    `onchange="_onRegionChange('wiz-geo-country','wiz-geo-region','wiz-geo-city');_wizSet('audienceRegion',this.value);_wizSet('audienceCity','')"`
  )
  .replace(
    `id="wiz-geo-city"`,
    `id="wiz-geo-city" onchange="_wizSet('audienceCity',this.value)"`
  );
  return `<h3 style="font-size:1.05rem;font-weight:800;color:var(--navy,#0D1B3E);margin-bottom:4px">${t('wiz-audience-label')||'Publikum a targeting'}</h3>
    <p style="font-size:.8rem;color:var(--text-mid,#4A6FA5);margin-bottom:16px">${t('wiz-audience-sub')||'Koho hľadáš?'}</p>
    <div style="margin-bottom:18px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">${t('wiz-niches-label')||'Niche / kategórie'}</label>
      <div style="display:flex;flex-wrap:wrap">${nChips}</div>
    </div>
    <div style="margin-bottom:18px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">${t('wiz-platforms-label')||'Platformy'}</label>
      <div style="display:flex;flex-wrap:wrap">${pChips}</div>
    </div>
    <div style="margin-bottom:18px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">${t('wiz-min-followers-label')||'Min. sledovatelia influencera'}</label>
      <select onchange="_wizSet('audienceMin',parseInt(this.value))" style="width:100%;padding:12px 14px;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;font-size:.9rem;color:var(--navy,#0D1B3E);background:#fff;outline:none;font-family:inherit;appearance:none;cursor:pointer">
        <option value="1000" ${_wizData.audienceMin<=1000?'selected':''}>1 000+</option>
        <option value="5000" ${_wizData.audienceMin===5000?'selected':''}>5 000+</option>
        <option value="10000" ${_wizData.audienceMin===10000?'selected':''}>10 000+</option>
        <option value="50000" ${_wizData.audienceMin===50000?'selected':''}>50 000+</option>
        <option value="100000" ${_wizData.audienceMin===100000?'selected':''}>100 000+</option>
      </select>
    </div>
    <div style="margin-bottom:4px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">${t('wiz-geo-label')||'Cieľová krajina'}</label>
      ${mobGeoSelector}
    </div>`;
}

function _mobWizStep5() {
  const formatDate = d => d ? new Date(d).toLocaleDateString('sk',{day:'numeric',month:'short',year:'numeric'}) : '—';
  const rows = [
    ['Typ',      t('wiz-step-type')||'Typ',             _wizData.type || '—'],
    ['Názov',    t('wiz-camp-name-label')||'Názov',      _wizData.name || '—'],
    ['Budget',   t('wiz-step-budget')||'Budget',         _wizData.budget ? '€'+Number(_wizData.budget).toLocaleString('sk') : '—'],
    ['Niche',    'Niche',                                 _wizData.niches.length ? _wizData.niches.join(', ') : '—'],
    ['Platformy',t('wiz-platforms-label')||'Platformy', _wizData.platforms.length ? _wizData.platforms.join(', ') : '—'],
    ['Termín',   t('wiz-deadline-label')||'Termín',      formatDate(_wizData.deadline)],
  ].map(([k, lbl, v]) => `
    <div style="display:flex;align-items:center;padding:11px 0;border-bottom:1px solid var(--border,#D6E8FF)">
      <span style="font-size:.75rem;color:var(--text-mid,#4A6FA5);width:88px;flex-shrink:0">${lbl}</span>
      <span style="font-size:.88rem;font-weight:700;color:var(--navy,#0D1B3E);flex:1">${h(String(v))}</span>
      <button onclick="wizSetStep(${k==='Typ'?1:k==='Názov'||k==='Budget'?2:3})" style="font-size:.75rem;color:var(--blue,#2079FF);font-weight:700;border:none;background:none;cursor:pointer;font-family:inherit">${t('wiz-change-btn')||'Zmeniť'}</button>
    </div>`).join('');
  return `<h3 style="font-size:1.05rem;font-weight:800;color:var(--navy,#0D1B3E);margin-bottom:4px">${t('wiz-review-label')||'Rozvrh a prehľad'}</h3>
    <p style="font-size:.8rem;color:var(--text-mid,#4A6FA5);margin-bottom:16px">${t('wiz-review-sub')||'Skontroluj pred spustením'}</p>
    <div style="margin-bottom:16px">
      <label style="display:block;font-size:.72rem;font-weight:700;color:var(--text-mid,#4A6FA5);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">${t('wiz-deadline-label')||'Dátum ukončenia'}</label>
      <input type="date" style="width:100%;padding:12px 14px;border:1.5px solid var(--border,#D6E8FF);border-radius:10px;font-size:.9rem;color:var(--navy,#0D1B3E);background:#fff;outline:none;font-family:inherit"
        value="${_wizData.deadline}" onchange="_wizSet('deadline',this.value)">
    </div>
    <div style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#fff;border:1px solid var(--border,#D6E8FF);border-radius:12px">
        <div>
          <div style="font-weight:700;font-size:.88rem;color:var(--navy,#0D1B3E)">${t('wiz-allow-reapply-label')||'Povoliť opakovanú účasť'}</div>
          <div style="font-size:.75rem;color:var(--text-mid,#4A6FA5);margin-top:2px">${t('wiz-allow-reapply-desc')||'Influencer sa môže zapojiť opakovane'}</div>
        </div>
        <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;flex-shrink:0">
          <input type="checkbox" ${_wizData.allow_reapply ? 'checked' : ''} style="opacity:0;width:0;height:0"
            onchange="_wizData.allow_reapply=this.checked;var s=this.nextElementSibling;s.style.background=this.checked?'var(--blue,#2079FF)':'var(--border,#D6E8FF)';s.querySelector('span').style.transform=this.checked?'translateX(20px)':'translateX(0)'">
          <span style="position:absolute;inset:0;border-radius:24px;background:${_wizData.allow_reapply?'var(--blue,#2079FF)':'var(--border,#D6E8FF)'};transition:.2s">
            <span style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:white;transition:.2s;display:block;transform:${_wizData.allow_reapply?'translateX(20px)':'translateX(0)'}"></span>
          </span>
        </label>
      </div>
    </div>
    <div style="background:#fff;border:1px solid var(--border,#D6E8FF);border-radius:14px;padding:4px 16px;margin-top:16px">
      ${rows}
    </div>
    <div id="wiz-err" style="display:none;color:#EF4444;font-size:.8rem;font-weight:600;background:#fee2e2;border-radius:8px;padding:10px 12px;margin-top:12px"></div>`;
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
  const errEl = document.getElementById('mob-wiz-err') || document.getElementById('wiz-err') || document.getElementById('cc-err');
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
      barter_qty: _wizData.barterQty || null,
      hybridFixed: _wizData.hybridFixed, hybridAffiliate: _wizData.hybridAffiliate, hybridBarter: _wizData.hybridBarter,
      audience_country: _wizData.audienceCountry || null,
      audience_region: _wizData.audienceRegion || null,
      audience_city: _wizData.audienceCity || null,
    }),
    commission_rate: _wizData.commission ? parseFloat(_wizData.commission) : null,
    reward_amount: _wizData.fixedFee ? parseFloat(_wizData.fixedFee) : null,
    barter_description: _wizData.barterDescription || (_wizData.productValue ? `Hodnota produktu: €${_wizData.productValue}` : null),
    budget_min: _wizData.audienceMin, budget_max: _wizData.audienceMax,
    allow_reapply: !!_wizData.allow_reapply,
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
  toast(t(status === 'active' ? 'camp-save-launched-msg' : 'camp-save-draft-msg').replace('{name}', name), 'success');
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
  toast(t(newStatus === 'active' ? 'camp-status-resumed' : 'camp-status-paused'), 'info');
}

async function viewApplications(campId) {
  const drawer = document.getElementById('applications-drawer');
  const content = document.getElementById('apps-drawer-content');
  const title = document.getElementById('apps-drawer-title');
  const camp = BIZ_CAMPAIGNS.find(c => String(c.id) === String(campId));
  if (title) title.textContent = `${t('c-applications')} — ${camp?.name || ''}`;
  drawer.classList.remove('hidden');
  content.innerHTML = `<p style="color:var(--text-mid)">${t('camp-loading-apps')}</p>`;
  drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!APP.user) {
    content.innerHTML = `<p style="color:var(--text-mid)">${t('demo-apps-signin')}</p>`;
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
  toast(t('camp-application-decision').replace('{decision}', t('status-' + decision)), decision === 'accepted' ? 'success' : 'info');
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
  toast(t('camp-stats-updated'), 'success');
  const grid = document.getElementById('biz-campaigns-grid');
  if (grid) grid.innerHTML = BIZ_CAMPAIGNS.map(c => bizCampCard(c)).join('');
}

async function applyToCampaign(id) {
  const c = INFL_CAMPAIGNS.find(c => String(c.id) === String(id));
  if (!c || c.applied) return;
  if (APP.user && APP.profileId) {
    const { data: active } = await _sb.from('campaign_applications')
      .select('id')
      .eq('campaign_id', id)
      .eq('influencer_id', APP.profileId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();
    if (active) { toast(t('apply-already-applied'), 'error'); return; }

    const { data: camp } = await _sb.from('campaigns').select('allow_reapply').eq('id', id).single();
    if (camp && !camp.allow_reapply) {
      const { data: prev } = await _sb.from('campaign_applications')
        .select('id').eq('campaign_id', id).eq('influencer_id', APP.profileId).eq('status', 'completed').maybeSingle();
      if (prev) { toast(t('apply-no-reapply'), 'error'); return; }
    }

    const { error } = await _sb.from('campaign_applications').insert({
      campaign_id: id,
      influencer_id: APP.profileId,
      status: 'pending',
    });
    if (error) { toast(error.message, 'error'); return; }
  }
  c.applied = true;
  toast(t('camp-apply-success').replace('{name}', h(c.name)), 'success');
  const content = document.getElementById('infl-content');
  if (content) content.innerHTML = S.inflPage === 'campaigns' ? renderInflCampaigns() : renderInflDashboard();
}
