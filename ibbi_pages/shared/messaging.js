// ══════════════════ MESSAGING ═════════════════════════════════════════════

let _chatChannel = null;
let _findUserRole = null;

// ── Helpers ──────────────────────────────────────────────────────────────

function msgFilterLabel(f) {
  const labels = { all: t('msg-filter-all'), unread: t('msg-filter-unread'), starred: t('msg-filter-starred'), creators: t('msg-filter-creators') };
  return labels[f] || f;
}

function filterMsgConvs(arr) {
  let list = arr.slice();
  if (S.msgSearch) {
    const q = S.msgSearch.toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(q) || (m.preview || '').toLowerCase().includes(q));
  }
  if (S.msgFilter === 'unread') list = list.filter(m => m.unread > 0);
  return list;
}

function buildChatMsgs(partner, user, role) {
  if (!partner) return '';
  if (partner.messages?.length) {
    return partner.messages.map(m => {
      const isOut = m.sender_id === user?.id;
      if (m.kind === 'invite') {
        return `<div style="display:flex;justify-content:${isOut ? 'flex-end' : 'flex-start'};margin-top:14px">${_renderInviteCard(m, role)}</div>`;
      }
      return `<div class="msg-bubble ${isOut ? 'out' : 'in'}">${h(m.content)}</div>`;
    }).join('');
  }
  if (user) {
    return `<div class="msg-empty"><span>${t('msg-no-msgs-yet') || 'No messages yet. Say hello!'}</span></div>`;
  }
  return CHAT_HISTORY.map(m =>
    `<div class="msg-bubble ${m.from === 'me' ? 'out' : 'in'}">${h(m.text)}</div>`
  ).join('');
}

// ── State mutators (re-render messages page) ─────────────────────────────

function setMsgFilter(f, role) {
  S.msgFilter = f;
  const content = document.getElementById(role === 'biz' ? 'biz-content' : 'infl-content');
  if (content) content.innerHTML = role === 'biz' ? renderBizMessages() : renderInflMessages();
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function setMsgSearch(q, role) {
  S.msgSearch = q;
  const cl = document.querySelector('.msg-cl-list');
  if (!cl) return;
  const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const filtered = filterMsgConvs(arr);
  cl.innerHTML = renderMsgConvList(arr, filtered, role);
}

function toggleMsgInfo(role) {
  S.msgInfoOpen = !S.msgInfoOpen;
  const content = document.getElementById(role === 'biz' ? 'biz-content' : 'infl-content');
  if (content) content.innerHTML = role === 'biz' ? renderBizMessages() : renderInflMessages();
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

// ── Conv list fragment (used by setMsgSearch for partial re-render) ──────

function renderMsgConvList(arr, filtered, role) {
  if (!filtered.length) {
    return `<div class="msg-empty"><span>${t(role === 'biz' ? 'msg-no-convs-biz' : 'msg-no-convs') || 'No conversations yet'}</span></div>`;
  }
  return filtered.map(m => {
    const i = arr.indexOf(m);
    return `<div class="msg-conv-item${m.convId === S.chatPartner ? ' active' : ''}" onclick="selectChat('${m.convId}','${role}')">
      <div class="msg-conv-avatar" style="background:${m.color}">${m.avatar}</div>
      <div class="msg-conv-body">
        <div class="msg-conv-name">${h(m.name)}</div>
        <div class="msg-conv-preview">${h(m.preview || '…')}</div>
      </div>
      <div class="msg-conv-meta">
        <span class="msg-conv-time">${m.time}</span>
        ${m.unread ? `<span class="msg-conv-badge">${m.unread}</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── FindUser modal ────────────────────────────────────────────────────────

let _fuTab = 'all';
let _fuQuery = '';
let _fuResults = [];
let _fuRecommended = [];
let _fuLoading = false;
let _fuSearchTimer = null;
let _fuFilterOpen = false;

const _FU_TAGS = ['Beauty', 'Fitness', 'Food', 'Travel', 'Tech', 'Lifestyle', 'Pharma', 'Retail'];
const _FU_COLORS = ['#ff6b9d','#5b4ee5','#2079FF','#1aa971','#f59e0b','#e94b4b','#7c3aed','#db2777'];

function _fuColor(name) { return _FU_COLORS[(name?.charCodeAt(0) || 0) % _FU_COLORS.length]; }
function _fuInitials(name) { return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IB'; }

function _fuGetRecent() {
  try { return JSON.parse(localStorage.getItem('ibbi_fu_recent') || '[]'); } catch { return []; }
}
function _fuSaveRecent(q) {
  if (!q.trim()) return;
  try {
    const r = _fuGetRecent().filter(s => s !== q).slice(0, 3);
    localStorage.setItem('ibbi_fu_recent', JSON.stringify([q, ...r]));
  } catch {}
}

function _fuNormalize(p, role) {
  if (role === 'biz') {
    const name = p.full_name || p.name || p.username || p.handle || 'Unknown';
    return { id: p.id, type: 'creator', name, handle: p.handle || p.username || '', followers: p.follower_count ? fmtFollowers(p.follower_count) : null, tags: p.niche ? [p.niche] : [], verified: p.verified || false };
  }
  const name = p.company_name || 'Unknown';
  return { id: p.id, type: 'brand', name, handle: '', followers: null, tags: p.industry ? [p.industry] : [], verified: p.verified || false };
}

function _fuCard(u) {
  const color = _fuColor(u.name);
  const initials = _fuInitials(u.name);
  const rolePill = u.type === 'brand' ? t('fu-role-brand') : t('fu-role-creator');
  const verifiedSvg = u.verified ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="var(--blue)"><path d="M12 1l2.6 2L18 2.5l.5 3.4L21 8l-1.4 3L21 14l-2.5 2.1L18 19.5 14.6 19 12 21l-2.6-2L6 19.5 5.5 16 3 14l1.4-3L3 8l2.5-2.1L6 2.5 9.4 3 12 1z"/><path d="M8 12l3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : '';
  const safeId = h(u.id).replace(/'/g, "\\'");
  const safeName = h(u.name).replace(/'/g, "\\'");
  return `<div class="fu-card" onclick="fuStartChat('${safeId}','${safeName}','${_findUserRole}')">
    <div class="fu-card-avatar" style="background:${color}">${initials}</div>
    <div class="fu-card-body">
      <div class="fu-card-top">
        <span class="fu-card-name">${h(u.name)}${verifiedSvg}</span>
        ${u.handle ? `<span class="fu-card-handle">${h(u.handle)}</span>` : ''}
      </div>
      <div class="fu-card-meta">
        <span class="fu-role-pill">${rolePill}</span>
        ${u.followers ? `· <strong style="color:var(--navy)">${u.followers}</strong> ${t('fu-followers-label')}` : ''}
        ${u.tags.map(t => `<span class="fu-tag">#${h(t)}</span>`).join('')}
      </div>
    </div>
    <button class="fu-msg-btn" onclick="event.stopPropagation();fuStartChat('${safeId}','${safeName}','${_findUserRole}')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>
      ${t('fu-write-btn')}
    </button>
  </div>`;
}

function _fuBodyHtml() {
  const recent = _fuGetRecent();
  const empty = !_fuQuery.trim();
  const list = empty ? _fuRecommended : _fuResults;
  const label = empty ? t('fu-recommended') : `${t('fu-results-for')} „${h(_fuQuery)}" · ${list.length}`;
  return `
    ${empty && recent.length ? `<div class="fu-section">
      <div class="fu-section-label">${t('fu-recent-searches')}</div>
      <div class="fu-chips">
        ${recent.map(r => `<button class="fu-chip" onclick="_fuSetQuery('${h(r).replace(/'/g,"\\'")}')">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          ${h(r)}</button>`).join('')}
      </div></div>` : ''}
    ${empty ? `<div class="fu-section">
      <div class="fu-section-label">${t('fu-popular-cats')}</div>
      <div class="fu-chips">
        ${_FU_TAGS.map(tag => `<button class="fu-chip fu-chip-cat" onclick="_fuSetQuery('${tag.toLowerCase()}')">#${tag}</button>`).join('')}
      </div></div>` : ''}
    <div class="fu-section">
      <div class="fu-section-label">${label}</div>
      <div class="fu-results">
        ${_fuLoading ? `<div class="fu-no-results">${t('fu-searching')}</div>` :
          list.length ? list.map(u => _fuCard(u)).join('') :
          `<div class="fu-no-results">${empty ? (APP.user ? t('fu-loading-recommended') : t('fu-login-required')) : t('fu-no-results')}</div>`}
      </div>
    </div>`;
}

function _fuRefreshBody() {
  const body = document.querySelector('#find-user-overlay .fu-body');
  if (body) body.innerHTML = _fuBodyHtml();
}

function _fuToggleFilter() {
  _fuFilterOpen = !_fuFilterOpen;
  const panel = document.getElementById('fu-filter-panel');
  const btn = document.getElementById('fu-filter-btn');
  if (panel) panel.style.display = _fuFilterOpen ? 'flex' : 'none';
  if (btn) btn.classList.toggle('active', _fuFilterOpen);
}

function _fuSetTab(tab) {
  _fuTab = tab;
  document.querySelectorAll('#fu-filter-panel .fu-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  if (_fuQuery.trim()) _fuDoSearch(); else _fuLoadRecommended();
}

function _fuSetQuery(q) {
  _fuQuery = q;
  const inp = document.getElementById('fu-input');
  if (inp) inp.value = q;
  _fuOnInput(q);
}

function _fuOnInput(v) {
  _fuQuery = v;
  clearTimeout(_fuSearchTimer);
  if (!v.trim()) { _fuResults = []; _fuRefreshBody(); return; }
  _fuLoading = true; _fuRefreshBody();
  _fuSearchTimer = setTimeout(_fuDoSearch, 280);
}

function _fuTableConfig() {
  if (_fuTab === 'influencers') return { table: 'influencer_profiles', fields: 'id,full_name,name,username,handle,niche,follower_count,verified', nameCol: 'full_name', normRole: 'biz' };
  if (_fuTab === 'brands') return { table: 'business_profiles', fields: 'id,company_name,industry,verified', nameCol: 'company_name', normRole: 'infl' };
  const r = _findUserRole;
  return r === 'biz'
    ? { table: 'influencer_profiles', fields: 'id,full_name,name,username,handle,niche,follower_count,verified', nameCol: 'full_name', normRole: 'biz' }
    : { table: 'business_profiles', fields: 'id,company_name,industry,verified', nameCol: 'company_name', normRole: 'infl' };
}

async function _fuDoSearch() {
  if (!APP.user || !_fuQuery.trim()) { _fuLoading = false; _fuRefreshBody(); return; }
  const { table, fields, nameCol, normRole } = _fuTableConfig();
  const { data } = await _sb.from(table).select(fields).ilike(nameCol, `%${_fuQuery.trim()}%`).limit(8);
  _fuLoading = false;
  _fuResults = (data || []).map(p => _fuNormalize(p, normRole));
  _fuRefreshBody();
}

async function _fuLoadRecommended() {
  if (!APP.user) { _fuRecommended = []; _fuRefreshBody(); return; }
  const { table, fields, normRole } = _fuTableConfig();
  const { data } = await _sb.from(table).select(fields).limit(5);
  _fuRecommended = (data || []).map(p => _fuNormalize(p, normRole));
  _fuRefreshBody();
}

function openFindUser(role) {
  document.getElementById('find-user-overlay')?.remove();
  _findUserRole = role;
  _fuTab = 'all'; _fuQuery = ''; _fuResults = []; _fuRecommended = []; _fuLoading = false; _fuFilterOpen = false;

  const overlay = document.createElement('div');
  overlay.id = 'find-user-overlay';
  overlay.className = 'fu-overlay';
  overlay.innerHTML = `
    <div class="fu-panel" onclick="event.stopPropagation()">
      <div class="fu-header">
        <div class="fu-search-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="fu-input" class="fu-input" placeholder="${t('fu-placeholder')}" autocomplete="off" oninput="_fuOnInput(this.value)">
          <button class="fu-close-btn" onclick="closeFindUser()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="fu-tabs">
          <span style="flex:1"></span>
          <button id="fu-filter-btn" class="fu-filter-btn" onclick="_fuToggleFilter()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
            ${t('fu-filters-btn')}
          </button>
        </div>
        <div id="fu-filter-panel" class="fu-filter-panel" style="display:none">
          <button class="fu-tab active" data-tab="all" onclick="_fuSetTab('all')">${t('fu-filter-all')}</button>
          <button class="fu-tab" data-tab="influencers" onclick="_fuSetTab('influencers')">${t('fu-filter-influencers')}</button>
          <button class="fu-tab" data-tab="brands" onclick="_fuSetTab('brands')">${t('fu-filter-brands')}</button>
        </div>
      </div>
      <div class="fu-body">${_fuBodyHtml()}</div>
      <div class="fu-footer">
        <div class="fu-footer-hints">
          <span><kbd class="fu-kbd">↑↓</kbd> ${t('fu-nav-hint')}</span>
          <span><kbd class="fu-kbd">↵</kbd> ${t('fu-open-hint')}</span>
          <span><kbd class="fu-kbd">Esc</kbd> ${t('fu-close-hint')}</span>
        </div>
        <button class="fu-invite-btn" onclick="toast(t('msg-coming-soon'),'info')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          ${t('fu-invite-email')}
        </button>
      </div>
    </div>`;
  overlay.addEventListener('click', closeFindUser);
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('fu-input')?.focus(), 50);
  _fuLoadRecommended();
}

function closeFindUser() {
  document.getElementById('find-user-overlay')?.remove();
}

function fuStartChat(profileId, name, role) {
  if (_fuQuery.trim()) _fuSaveRecent(_fuQuery.trim());
  closeFindUser();
  openChatWith(profileId, name, role);
}

function searchUsersDB(query, role) {
  _fuSetQuery(query);
}

// ── Core messaging ────────────────────────────────────────────────────────

function cleanupChatSub() {
  if (_chatChannel) {
    try { _chatChannel.unsubscribe(); } catch(e) {}
    try { _sb.removeChannel(_chatChannel); } catch(e) {}
    _chatChannel = null;
  }
}

function subscribeChat(convId, role) {
  cleanupChatSub();
  if (!convId || !APP.user) return;
  _chatChannel = _sb.channel('chat:' + convId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `conversation_id=eq.${convId}`
    }, payload => {
      const msg = payload.new;
      if (msg.sender_id === APP.user?.id) return;
      if (msg.kind === 'invite') {
        _ciHandleIncomingInvite(msg, convId, role);
        return;
      }
      const msgs = document.getElementById('chat-msgs');
      if (msgs) {
        const div = document.createElement('div');
        div.className = 'msg-bubble in';
        div.textContent = msg.content;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
      }
      const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
      const conv = arr.find(m => m.convId === convId);
      if (conv) { conv.preview = msg.content; conv.messages.push(msg); }
    })
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'messages',
      filter: `conversation_id=eq.${convId}`
    }, payload => {
      const msg = payload.new;
      if (msg.kind !== 'invite') return;
      const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
      const conv = arr.find(c => c.convId === convId);
      if (conv?.messages) {
        const m = conv.messages.find(x => x.id === msg.id);
        if (m) m.invite_status = msg.invite_status;
      }
      _ciPatchCardStatus(msg.id, msg.invite_status, role);
    })
    .subscribe();
}

function selectChat(convId, role) {
  const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const partner = arr.find(m => m.convId === convId);
  S.chatPartner = partner?.convId || null;
  const content = document.getElementById(role === 'biz' ? 'biz-content' : 'infl-content');
  if (content) content.innerHTML = role === 'biz' ? renderBizMessages() : renderInflMessages();
  if (partner?.convId) subscribeChat(partner.convId, role);
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function sendMsg(role) {
  const input = document.getElementById('chat-in');
  const msgs = document.getElementById('chat-msgs');
  if (!input || !msgs || !input.value.trim()) return;
  const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  const partner = arr.find(m => m.convId === S.chatPartner) || null;
  const convId = S.chatPartner || null;
  const otherId = partner?.otherId || null;
  if (APP.user && convId) {
    sendMsgDB(role, convId, otherId);
  } else {
    const div = document.createElement('div');
    div.className = 'msg-bubble out'; div.textContent = input.value.trim();
    msgs.appendChild(div); input.value = ''; msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      const replies = ['Got it, thanks!', 'Sure, I can do that 👍', 'Sounds great!', "I'll check and get back to you.", "Perfect, let's proceed!"];
      const reply = document.createElement('div');
      reply.className = 'msg-bubble in'; reply.textContent = replies[Math.floor(Math.random() * replies.length)];
      msgs.appendChild(reply); msgs.scrollTop = msgs.scrollHeight;
    }, 900);
  }
}

let _kbListenerActive = false;
function _msgKbHandler(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openFindUser(_findUserRole); }
  if (e.key === 'Escape') closeFindUser();
}

function initChat(role) {
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
  _findUserRole = role;
  document.removeEventListener('keydown', _msgKbHandler);
  document.addEventListener('keydown', _msgKbHandler);
  _kbListenerActive = true;
}

let _openChatLock = false;

async function openChatWith(otherProfileId, displayName, role) {
  if (_openChatLock) return;
  _openChatLock = true;
  try {
  if (!APP.user || !APP.profileId) { toast(t('msg-login-required'), 'error'); return; }
  const myField = role === 'biz' ? 'business_id' : 'influencer_id';
  const otherField = role === 'biz' ? 'influencer_id' : 'business_id';

  if (role === 'biz') bizPage('messages');
  else inflPage('messages');

  const { data: existing } = await _sb.from('conversations')
    .select('id')
    .eq(myField, APP.profileId)
    .eq(otherField, otherProfileId)
    .maybeSingle();

  let convId = existing?.id;
  if (!convId) {
    const payload = { [myField]: APP.profileId, [otherField]: otherProfileId };
    const { data: newConv, error } = await _sb.from('conversations').insert(payload).select('id').single();
    if (error) { toast(t('msg-create-chat-error') + error.message, 'error'); return; }
    convId = newConv?.id;
  }
  if (!convId) { toast(t('msg-open-chat-error'), 'error'); return; }

  await loadConversations(role);
  S.chatPartner = convId;

  const content = document.getElementById(role === 'biz' ? 'biz-content' : 'infl-content');
  if (content) content.innerHTML = role === 'biz' ? renderBizMessages() : renderInflMessages();
  subscribeChat(convId, role);
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
  } finally {
    _openChatLock = false;
  }
}

async function loadConversations(role) {
  if (!APP.user || !APP.profileId) return;
  const myField = role === 'biz' ? 'business_id' : 'influencer_id';
  const { data: convs } = await _sb
    .from('conversations')
    .select('*, messages(content, created_at, sender_id, id, kind, campaign_id, invite_status, campaigns(id,name,type,campaign_type,budget,fixed_fee,commission_rate,reward_amount,barter_description,requirements,deliverables,deadline)), business_profiles(company_name, id), influencer_profiles(full_name, name, username, handle, id, niche, follower_count)')
    .eq(myField, APP.profileId)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(20);
  const arr = role === 'biz' ? MESSAGES_BIZ : MESSAGES_INFL;
  arr.length = 0;
  if (convs?.length) {
    convs.forEach((c, i) => {
      const otherProfile = role === 'biz' ? c.influencer_profiles : c.business_profiles;
      const name = otherProfile?.full_name || otherProfile?.name || otherProfile?.company_name || otherProfile?.username || 'Unknown';
      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const lastMsg = (c.messages || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      arr.push({
        id: i, convId: c.id, name, avatar: initials,
        color: ['#7c3aed','#db2777','#059669','#2079FF','#f59e0b'][i % 5],
        preview: lastMsg?.content || '…', time: lastMsg ? relTime(lastMsg.created_at) : '',
        unread: 0,
        niche: otherProfile?.niche || null,
        followers: otherProfile?.follower_count ? fmtFollowers(otherProfile.follower_count) : null,
        otherId: role === 'biz' ? c.influencer_profiles?.id : c.business_profiles?.id,
        messages: (c.messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      });
    });
  }
  const content = document.getElementById(role === 'biz' ? 'biz-content' : 'infl-content');
  if (content && ((role === 'biz' && S.bizPage === 'messages') || (role === 'infl' && S.inflPage === 'messages'))) {
    content.innerHTML = role === 'biz' ? renderBizMessages() : renderInflMessages();
    initChat(role);
  }
}

function relTime(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return 'now'; if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`; return `${Math.floor(d / 86400)}d`;
}

async function sendMsgDB(role, convId, otherId) {
  const input = document.getElementById('chat-in');
  if (!input?.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  const msgs = document.getElementById('chat-msgs');
  if (msgs) {
    const div = document.createElement('div');
    div.className = 'msg-bubble out'; div.textContent = text;
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }
  if (!APP.user) return;
  let cId = convId;
  if (!cId && APP.profileId) {
    const convPayload = role === 'biz'
      ? { business_id: APP.profileId, influencer_id: otherId }
      : { influencer_id: APP.profileId, business_id: otherId };
    const { data: conv } = await _sb.from('conversations').insert(convPayload).select().single();
    cId = conv?.id;
  }
  if (!cId) return;
  await _sb.from('messages').insert({ conversation_id: cId, sender_id: APP.user.id, content: text });
  await _sb.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', cId);
}
