// ══════════════════ CHANGE PASSWORD ═══════════════════════════════════════

function showChangePassword() {
  const existing = document.getElementById('change-pass-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'change-pass-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:white;border-radius:18px;padding:32px;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,.2)">
      <h3 style="color:var(--navy);margin:0 0 6px">${t('set-change-pwd')}</h3>
      <p style="font-size:.88rem;color:var(--text-mid);margin-bottom:20px">${t('cp-subtitle')}</p>
      <input id="cp-new" type="password" placeholder="New password (min. 8 chars)" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;margin-bottom:10px;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <input id="cp-confirm" type="password" placeholder="Confirm new password" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;margin-bottom:6px;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <div id="cp-err" style="display:none;color:#ef4444;font-size:.82rem;margin-bottom:10px"></div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button onclick="document.getElementById('change-pass-overlay').remove()" style="flex:1;padding:11px;border:1.5px solid var(--border);background:white;border-radius:10px;font-weight:600;cursor:pointer;font-size:.9rem">${t('prof-cancel')}</button>
        <button onclick="doChangePassword()" class="btn btn-primary" style="flex:1;padding:11px;font-size:.9rem" id="cp-btn">${t('cp-update-btn')}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('cp-new').focus();
}

async function doChangePassword() {
  const np = document.getElementById('cp-new').value;
  const cp = document.getElementById('cp-confirm').value;
  const err = document.getElementById('cp-err');
  const btn = document.getElementById('cp-btn');
  err.style.display = 'none';
  if (np.length < 8) { err.textContent = t('err-pwd-length'); err.style.display = 'block'; return; }
  if (np !== cp) { err.textContent = t('err-pwds-no-match'); err.style.display = 'block'; return; }
  btn.textContent = t('btn-updating'); btn.disabled = true;
  const { error } = await _sb.auth.updateUser({ password: np });
  btn.textContent = t('cp-update-btn'); btn.disabled = false;
  if (error) { err.textContent = error.message; err.style.display = 'block'; return; }
  document.getElementById('change-pass-overlay').remove();
  toast(t('auth2fa-password-updated'), 'success');
}

// ══════════════════ 2FA TOTP ═══════════════════════════════════════════════

let _2faFactorId = null;

async function show2FASetup() {
  const existing = document.getElementById('twofa-overlay');
  if (existing) existing.remove();

  const { data: aalData } = await _sb.auth.mfa.listFactors();
  const enrolled = aalData?.totp?.find(f => f.status === 'verified');
  if (enrolled) { show2FAManage(enrolled); return; }

  const overlay = document.createElement('div');
  overlay.id = 'twofa-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:white;border-radius:18px;padding:32px;width:100%;max-width:440px;box-shadow:0 24px 64px rgba(0,0,0,.2)">
      <h3 style="color:var(--navy);margin:0 0 6px">${t('set-enable-2fa')}</h3>
      <p style="font-size:.88rem;color:var(--text-mid);margin-bottom:20px">${t('twofa-subtitle')}</p>
      <div id="twofa-qr" style="text-align:center;padding:16px 0"><div style="color:var(--text-mid);font-size:.88rem">${t('set-loading')}</div></div>
      <div id="twofa-secret" style="font-family:monospace;font-size:.78rem;color:var(--text-mid);text-align:center;margin-bottom:16px;word-break:break-all"></div>
      <input id="twofa-code" type="text" inputmode="numeric" placeholder="Enter 6-digit code" maxlength="6" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:1.1rem;outline:none;text-align:center;letter-spacing:.2em;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <div id="twofa-err" style="display:none;color:#ef4444;font-size:.82rem;margin-top:6px;text-align:center"></div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button onclick="document.getElementById('twofa-overlay').remove()" style="flex:1;padding:11px;border:1.5px solid var(--border);background:white;border-radius:10px;font-weight:600;cursor:pointer;font-size:.9rem">${t('prof-cancel')}</button>
        <button onclick="verify2FA()" class="btn btn-primary" style="flex:1;padding:11px;font-size:.9rem" id="twofa-btn">${t('twofa-verify-btn')}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  const { data, error } = await _sb.auth.mfa.enroll({ factorType: 'totp', issuer: 'IBBI', friendlyName: 'IBBI Authenticator' });
  if (error || !data) { toast(t('auth2fa-setup-failed') + (error?.message || 'Unknown error'), 'error'); overlay.remove(); return; }
  _2faFactorId = data.id;
  const qrEl = document.getElementById('twofa-qr');
  const secEl = document.getElementById('twofa-secret');
  if (qrEl) qrEl.innerHTML = `<img src="${data.totp.qr_code}" style="width:180px;height:180px;border-radius:12px;border:1px solid var(--border)">`;
  if (secEl) secEl.textContent = t('twofa-manual-code') + data.totp.secret;
  document.getElementById('twofa-code').focus();
}

async function verify2FA() {
  const code = document.getElementById('twofa-code').value.trim();
  const err = document.getElementById('twofa-err');
  const btn = document.getElementById('twofa-btn');
  err.style.display = 'none';
  if (code.length !== 6 || !/^\d+$/.test(code)) { err.textContent = t('err-6digit-code'); err.style.display = 'block'; return; }
  btn.textContent = t('btn-verifying'); btn.disabled = true;
  const { data: challengeData, error: challengeErr } = await _sb.auth.mfa.challenge({ factorId: _2faFactorId });
  if (challengeErr) { err.textContent = challengeErr.message; err.style.display = 'block'; btn.textContent = t('twofa-verify-btn'); btn.disabled = false; return; }
  const { error: verifyErr } = await _sb.auth.mfa.verify({ factorId: _2faFactorId, challengeId: challengeData.id, code });
  btn.textContent = t('twofa-verify-btn'); btn.disabled = false;
  if (verifyErr) { err.textContent = t('twofa-invalid-code'); err.style.display = 'block'; return; }
  document.getElementById('twofa-overlay').remove();
  toast(t('auth2fa-enabled'), 'success');
  document.querySelectorAll('#btn-2fa').forEach(b => { b.textContent = t('twofa-manage-btn'); });
}

function show2FAManage(factor) {
  const overlay = document.createElement('div');
  overlay.id = 'twofa-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:white;border-radius:18px;padding:32px;width:100%;max-width:400px;box-shadow:0 24px 64px rgba(0,0,0,.2)">
      <h3 style="color:var(--navy);margin:0 0 8px">${t('set-enable-2fa')}</h3>
      <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f0fdf4;border-radius:10px;border:1px solid #86efac;margin-bottom:20px">
        <span style="font-size:1.2rem">✅</span>
        <span style="font-size:.9rem;color:#166534;font-weight:600">2FA is active on your account</span>
      </div>
      <p style="font-size:.88rem;color:var(--text-mid);margin-bottom:20px">To disable 2FA, enter the current code from your authenticator app.</p>
      <input id="twofa-disable-code" type="text" inputmode="numeric" placeholder="6-digit code" maxlength="6" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:1.1rem;outline:none;text-align:center;letter-spacing:.2em;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
      <div id="twofa-dis-err" style="display:none;color:#ef4444;font-size:.82rem;margin-top:6px;text-align:center"></div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button onclick="document.getElementById('twofa-overlay').remove()" style="flex:1;padding:11px;border:1.5px solid var(--border);background:white;border-radius:10px;font-weight:600;cursor:pointer;font-size:.9rem">${t('btn-close')}</button>
        <button onclick="disable2FA('${factor.id}')" style="flex:1;padding:11px;border:none;background:#ef4444;color:white;border-radius:10px;font-weight:700;cursor:pointer;font-size:.9rem" id="twofa-dis-btn">Disable 2FA</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

async function disable2FA(factorId) {
  const code = document.getElementById('twofa-disable-code').value.trim();
  const err = document.getElementById('twofa-dis-err');
  const btn = document.getElementById('twofa-dis-btn');
  err.style.display = 'none';
  if (code.length !== 6) { err.textContent = t('err-6digit-code'); err.style.display = 'block'; return; }
  btn.textContent = t('btn-disabling'); btn.disabled = true;
  const { data: ch, error: chErr } = await _sb.auth.mfa.challenge({ factorId });
  if (chErr) { err.textContent = chErr.message; err.style.display = 'block'; btn.textContent = t('twofa-disable-btn'); btn.disabled = false; return; }
  const { error: vErr } = await _sb.auth.mfa.verify({ factorId, challengeId: ch.id, code });
  if (vErr) { err.textContent = t('twofa-invalid-code'); err.style.display = 'block'; btn.textContent = t('twofa-disable-btn'); btn.disabled = false; return; }
  const { error: uErr } = await _sb.auth.mfa.unenroll({ factorId });
  btn.textContent = t('twofa-disable-btn'); btn.disabled = false;
  if (uErr) { err.textContent = uErr.message; err.style.display = 'block'; return; }
  document.getElementById('twofa-overlay').remove();
  toast(t('auth2fa-disabled'), 'info');
  document.querySelectorAll('#btn-2fa').forEach(b => { b.textContent = t('set-enable-2fa'); });
}
