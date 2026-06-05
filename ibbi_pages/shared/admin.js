// ══════════════════ ADMIN ═══════════════════════════════════════════════════

function isAdmin() { return APP.profile?._isAdmin === true; }

async function loadAdminPanel() {
  const el = document.getElementById('admin-content');
  if (!el) return;
  if (!APP.user) { el.innerHTML = '<div style="text-align:center;padding:60px;color:#ef4444">Not logged in.</div>'; return; }

  el.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-mid)">Loading…</div>';

  const [pendingRes, topupRes, wiseRes] = await Promise.all([
    _sb.from('wallet_transactions')
      .select('*, wallets(influencer_id, influencer_profiles(full_name, name, username))')
      .eq('type', 'withdrawal').eq('status', 'pending')
      .order('created_at', { ascending: false }),
    _sb.from('biz_wallet_transactions')
      .select('*, biz_wallets(business_id, business_profiles(company_name))')
      .eq('type', 'topup').order('created_at', { ascending: false }).limit(20),
    _sb.from('wise_payouts').select('*').order('created_at', { ascending: false }).limit(20),
  ]);

  const pending = pendingRes.data || [];
  const topups = topupRes.data || [];
  const wisePays = wiseRes.data || [];

  const fmt = (d) => d ? new Date(d).toLocaleDateString('sk-SK') : '—';
  const badge = (s) => {
    const colors = { pending:'#f59e0b', completed:'#10b981', failed:'#ef4444', processing:'#3b82f6' };
    return `<span style="padding:2px 8px;border-radius:5px;font-size:.72rem;font-weight:700;background:${colors[s]||'#94a3b8'}22;color:${colors[s]||'#94a3b8'}">${s}</span>`;
  };

  el.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
    <h1 style="font-size:1.6rem;font-weight:900;color:var(--navy);margin:0">Finance Admin</h1>
    <button onclick="loadAdminPanel()" style="padding:8px 16px;border:1.5px solid var(--border);background:#fff;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:600">↺ Refresh</button>
  </div>

  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
      <h2 style="font-size:1.1rem;font-weight:800;color:var(--navy);margin:0">Pending Withdrawals <span style="background:#ef444422;color:#ef4444;padding:2px 8px;border-radius:6px;font-size:.8rem;margin-left:8px">${pending.length}</span></h2>
    </div>
    ${pending.length === 0 ? '<p style="color:var(--text-mid);text-align:center;padding:24px 0">No pending withdrawals.</p>' : `
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <thead><tr style="border-bottom:2px solid var(--border)">
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Date</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Influencer</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">IBAN</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Amount</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Method</th>
        <th style="padding:8px 12px"></th>
      </tr></thead>
      <tbody>
        ${pending.map(tx => {
          const infl = tx.wallets?.influencer_profiles;
          const name = infl?.full_name || infl?.name || infl?.username || '—';
          const iban = tx.iban_snapshot || '—';
          const ibanName = tx.iban_name_snapshot || name;
          return `<tr style="border-bottom:1px solid var(--border)" id="txn-row-${tx.id}">
            <td style="padding:11px 12px;color:var(--text-mid)">${fmt(tx.created_at)}</td>
            <td style="padding:11px 12px;font-weight:600;color:var(--navy)">${h(name)}</td>
            <td style="padding:11px 12px;font-family:monospace;font-size:.82rem;color:var(--text-mid)">${h(iban)}<br><span style="font-size:.75rem;color:var(--text-light)">${h(ibanName)}</span></td>
            <td style="padding:11px 12px;font-weight:800;color:var(--navy);font-size:1rem">€${Number(tx.amount).toLocaleString()}</td>
            <td style="padding:11px 12px">${badge(tx.status)}</td>
            <td style="padding:11px 12px;display:flex;gap:8px">
              <button onclick="adminMarkPaid('${tx.id}')" style="padding:7px 14px;background:var(--blue);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.82rem">✓ Mark paid</button>
              <button onclick="adminTriggerWise('${tx.id}')" style="padding:7px 14px;background:var(--navy);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.82rem" title="Send via Wise API">⚡ Wise</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`}
  </div>

  <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
    <h2 style="font-size:1.1rem;font-weight:800;color:var(--navy);margin:0 0 18px">Business Top-Ups (last 20)</h2>
    ${topups.length === 0 ? '<p style="color:var(--text-mid);text-align:center;padding:24px 0">No top-ups yet.</p>' : `
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <thead><tr style="border-bottom:2px solid var(--border)">
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Date</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Business</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Amount</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Status</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Stripe Session</th>
      </tr></thead>
      <tbody>
        ${topups.map(tx => `<tr style="border-bottom:1px solid var(--border)">
          <td style="padding:11px 12px;color:var(--text-mid)">${fmt(tx.created_at)}</td>
          <td style="padding:11px 12px;font-weight:600">${tx.biz_wallets?.business_profiles?.company_name || '—'}</td>
          <td style="padding:11px 12px;font-weight:800;color:#10b981">+€${Number(tx.amount).toLocaleString()}</td>
          <td style="padding:11px 12px">${badge(tx.status)}</td>
          <td style="padding:11px 12px;font-size:.75rem;color:var(--text-light);font-family:monospace">${tx.stripe_session_id ? tx.stripe_session_id.slice(0,24)+'…' : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`}
  </div>

  <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
    <h2 style="font-size:1.1rem;font-weight:800;color:var(--navy);margin:0 0 18px">Wise Payouts Log</h2>
    ${wisePays.length === 0 ? '<p style="color:var(--text-mid);text-align:center;padding:24px 0">No Wise payouts yet.</p>' : `
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <thead><tr style="border-bottom:2px solid var(--border)">
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Date</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Recipient</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">IBAN</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Amount</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Status</th>
        <th style="text-align:left;padding:8px 12px;color:var(--text-light);font-weight:700;font-size:.75rem;text-transform:uppercase">Transfer ID</th>
      </tr></thead>
      <tbody>
        ${wisePays.map(p => `<tr style="border-bottom:1px solid var(--border)">
          <td style="padding:11px 12px;color:var(--text-mid)">${fmt(p.created_at)}</td>
          <td style="padding:11px 12px;font-weight:600">${p.target_name}</td>
          <td style="padding:11px 12px;font-family:monospace;font-size:.8rem;color:var(--text-mid)">${p.target_iban}</td>
          <td style="padding:11px 12px;font-weight:800">€${Number(p.amount).toLocaleString()}</td>
          <td style="padding:11px 12px">${badge(p.status)}</td>
          <td style="padding:11px 12px;font-size:.75rem;font-family:monospace;color:var(--text-light)">${p.wise_transfer_id || '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`}
  </div>`;
}

async function adminMarkPaid(txnId) {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { toast('Not authenticated', 'error'); return; }
  const row = document.getElementById(`txn-row-${txnId}`);
  if (row) row.style.opacity = '.5';
  const res = await fetch(`${FN_URL}/admin-mark-paid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify({ transaction_id: txnId }),
  });
  const data = await res.json();
  if (!res.ok) { toast(data.error || 'Failed', 'error'); if (row) row.style.opacity = '1'; return; }
  toast('Marked as paid!', 'success');
  if (row) row.remove();
}

async function adminTriggerWise(txnId) {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { toast('Not authenticated', 'error'); return; }
  const res = await fetch(`${FN_URL}/wise-payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify({ transaction_id: txnId }),
  });
  const data = await res.json();
  if (!res.ok) { toast(data.error || 'Wise failed', 'error'); return; }
  toast(`Wise transfer initiated! ID: ${data.transfer_id}`, 'success');
  setTimeout(loadAdminPanel, 1000);
}
