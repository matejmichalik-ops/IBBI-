// ══════════════════ NOTIFICATIONS ═════════════════════════════════════════

let NOTIFS = [];
let _notifChannel = null;

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

async function loadNotifications() {
  if (!APP.user) return;
  const { data } = await _sb.from('notifications')
    .select('*')
    .eq('user_id', APP.user.id)
    .order('created_at', { ascending: false })
    .limit(30);
  if (data) NOTIFS = data;
  updateNotifBadge();
}

function subscribeNotifications() {
  if (!APP.user) return;
  if (_notifChannel) { _sb.removeChannel(_notifChannel); _notifChannel = null; }
  _notifChannel = _sb.channel('notifs:' + APP.user.id)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notifications',
      filter: `user_id=eq.${APP.user.id}`
    }, payload => {
      NOTIFS.unshift(payload.new);
      updateNotifBadge();
      const n = payload.new;
      toast(`<strong>${h(n.title)}</strong>${n.body ? `<br><span style="font-size:.8rem">${h(n.body)}</span>` : ''}`, 'info');
    })
    .subscribe();
}

function updateNotifBadge() {
  const count = NOTIFS.filter(n => !n.read).length;
  ['biz-notif-badge', 'infl-notif-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = count > 9 ? '9+' : String(count);
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  const mobDot = document.getElementById('mob-notif-dot');
  if (mobDot) mobDot.style.display = count > 0 ? 'block' : 'none';
}

function toggleNotifs(role) {
  let panel = document.getElementById('notif-panel');
  if (panel) { panel.remove(); return; }
  panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.style.cssText = 'position:fixed;top:72px;right:20px;z-index:8000;width:360px;background:white;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.18);border:1px solid var(--border);overflow:hidden;animation:fadeInDown .2s ease';
  const items = NOTIFS.length
    ? NOTIFS.map(n => `
      <div onclick="markOneRead('${n.id}','${role}')" style="display:flex;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border);cursor:pointer;background:${n.read?'white':'var(--blue-soft)'};transition:.15s" onmouseover="this.style.background='var(--blue-light)'" onmouseout="this.style.background='${n.read?'white':'var(--blue-soft)'}'">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-${h(n.icon||'bell')}"/></svg></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.88rem;color:var(--navy);display:flex;justify-content:space-between;gap:4px">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h(n.title)}</span>${!n.read?'<span style="width:8px;height:8px;border-radius:50%;background:var(--blue);flex-shrink:0;margin-top:4px"></span>':''}
          </div>
          <div style="font-size:.8rem;color:var(--text-mid);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h(n.body||'')}</div>
          <div style="font-size:.75rem;color:var(--text-light);margin-top:4px">${timeAgo(n.created_at)}</div>
        </div>
      </div>`).join('')
    : `<div style="padding:32px;text-align:center;color:var(--text-light);font-size:.9rem">${t('notif-none')}</div>`;
  panel.innerHTML = `
    <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:800;color:var(--navy)">${t('notif-panel-heading')}</div>
      <div style="display:flex;gap:10px;align-items:center">
        <button onclick="markAllRead('${role}')" style="font-size:.78rem;color:var(--blue);border:none;background:none;cursor:pointer;font-weight:600">${t('notif-mark-all-read')}</button>
        <button onclick="document.getElementById('notif-panel').remove()" style="width:26px;height:26px;border-radius:50%;border:none;background:var(--blue-soft);cursor:pointer;font-size:.9rem">✕</button>
      </div>
    </div>
    <div style="max-height:380px;overflow-y:auto">${items}</div>
    <div style="padding:12px;text-align:center;border-top:1px solid var(--border)">
      <button onclick="document.getElementById('notif-panel').remove()" style="font-size:.85rem;color:var(--blue);border:none;background:none;cursor:pointer;font-weight:600">${t('btn-close')}</button>
    </div>`;
  document.body.appendChild(panel);
  setTimeout(() => document.addEventListener('click', function h(e) {
    if (!panel.contains(e.target)) { panel.remove(); document.removeEventListener('click', h); }
  }), 50);
}

async function markAllRead(role) {
  if (APP.user) {
    await _sb.from('notifications').update({ read: true }).eq('user_id', APP.user.id).eq('read', false);
  }
  NOTIFS.forEach(n => n.read = true);
  updateNotifBadge();
  const panel = document.getElementById('notif-panel');
  if (panel) { panel.remove(); toggleNotifs(role); }
  toast('All notifications marked as read', 'info');
}

async function markOneRead(id, role) {
  const n = NOTIFS.find(n => String(n.id) === String(id));
  if (n && !n.read) {
    n.read = true;
    if (APP.user) await _sb.from('notifications').update({ read: true }).eq('id', id);
    updateNotifBadge();
    const panel = document.getElementById('notif-panel');
    if (panel) { panel.remove(); toggleNotifs(role); }
  }
}
