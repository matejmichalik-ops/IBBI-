// ══════════════════ WALLET ════════════════════════════════════════════════

async function topUpBizWallet() {
  const amountInput = document.getElementById('topup-amount');
  const amount = parseFloat(amountInput?.value);
  if (!amount || amount < 10) { toast(t('wallet-min-topup'), 'error'); return; }
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { toast(t('wallet-login-again'), 'error'); return; }
  const btn = document.querySelector('#biz-topup-modal .btn-primary');
  if (btn) { btn.textContent = t('btn-stripe-redirect'); btn.disabled = true; }
  try {
    const res = await fetch(`${FN_URL}/stripe-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ amount, return_url: window.location.href.split('?')[0] }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      toast(data.error || t('wallet-payment-failed'), 'error');
      if (btn) { btn.textContent = t('btn-pay-card'); btn.disabled = false; }
      return;
    }
    window.location.href = data.url;
  } catch (err) {
    toast(t('wallet-network-error'), 'error');
    if (btn) { btn.textContent = t('btn-pay-card'); btn.disabled = false; }
  }
}

async function saveInflIban() {
  const iban = document.getElementById('iban-input')?.value?.trim().replace(/\s/g, '').toUpperCase();
  const name = document.getElementById('iban-name-input')?.value?.trim();
  if (!iban || iban.length < 15) { toast(t('wallet-valid-iban'), 'error'); return; }
  if (!name) { toast(t('wallet-holder-name'), 'error'); return; }
  if (!APP.profileId) { toast(t('wallet-profile-not-loaded'), 'error'); return; }
  const { error } = await _sb.from('influencer_payment_info').upsert(
    { influencer_id: APP.profileId, iban, iban_name: name },
    { onConflict: 'influencer_id' }
  );
  if (error) { toast(t('wallet-iban-save-fail'), 'error'); return; }
  APP.paymentInfo = { iban, iban_name: name };
  toast(t('wallet-iban-saved'), 'success');
  inflPage('wallet');
}

async function requestWithdrawal(amount) {
  const amt = parseFloat(amount);
  if (!amt || amt < 50) { toast(t('wallet-min-withdrawal'), 'error'); return; }
  const balance = Number(APP.wallet?.balance || 0);
  if (amt > balance) { toast(t('wallet-insufficient'), 'error'); return; }
  if (!APP.wallet?.id) { toast(t('wallet-not-ready'), 'error'); return; }
  if (!APP.paymentInfo?.iban) {
    toast(t('wallet-add-iban'), 'error');
    setInflWalletTab('overview');
    return;
  }
  const { error } = await _sb.from('wallet_transactions').insert({
    wallet_id: APP.wallet.id,
    type: 'withdrawal',
    amount: amt,
    description: `Withdrawal request — €${amt.toLocaleString()}`,
    status: 'pending',
    payout_method: 'manual',
    iban_snapshot: APP.paymentInfo.iban,
    iban_name_snapshot: APP.paymentInfo.iban_name || '',
  });
  if (error) { toast(t('wallet-withdrawal-fail'), 'error'); return; }
  await _sb.from('wallets').update({
    balance: balance - amt,
    pending: Number(APP.wallet.pending || 0) + amt,
  }).eq('id', APP.wallet.id);
  toast(t('wallet-withdrawal-success').replace('{amt}', amt.toLocaleString()), 'success');
  if (APP.user) await loadUserData(APP.user);
}
