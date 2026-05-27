// ══════════════════ WALLET ════════════════════════════════════════════════

async function topUpBizWallet() {
  const amountInput = document.getElementById('topup-amount');
  const amount = parseFloat(amountInput?.value);
  if (!amount || amount < 10) { toast('Minimum top-up is €10', 'error'); return; }
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { toast('Please log in again', 'error'); return; }
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
      toast(data.error || 'Payment failed. Check Stripe configuration.', 'error');
      if (btn) { btn.textContent = t('btn-pay-card'); btn.disabled = false; }
      return;
    }
    window.location.href = data.url;
  } catch (err) {
    toast('Network error. Try again.', 'error');
    if (btn) { btn.textContent = t('btn-pay-card'); btn.disabled = false; }
  }
}

async function saveInflIban() {
  const iban = document.getElementById('iban-input')?.value?.trim().replace(/\s/g, '').toUpperCase();
  const name = document.getElementById('iban-name-input')?.value?.trim();
  if (!iban || iban.length < 15) { toast('Enter a valid IBAN', 'error'); return; }
  if (!name) { toast('Enter account holder name', 'error'); return; }
  if (!APP.profileId) { toast('Profile not loaded', 'error'); return; }
  const { error } = await _sb.from('influencer_payment_info').upsert(
    { influencer_id: APP.profileId, iban, iban_name: name },
    { onConflict: 'influencer_id' }
  );
  if (error) { toast('Failed to save IBAN', 'error'); return; }
  APP.paymentInfo = { iban, iban_name: name };
  toast('IBAN saved successfully', 'success');
  inflPage('wallet');
}

async function requestWithdrawal(amount) {
  const amt = parseFloat(amount);
  if (!amt || amt < 50) { toast('Minimum withdrawal is €50', 'error'); return; }
  const balance = Number(APP.wallet?.balance || 0);
  if (amt > balance) { toast('Insufficient balance', 'error'); return; }
  if (!APP.wallet?.id) { toast('Wallet not ready. Please try again.', 'error'); return; }
  if (!APP.paymentInfo?.iban) {
    toast('Please add your IBAN first in the Payout Methods section.', 'error');
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
  if (error) { toast('Withdrawal failed. Please try again.', 'error'); return; }
  await _sb.from('wallets').update({
    balance: balance - amt,
    pending: Number(APP.wallet.pending || 0) + amt,
  }).eq('id', APP.wallet.id);
  toast(`€${amt.toLocaleString()} withdrawal requested (2–3 business days)`, 'success');
  if (APP.user) await loadUserData(APP.user);
}
