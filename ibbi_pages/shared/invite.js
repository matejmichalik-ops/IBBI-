// ══════════════════ CAMPAIGN INVITE (Messages) ═════════════════════════════

// ── State ─────────────────────────────────────────────────────────────────
let _ciModal = { open: false, role: null, campaigns: [], loading: false, selected: null, query: '' };

// ── Type config ────────────────────────────────────────────────────────────
const _CI_TINT = { fixed: '#2456e8', affiliate: '#1aa971', barter: '#e89b1a', hybrid: '#8b5cf6' };

function _ciNormType(c) {
  const raw = (c.type || c.campaign_type || '').toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ── SVG helper ─────────────────────────────────────────────────────────────
function _ciSvg(name, size, color) {
  const sw = 2;
  const p = {
    euro:     `<path d="M19 5a8 8 0 1 0 0 14"/><path d="M3 10h11M3 14h11"/>`,
    chart:    `<path d="M3 21V9M9 21V3M15 21v-9M21 21v-5"/>`,
    gift:     `<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9M12 8v14M9 8a3 3 0 1 1 6 0"/>`,
    zap:      `<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>`,
    megaphone:`<path d="M3 11v2a2 2 0 0 0 2 2h1l3 5 2-1-2-4h2l8 3V6l-8 3H5a2 2 0 0 0-2 2z"/>`,
    briefcase:`<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>`,
    calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>`,
    check:    `<path d="M5 12l5 5 9-11"/>`,
    close:    `<path d="M6 6l12 12M18 6L6 18"/>`,
    'check-circle': `<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>`,
    target:   `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="${color}" stroke="none"/>`,
    send:     `<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>`,
    search:   `<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>`,
    radio:    `<circle cx="12" cy="12" r="9"/>`,
  }[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}

// ── Pay shape from DB campaign ─────────────────────────────────────────────
function _ciPayShape(c) {
  const type = (c.type || c.campaign_type || '').toLowerCase();
  let req = {};
  try { req = JSON.parse(c.requirements || '{}'); } catch {}

  if (type === 'fixed') {
    return { fee: `€${Number(c.fixed_fee || c.budget || 0).toLocaleString()}`, unit: c.deliverables || 'za balík obsahu' };
  }
  if (type === 'affiliate') {
    const commission = c.commission_rate ? `${c.commission_rate}%` : '—';
    const max = req.maxPerCreator ? `€${req.maxPerCreator}` : null;
    return { commission, commissionNote: 'z každého predaja cez tvoj kód', perViews: '—', maxPerCreator: max };
  }
  if (type === 'barter') {
    const product = req.barterProduct || c.barter_description || t('wiz-barter-product-label');
    const value   = c.reward_amount ? `€${c.reward_amount}` : '';
    const desc    = req.barterDescription || c.barter_description || '';
    return { product, value, desc };
  }
  if (type === 'hybrid') {
    const parts = [];
    if (req.hybridFixed    || c.fixed_fee)        parts.push({ icon: 'euro',  label: t('ci-fixed-label'),     value: `€${req.hybridFixed || c.fixed_fee || '—'}` });
    if (req.hybridAffiliate || c.commission_rate) parts.push({ icon: 'chart', label: t('ci-affiliate-label'), value: `${req.hybridAffiliate || c.commission_rate || '—'}% z predaja` });
    if (req.hybridBarter   || req.barterProduct)  parts.push({ icon: 'gift',  label: 'Barter',                value: req.barterProduct ? `Produkt ${req.hybridBarter ? '€'+req.hybridBarter : ''}`.trim() : '—' });
    if (!parts.length) parts.push({ icon: 'euro', label: t('ci-fixed-label'), value: `€${c.budget || '—'}` });
    return { parts };
  }
  return { fee: `€${Number(c.budget || 0).toLocaleString()}`, unit: 'odmena' };
}

function _ciPayShortDisplay(c) {
  const type = (c.type || c.campaign_type || '').toLowerCase();
  let req = {}; try { req = JSON.parse(c.requirements || '{}'); } catch {}
  if (type === 'fixed')     return `€${Number(c.fixed_fee || c.budget || 0).toLocaleString()}`;
  if (type === 'affiliate') return `${c.commission_rate || '—'}% z predaja`;
  if (type === 'barter')    return `Produkt ${c.reward_amount ? '€'+c.reward_amount : ''}`.trim() || 'Barter';
  if (type === 'hybrid')    return `€${req.hybridFixed || c.fixed_fee || '—'} + bonus`;
  return '—';
}

// ── Invite card sub-renderers ──────────────────────────────────────────────
function _ciCardHeader(c, type, tint) {
  const brandName = c._brandName || c.brand_name || 'Brand';
  const initials  = brandName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  const iconName  = { fixed:'euro', affiliate:'chart', barter:'gift', hybrid:'zap' }[type.toLowerCase()] || 'euro';
  return `
  <div style="display:flex;align-items:flex-start;gap:12px">
    <div style="width:42px;height:42px;border-radius:12px;background:var(--blue);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${initials}</div>
    <div style="flex:1;min-width:0">
      <div style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;letter-spacing:0.8px;color:var(--text-faint);text-transform:uppercase">
        ${_ciSvg('megaphone',11,tint)} ${t('ci-invite-kicker')}
      </div>
      <div style="font-size:16px;font-weight:800;color:var(--navy);letter-spacing:-0.3px;margin-top:3px;line-height:1.25">${h(c.name || '—')}</div>
    </div>
    <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid ${tint}33;color:${tint};background:${tint}14;flex-shrink:0">
      ${_ciSvg(iconName,11,tint)} ${type}
    </span>
  </div>`;
}

function _ciRewardBlock(c, type, tint, pay) {
  if (type === 'Fixed') {
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border-radius:12px;border:1px solid ${tint}22;background:${tint}0a;flex-wrap:wrap">
      <div>
        <div style="font-size:9.5px;font-weight:800;letter-spacing:0.6px;color:var(--text-faint);text-transform:uppercase">${t('ci-fixed-label')}</div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.05;color:${tint}">${pay.fee}</div>
      </div>
      <div style="display:inline-flex;align-items:center;gap:6px">
        ${_ciSvg('euro',16,tint)}
        <span style="font-size:12.5px;font-weight:700;color:var(--text-muted)">${h(pay.unit)}</span>
      </div>
    </div>`;
  }
  if (type === 'Affiliate') {
    return `<div style="display:flex;flex-direction:column;gap:10px;padding:12px 14px;border-radius:12px;border:1px solid ${tint}22;background:${tint}0a">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px">
        <div>
          <div style="font-size:9.5px;font-weight:800;letter-spacing:0.6px;color:var(--text-faint);text-transform:uppercase">${t('ci-affiliate-label')}</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;line-height:1.05;color:${tint}">${pay.commission}</div>
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-top:2px">${h(pay.commissionNote)}</div>
        </div>
        ${pay.perViews && pay.perViews !== '—' ? `<div style="text-align:right">
          <div style="font-size:9.5px;font-weight:800;letter-spacing:0.6px;color:var(--text-faint);text-transform:uppercase">${t('ci-per-views')}</div>
          <div style="font-size:15px;font-weight:800;color:var(--navy);margin-top:2px">${pay.perViews}</div>
        </div>` : ''}
      </div>
      ${pay.maxPerCreator ? `<div style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--text-muted);padding-top:8px;border-top:1px dashed var(--border-strong)">
        ${_ciSvg('target',12,'var(--text-muted)')} Max. výplata <strong style="color:var(--navy)">${pay.maxPerCreator}</strong> na tvorcu
      </div>` : ''}
    </div>`;
  }
  if (type === 'Barter') {
    return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid ${tint}33;background:#fffaf0">
      <div style="width:42px;height:42px;border-radius:11px;background:${tint}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${_ciSvg('gift',20,tint)}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:14.5px;font-weight:800;color:var(--navy)">${h(pay.product)}</span>
          ${pay.value ? `<span style="font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:6px;color:${tint};background:${tint}14">hodnota ${pay.value}</span>` : ''}
        </div>
        ${pay.desc ? `<div style="font-size:12px;font-weight:500;color:var(--text-muted);line-height:1.5;margin-top:4px">${h(pay.desc)}</div>` : ''}
      </div>
    </div>`;
  }
  if (type === 'Hybrid') {
    const chips = (pay.parts || []).map(p => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 10px;background:#fff;border-radius:10px;border:1px solid var(--border)">
        <span style="width:28px;height:28px;border-radius:8px;background:${tint}14;display:flex;align-items:center;justify-content:center;flex-shrink:0">${_ciSvg(p.icon||'euro',13,tint)}</span>
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.4px;color:var(--text-faint);text-transform:uppercase">${h(p.label)}</div>
          <div style="font-size:13.5px;font-weight:800;color:var(--navy)">${h(p.value)}</div>
        </div>
      </div>`).join('');
    return `<div style="display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;border:1px solid ${tint}22;background:${tint}0a">
      <div style="font-size:9.5px;font-weight:800;letter-spacing:0.6px;color:var(--text-faint);text-transform:uppercase">${t('ci-hybrid-label')}</div>
      <div style="display:flex;flex-direction:column;gap:6px">${chips}</div>
    </div>`;
  }
  return '';
}

function _ciMetaRow(c, daysLeft, urgent) {
  const dlColor  = urgent ? '#e94b4b' : 'var(--text-muted)';
  const deadlineStr = c.deadline ? new Date(c.deadline).toLocaleDateString('sk', { day:'numeric', month:'short' }) : null;
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
    ${c.deliverables ? `<div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--text-muted)">
      ${_ciSvg('briefcase',12,'var(--text-muted)')} ${h(c.deliverables)}
    </div>` : '<div></div>'}
    ${deadlineStr ? `<div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:${dlColor}">
      ${_ciSvg('calendar',12,dlColor)} do ${deadlineStr}${urgent && daysLeft !== null ? ` · ${daysLeft} dní` : ''}
    </div>` : ''}
  </div>`;
}

function _ciStatusBar(tone, icon, label, sub) {
  const tones = {
    success: { bg: '#e6f7ee', fg: '#1aa971', bd: '#a7e3c8' },
    muted:   { bg: '#f1f4fa', fg: '#6a7596', bd: '#dde4f0' },
  };
  const tn = tones[tone] || tones.muted;
  return `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:11px;background:${tn.bg};border:1px solid ${tn.bd}">
    <span style="width:24px;height:24px;border-radius:12px;background:${tn.fg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
      ${_ciSvg(icon,13,'#fff')}
    </span>
    <div>
      <div style="font-size:13px;font-weight:800;color:${tn.fg}">${label}</div>
      ${sub ? `<div style="font-size:11.5px;font-weight:600;color:var(--text-muted);margin-top:1px">${sub}</div>` : ''}
    </div>
  </div>`;
}

function _ciActionsBlock(msg, role, status, msgId, campId, convId) {
  const sm = h(String(msgId  || ''));
  const sc = h(String(campId || ''));
  const sv = h(String(convId || ''));
  if (role === 'infl' && status === 'pending') {
    return `<div style="display:flex;gap:8px">
      <button onclick="acceptInvite('${sm}','${sc}','${sv}','infl')" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:13.5px;font-weight:800;color:#fff;background:#1aa971;padding:11px 14px;border-radius:11px;border:none;cursor:pointer;box-shadow:0 6px 16px rgba(26,169,113,0.4)">
        ${_ciSvg('check',15,'#fff')} ${t('ci-accept')}
      </button>
      <button onclick="rejectInvite('${sm}','${sv}','infl')" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:13.5px;font-weight:800;color:#e94b4b;background:#fff;padding:11px 14px;border-radius:11px;border:1.5px solid #f3c2c2;cursor:pointer">
        ${_ciSvg('close',15,'#e94b4b')} ${t('ci-reject')}
      </button>
    </div>`;
  }
  if (role === 'infl' && status === 'accepted') return _ciStatusBar('success','check-circle',t('ci-infl-accepted'),t('ci-infl-accepted-sub'));
  if (role === 'infl' && status === 'rejected') return _ciStatusBar('muted','close',t('ci-infl-rejected'));
  if (role === 'biz'  && status === 'pending')  {
    return `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:11px;background:#eef3ff;border:1px solid #cdddff">
      <span style="display:inline-flex;gap:4px;align-items:center">
        ${[0,.18,.36].map(d => `<span style="width:7px;height:7px;border-radius:4px;background:#2456e8;display:inline-block;animation:cibounce 1.2s infinite ease-in-out;animation-delay:${d}s"></span>`).join('')}
      </span>
      <span style="font-size:12.5px;font-weight:700;color:#2456e8">${t('ci-biz-pending')}</span>
    </div>`;
  }
  if (role === 'biz'  && status === 'accepted') return _ciStatusBar('success','check-circle',t('ci-biz-accepted'),t('ci-biz-accepted-sub'));
  if (role === 'biz'  && status === 'rejected') return _ciStatusBar('muted','close',t('ci-biz-rejected'));
  return '';
}

// ── Main InviteCard renderer ────────────────────────────────────────────────
function _renderInviteCard(msg, role) {
  const c = msg.campaigns || msg._campData;
  if (!c) {
    return `<div style="background:#fff;border-radius:12px;padding:14px;border:1px solid var(--border);color:var(--text-muted);font-size:.83rem">
      ${_ciSvg('megaphone',14,'var(--blue)')} ${t('ci-invite-msg')}
    </div>`;
  }
  const type   = _ciNormType(c);
  const tint   = _CI_TINT[type.toLowerCase()] || '#2456e8';
  const pay    = _ciPayShape(c);
  const status = msg.invite_status || 'pending';

  const deadline = c.deadline ? new Date(c.deadline) : null;
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - new Date()) / 86400000)) : null;
  const urgent   = daysLeft !== null && daysLeft <= 14;

  return `
  <div id="invite-card-${h(String(msg.id))}" style="background:#fff;border-radius:16px;border:1px solid var(--border);overflow:hidden;box-shadow:0 6px 20px rgba(11,29,79,0.08);width:100%;max-width:420px">
    <div style="height:4px;background:linear-gradient(90deg,${tint},#8b5cf6)"></div>
    <div style="padding:14px;display:flex;flex-direction:column;gap:12px">
      ${_ciCardHeader(c, type, tint)}
      ${_ciRewardBlock(c, type, tint, pay)}
      ${_ciMetaRow(c, daysLeft, urgent)}
      ${_ciActionsBlock(msg, role, status, msg.id, msg.campaign_id, msg.conversation_id)}
    </div>
  </div>`;
}

// ── Invite Modal ───────────────────────────────────────────────────────────

function openInviteModal(role, targetInfluencerId, targetName) {
  if (!targetInfluencerId) {
    const arr     = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
    const partner = arr.find(m => m.convId === S.chatPartner);
    if (!partner) { toast(t('ci-select-conv'), 'error'); return; }
  }
  _ciModal = { open: true, role, campaigns: [], loading: true, selected: null, query: '',
    targetInfluencerId: targetInfluencerId || null, targetName: targetName || null };
  _ciRenderModal();
  _ciLoadCampaigns(role);
}

function closeInviteModal() {
  document.getElementById('ci-modal-overlay')?.remove();
  _ciModal.open = false;
}

function _ciRenderModal() {
  document.getElementById('ci-modal-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id    = 'ci-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(11,29,79,0.45);backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding-top:80px;z-index:1000';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeInviteModal(); });
  overlay.innerHTML = `<div style="width:min(560px,92vw);max-height:76vh;background:#fff;border-radius:20px;box-shadow:0 30px 80px rgba(11,29,79,0.35);display:flex;flex-direction:column;overflow:hidden" onclick="event.stopPropagation()">${_ciModalContent()}</div>`;
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('ci-modal-search')?.focus(), 50);
}

function _ciModalContent() {
  const arr      = _ciModal.role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const partner  = arr.find(m => m.convId === S.chatPartner);
  const partnerName = _ciModal.targetName ? h(_ciModal.targetName) : (partner ? h(partner.name) : '—');
  const q        = _ciModal.query;
  const filtered = _ciModal.campaigns.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.type || c.campaign_type || '').toLowerCase().includes(q.toLowerCase())
  );

  return `
  <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:20px 22px 14px">
    <div>
      <div style="font-size:18px;font-weight:800;color:var(--navy);letter-spacing:-0.3px">${t('ci-modal-title')}</div>
      <div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-top:3px">${t('ci-modal-sub').replace('{name}', partnerName)}</div>
    </div>
    <button onclick="closeInviteModal()" style="width:32px;height:32px;border-radius:8px;background:var(--bg);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
      ${_ciSvg('close',18,'var(--text-muted)')}
    </button>
  </div>
  <div style="display:flex;align-items:center;gap:10px;margin:0 22px;padding:11px 14px;background:var(--bg-soft);border:1px solid var(--border);border-radius:12px">
    ${_ciSvg('search',18,'var(--text-faint)')}
    <input id="ci-modal-search" value="${h(q)}" placeholder="${t('ci-search-placeholder')}"
      style="flex:1;border:none;background:transparent;outline:none;font-size:14px;font-weight:600;color:var(--navy);font-family:inherit"
      oninput="_ciModalSearch(this.value)">
  </div>
  <div id="ci-modal-list" style="flex:1;overflow-y:auto;padding:14px 22px;display:flex;flex-direction:column;gap:8px">
    ${_ciModal.loading
      ? `<div style="text-align:center;padding:40px;color:var(--text-faint);font-size:13px;font-weight:600">${t('ci-loading')}</div>`
      : filtered.length
        ? filtered.map(c => _ciCampRow(c)).join('')
        : `<div style="text-align:center;padding:40px;color:var(--text-faint);font-size:13px;font-weight:600">${t('ci-no-campaigns')}</div>`}
  </div>
  <div style="display:flex;justify-content:flex-end;gap:10px;padding:14px 22px;border-top:1px solid var(--border);background:var(--bg-soft)">
    <button onclick="closeInviteModal()" style="font-size:13px;font-weight:700;color:var(--text-muted);padding:10px 18px;border-radius:10px;background:#fff;border:1px solid var(--border-strong);cursor:pointer">${t('ci-cancel')}</button>
    <button onclick="sendCampaignInvite('${_ciModal.role}')"
      ${!_ciModal.selected ? 'disabled' : ''}
      style="display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:800;color:#fff;padding:10px 18px;border-radius:10px;border:none;cursor:${_ciModal.selected ? 'pointer' : 'not-allowed'};background:${_ciModal.selected ? 'var(--blue)' : 'var(--border-strong)'};box-shadow:${_ciModal.selected ? '0 8px 20px rgba(32,121,255,0.35)' : 'none'}">
      ${_ciSvg('send',15,'#fff')} ${t('ci-send-btn')}
    </button>
  </div>`;
}

function _ciCampRow(c) {
  const type   = _ciNormType(c);
  const tint   = _CI_TINT[type.toLowerCase()] || '#2456e8';
  const iname  = { fixed:'euro', affiliate:'chart', barter:'gift', hybrid:'zap' }[type.toLowerCase()] || 'euro';
  const active = _ciModal.selected === String(c.id);
  const budget = c.budget ? `€${Number(c.budget).toLocaleString()}` : null;

  let req = {};
  try { req = typeof c.requirements === 'string' ? JSON.parse(c.requirements) : (c.requirements || {}); } catch {}
  const barterQty     = req.barter_qty || c.barter_qty || null;
  const barterProduct = req.barterProduct || c.barter_description || t('wiz-barter-product-label') || 'Produkt';
  const freeSlots     = (type.toLowerCase() === 'barter' && barterQty !== null)
    ? Math.max(0, barterQty - (c.accepted_count || 0))
    : null;
  const free = freeSlots !== null
    ? freeSlots
    : Math.max(0, (c.slots_total || 10) - (c.slots_taken || c.accepted_count || 0));

  const subLabel = type.toLowerCase() === 'barter' && barterQty !== null
    ? `<span style="font-weight:700">${h(barterProduct)}</span><span style="color:var(--text-faint)">·</span><span style="color:${free === 0 ? '#e94b4b' : 'var(--text-muted)'};font-weight:700">${free} ${t('inv-free-slots')||'voľných'}</span>`
    : `<span>${_ciPayShortDisplay(c)}</span><span style="color:var(--text-faint)">·</span><span style="color:${free === 0 ? '#e94b4b' : 'var(--text-muted)'};font-weight:700">${free} ${t('inv-free-slots')||'voľných'}</span>`;

  return `<button onclick="_ciSelect('${h(String(c.id))}')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:13px;border:1.5px solid ${active ? 'var(--blue)' : 'var(--border)'};text-align:left;cursor:pointer;background:${active ? '#2456e808' : '#fff'};box-shadow:${active ? '0 0 0 3px rgba(32,121,255,0.12)' : 'none'};width:100%;transition:all 120ms">
    <div style="width:40px;height:40px;border-radius:11px;background:${tint}14;display:flex;align-items:center;justify-content:center;flex-shrink:0">${_ciSvg(iname,18,tint)}</div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-size:14px;font-weight:800;color:var(--navy)">${h(c.name)}</span>
        <span style="font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:6px;color:${tint};background:${tint}14">${type}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text-muted);margin-top:3px;flex-wrap:wrap">
        ${subLabel}
        ${budget ? `<span style="color:var(--text-faint)">·</span><span>budget ${budget}</span>` : ''}
      </div>
    </div>
    <span style="width:22px;height:22px;border-radius:11px;border:2px solid ${active ? 'var(--blue)' : 'var(--border-strong)'};background:${active ? 'var(--blue)' : '#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
      ${active ? _ciSvg('check',12,'#fff') : ''}
    </span>
  </button>`;
}

function _ciModalSearch(q) {
  _ciModal.query = q;
  const list = _ciModal.campaigns.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.type || c.campaign_type || '').toLowerCase().includes(q.toLowerCase())
  );
  const listEl = document.getElementById('ci-modal-list');
  if (listEl) listEl.innerHTML = list.length
    ? list.map(c => _ciCampRow(c)).join('')
    : `<div style="text-align:center;padding:40px;color:var(--text-faint);font-size:13px;font-weight:600">${t('ci-no-campaigns')}</div>`;
}

function _ciSelect(id) {
  _ciModal.selected = _ciModal.selected === id ? null : id;
  const inner = document.querySelector('#ci-modal-overlay > div');
  if (inner) inner.innerHTML = _ciModalContent();
  setTimeout(() => { const s = document.getElementById('ci-modal-search'); if (s) { s.value = _ciModal.query; s.focus(); } }, 10);
}

async function _ciLoadCampaigns(role) {
  let camps = [];
  if (APP.user && APP.profileId && role === 'biz') {
    const { data } = await _sb.from('campaigns')
      .select('id,name,type,campaign_type,status,budget,fixed_fee,commission_rate,reward_amount,barter_description,requirements,deliverables,deadline,accepted_count')
      .eq('business_id', APP.profileId).eq('status', 'active')
      .order('created_at', { ascending: false });
    camps = data || [];
  } else {
    camps = (BIZ_CAMPAIGNS || [])
      .filter(c => c.status === 'active')
      .map(c => ({
        id: c.id, name: c.name,
        type: (c.type || 'fixed').toLowerCase(),
        campaign_type: (c.type || 'fixed').toLowerCase(),
        status: c.status,
        budget: parseFloat(String(c.budget || '').replace(/[€,]/g,'')) || 0,
        fixed_fee: null, commission_rate: null, reward_amount: null,
        barter_description: null, requirements: null,
        deliverables: null, deadline: null,
        slots_total: 8, slots_taken: 0, accepted_count: 0,
      }));
  }
  _ciModal.campaigns = camps;
  _ciModal.loading   = false;
  const inner = document.querySelector('#ci-modal-overlay > div');
  if (inner) inner.innerHTML = _ciModalContent();
}

// ── Send invite ─────────────────────────────────────────────────────────────
async function sendCampaignInvite(role) {
  const campId  = _ciModal.selected;
  if (!campId)  { toast(t('ci-no-campaigns'), 'error'); return; }
  const arr     = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const partner = arr.find(m => m.convId === S.chatPartner) || null;
  if (!partner && !_ciModal.targetInfluencerId) { toast(t('ci-select-conv'), 'error'); return; }
  const camp    = _ciModal.campaigns.find(c => String(c.id) === String(campId));
  if (!camp)    return;

  closeInviteModal();

  const targetInflId = _ciModal.targetInfluencerId;

  // Discover flow — vložiť pozvánku priamo do campaign_applications
  if (targetInflId && !partner && APP.user && APP.profileId) {
    const { data: ex } = await _sb.from('campaign_applications')
      .select('id,status').eq('campaign_id', campId).eq('influencer_id', targetInflId).maybeSingle();
    if (!ex) {
      await _sb.from('campaign_applications').insert({
        campaign_id: campId, influencer_id: targetInflId, status: 'pending',
      });
    }
    toast(t('ci-sent-toast'), 'success');
    const _targetName = _ciModal.targetName || '';
    setTimeout(() => openChatWith(targetInflId, _targetName, role), 300);
    return;
  }

  const isOut = true;
  let fakeMsg = { id: 'demo-' + Date.now(), kind: 'invite', campaign_id: campId, invite_status: 'pending', conversation_id: partner?.convId || null, campaigns: camp };

  if (APP.user && partner?.convId) {
    const content = `📣 ${t('ci-invite-kicker')}: ${camp.name}`;
    const { data: newMsg, error } = await _sb.from('messages').insert({
      conversation_id: partner.convId, sender_id: APP.user.id,
      content, kind: 'invite', campaign_id: campId, invite_status: 'pending',
    }).select('*, campaigns(id,name,type,campaign_type,budget,fixed_fee,commission_rate,reward_amount,barter_description,requirements,deliverables,deadline)').single();

    if (error) { toast(error.message, 'error'); return; }
    fakeMsg = newMsg;
    if (partner.messages) partner.messages.push(newMsg);
    partner.preview = content;
    await _sb.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', partner.convId);
  }

  const msgs = document.getElementById('chat-msgs');
  if (msgs) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;justify-content:flex-end;margin-top:14px';
    wrap.innerHTML = _renderInviteCard(fakeMsg, role);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }
  toast(t('ci-sent-toast'), 'success');
}

// ── Accept / Reject (influencer side) ──────────────────────────────────────
async function acceptInvite(msgId, campId, convId, role) {
  _ciPatchCardStatus(msgId, 'accepted', role);

  if (APP.user) {
    const { error } = await _sb.from('messages').update({ invite_status: 'accepted' }).eq('id', msgId);
    if (error) { _ciPatchCardStatus(msgId, 'pending', role); toast(error.message, 'error'); return; }

    if (campId && APP.profileId) {
      const { data: ex } = await _sb.from('campaign_applications')
        .select('id,status').eq('campaign_id', campId).eq('influencer_id', APP.profileId).maybeSingle();
      if (ex) {
        await _sb.from('campaign_applications').update({ status: 'accepted' }).eq('id', ex.id);
      } else {
        await _sb.from('campaign_applications').insert({
          campaign_id: campId, influencer_id: APP.profileId, status: 'accepted',
        });
      }
    }
    if (convId) await _sb.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', convId);
  }
  toast(t('ci-accepted-toast'), 'success');
}

async function rejectInvite(msgId, convId, role) {
  _ciPatchCardStatus(msgId, 'rejected', role);
  if (APP.user) {
    const { error } = await _sb.from('messages').update({ invite_status: 'rejected' }).eq('id', msgId);
    if (error) { _ciPatchCardStatus(msgId, 'pending', role); toast(error.message, 'error'); return; }
    if (convId) await _sb.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', convId);
  }
  toast(t('ci-rejected-toast'), 'info');
}

function _ciPatchCardStatus(msgId, newStatus, role) {
  const arr     = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const partner = arr.find(m => m.convId === S.chatPartner);
  const msg     = partner?.messages?.find(m => String(m.id) === String(msgId));
  if (msg) msg.invite_status = newStatus;

  const card = document.getElementById('invite-card-' + msgId);
  if (card && msg) {
    const tmp   = document.createElement('div');
    tmp.innerHTML = _renderInviteCard(msg, role);
    const newCard = tmp.firstElementChild;
    if (newCard) card.replaceWith(newCard);
  }
}

// ── Handle incoming invite in realtime ─────────────────────────────────────
async function _ciHandleIncomingInvite(msg, convId, role) {
  if (!APP.user) return;
  const { data: fullMsg } = await _sb.from('messages')
    .select('*, campaigns(id,name,type,campaign_type,budget,fixed_fee,commission_rate,reward_amount,barter_description,requirements,deliverables,deadline)')
    .eq('id', msg.id).single();
  if (!fullMsg) return;

  const arr  = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const conv = arr.find(m => m.convId === convId);
  if (conv?.messages) conv.messages.push(fullMsg);

  const msgs = document.getElementById('chat-msgs');
  if (msgs) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;justify-content:flex-start;margin-top:14px';
    wrap.innerHTML = _renderInviteCard(fullMsg, role);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }
}
