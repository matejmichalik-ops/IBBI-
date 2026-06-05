// ══════════════════ INFLUENCER PROFILE MODAL ══════════════════════════════

function showInflModal(id) {
  const infl = INFLUENCERS.find(i=>i.id===id);
  if (!infl) return;
  const match = calcMatch(infl);
  let overlay = document.getElementById('infl-modal-overlay');
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'infl-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:7000;background:rgba(13,27,62,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };
  const platformIcons = {
    ig:`<svg width="16" height="16" viewBox="0 0 24 24" style="color:#e1306c;flex-shrink:0"><use href="#ico-instagram"/></svg>`,
    tt:`<svg width="16" height="16" viewBox="0 0 24 24" style="color:#010101;flex-shrink:0"><use href="#ico-tiktok"/></svg>`,
    yt:`<svg width="16" height="16" viewBox="0 0 24 24" style="color:#ff0000;flex-shrink:0"><use href="#ico-youtube"/></svg>`,
    fb:`<svg width="16" height="16" viewBox="0 0 24 24" style="color:#1877f2;flex-shrink:0"><use href="#ico-facebook"/></svg>`,
  };
  const platformNames = {ig:'Instagram',tt:'TikTok',yt:'YouTube',fb:'Facebook'};
  overlay.innerHTML = `
    <div data-modal-name="${h(infl.handle || infl.name)}" style="background:white;border-radius:20px;width:100%;max-width:580px;max-height:88vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.2);animation:slideUpModal .25s ease">
      <div style="height:180px;background:linear-gradient(135deg,var(--navy) 0%,#0A3A8F 60%,var(--blue) 100%);border-radius:20px 20px 0 0;position:relative">
        <button onclick="document.getElementById('infl-modal-overlay').remove()" style="position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,.18);color:white;cursor:pointer;font-size:1rem;backdrop-filter:blur(4px)">✕</button>
        <div style="position:absolute;top:16px;left:16px;display:flex;align-items:center;gap:8px;padding:7px 14px;background:rgba(255,255,255,.15);border-radius:24px;border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(4px)">
          <span style="font-size:.72rem;color:rgba(255,255,255,.85);font-weight:700;letter-spacing:.06em">SMART MATCH</span>
          <span style="font-weight:900;color:white;font-size:1rem">${match}%</span>
          <div style="width:9px;height:9px;border-radius:50%;background:${matchColor(match)};box-shadow:0 0 6px ${matchColor(match)}"></div>
        </div>
        <div style="position:absolute;bottom:-44px;left:28px;width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#7c3aed);border:4px solid white;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:1.6rem;box-shadow:0 4px 16px rgba(0,0,0,.15)">${infl.avatar}</div>
      </div>
      <div style="padding:0 28px 28px">
        <div style="display:flex;align-items:flex-start;justify-content:flex-end;padding-top:12px;margin-bottom:32px">
          <div style="display:flex;gap:8px">
            <button onclick="document.getElementById('infl-modal-overlay').remove();openChatWith(${infl.id},${h(JSON.stringify(infl.handle||infl.name))},'biz')" class="btn btn-primary" style="padding:9px 20px;font-size:.9rem">${t('modal-message')}</button>
            <button onclick="toast(this.closest('[data-modal-name]').dataset.modalName+' '+(t('ic-invited-toast')||'invited'),'success');document.getElementById('infl-modal-overlay').remove()" style="padding:9px 20px;border:1.5px solid var(--blue-mid);background:var(--blue-light);border-radius:10px;cursor:pointer;font-size:.9rem;font-weight:600;color:var(--blue)">${t('modal-invite')}</button>
          </div>
        </div>
        <div style="margin-bottom:16px">
          <div style="font-size:1.25rem;font-weight:800;color:var(--navy)">${h(infl.handle || infl.name)} ${infl.verified?'<span style="color:var(--blue);font-size:1rem">✓</span>':''}</div>
          <div style="font-size:.82rem;color:var(--text-mid);margin-bottom:2px">${h(infl.name)}</div>
          <div style="font-size:.88rem;color:var(--text-mid)">${h(infl.niche)}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
          ${[[t('modal-followers'),infl.followers],[t('modal-eng-rate'),infl.er],[t('modal-campaigns'),infl.campaigns],[t('prof-rating-label'),infl.rating+starSvg()]].map(([k,v])=>`
          <div style="background:var(--blue-soft);border-radius:10px;padding:12px;text-align:center">
            <div style="font-weight:800;color:var(--navy);font-size:1rem">${v}</div>
            <div style="font-size:.72rem;color:var(--text-mid);margin-top:2px">${k}</div>
          </div>`).join('')}
        </div>
        <div style="padding:14px;background:var(--blue-soft);border-radius:12px;margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-weight:700;font-size:.88rem;color:var(--navy)">${t('modal-smart-match')}</div>
            <div style="font-weight:900;color:${matchColor(match)};font-size:1.1rem">${match}%</div>
          </div>
          <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${match}%;background:${matchColor(match)};border-radius:4px;transition:width .6s ease"></div>
          </div>
          <div style="font-size:.78rem;color:var(--text-mid);margin-top:6px">${match>=85?t('modal-match-excellent'):match>=70?t('modal-match-good'):t('modal-match-moderate')}</div>
        </div>
        <div style="margin-bottom:18px">
          <div style="font-weight:700;color:var(--navy);margin-bottom:10px;font-size:.88rem">${t('modal-platforms')}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${infl.platforms.map(p=>`<div style="display:flex;align-items:center;gap:6px;padding:7px 14px;background:var(--blue-soft);border-radius:8px;font-size:.85rem;font-weight:600;color:var(--navy)">${platformIcons[p]} ${platformNames[p]}</div>`).join('')}
          </div>
        </div>
        <div style="padding:14px 18px;border:1.5px solid var(--border);border-radius:12px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:.88rem;color:var(--text-mid)">${t('modal-price-range')}</div>
          <div style="font-weight:800;color:var(--navy);font-size:1.05rem">${infl.price}</div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
