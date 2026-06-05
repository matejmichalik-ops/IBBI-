// ══════════════════ RATING SYSTEM ═════════════════════════════════════════

function showRatingModal(targetId, targetName, campId, campName, targetRole) {
  let existing = document.getElementById('rating-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'rating-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,62,.5);z-index:9500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';
  overlay.innerHTML = `
    <div style="background:white;border-radius:20px;padding:36px;max-width:460px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.25);animation:slideUpModal .3s ease">
      <h3 style="color:var(--navy);margin:0 0 6px">${t('rating-title')}</h3>
      <p style="color:var(--text-mid);font-size:.9rem;margin:0 0 24px">Campaign: <strong>${campName}</strong> · ${targetName}</p>
      <div style="display:flex;justify-content:center;gap:8px;margin-bottom:20px" id="star-picker">
        ${[1,2,3,4,5].map(n=>`<button onclick="selectStar(${n})" id="star-btn-${n}" style="background:none;border:none;cursor:pointer;font-size:2rem;transition:.15s;opacity:.3" data-star="${n}">★</button>`).join('')}
      </div>
      <div id="star-val" style="text-align:center;font-size:.88rem;color:var(--text-mid);margin-bottom:16px">${t('rating-click-star')}</div>
      <textarea id="rating-review" rows="3" placeholder="Add a short review (optional)…" style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box;resize:vertical;margin-bottom:16px"></textarea>
      <div style="display:flex;gap:12px">
        <button class="btn btn-primary" style="flex:1" onclick="submitRating('${targetId}','${campId}','${targetRole}')">${t('rating-submit-btn')}</button>
        <button class="btn btn-secondary" onclick="document.getElementById('rating-modal-overlay').remove()">${t('prof-cancel')}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

let _selectedStar = 0;

function selectStar(n) {
  _selectedStar = n;
  const labels = ['','Poor','Below average','Average','Good','Excellent'];
  document.getElementById('star-val').textContent = labels[n] + ` (${n}/5)`;
  [1,2,3,4,5].forEach(i => {
    const btn = document.getElementById(`star-btn-${i}`);
    btn.style.opacity = i <= n ? '1' : '.25';
    btn.style.color = i <= n ? '#f59e0b' : '#94a3b8';
  });
}

async function submitRating(targetUserId, campId, targetRole) {
  if (!_selectedStar) { toast('Please select a star rating', 'warning'); return; }
  const comment = document.getElementById('rating-review')?.value.trim() || null;
  if (APP.user) {
    const { error } = await _sb.from('reviews').insert({
      campaign_id: campId || null,
      reviewer_id: APP.user.id,
      reviewed_id: targetUserId,
      stars: _selectedStar,
      comment,
    });
    if (error) { toast(error.message, 'error'); return; }
    const profileTable = targetRole === 'influencer' ? 'influencer_profiles' : 'business_profiles';
    const { data: allRatings } = await _sb.from('reviews').select('stars').eq('reviewed_id', targetUserId);
    if (allRatings?.length) {
      const avg = allRatings.reduce((s,r) => s + r.stars, 0) / allRatings.length;
      const rounded = Math.round(avg * 10) / 10;
      await _sb.from(profileTable).update({ rating: rounded, avg_rating: rounded }).eq('user_id', targetUserId);
    }
  }
  _selectedStar = 0;
  document.getElementById('rating-modal-overlay')?.remove();
  toast('Rating submitted! Thank you for your feedback.', 'success');
}
