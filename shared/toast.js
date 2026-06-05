// ══════════════════ TOAST NOTIFICATIONS ══════════════════════════════════

function toast(msg, type = 'success') {
  const colors = { success:'#10b981', error:'#ef4444', info:'#2079FF', warning:'#f59e0b' };
  const icons  = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;align-items:center;gap:12px;padding:14px 20px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);border-left:4px solid ${colors[type]};font-size:.9rem;color:#0D1B3E;font-weight:600;max-width:340px;animation:slideInToast .3s ease`;
  t.innerHTML = `<span style="width:22px;height:22px;border-radius:50%;background:${colors[type]};color:white;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0">${icons[type]}</span>${msg}`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.animation='slideOutToast .3s ease forwards'; setTimeout(()=>t.remove(),300); }, 3200);
}
