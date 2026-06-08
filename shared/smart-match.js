// ══════════════════ SMART MATCH ══════════════════════════════════════════

function calcMatch(infl) {
  let score = 60;
  const activecamp = BIZ_CAMPAIGNS.find(c => c.status === 'active');
  if (!activecamp) return score;
  const campName = activecamp.name.toLowerCase();
  if (campName.includes('fashion') && infl.niche === 'Fashion') score += 20;
  if (campName.includes('tech') && infl.niche === 'Tech') score += 20;
  if (campName.includes('fit') && infl.niche === 'Fitness') score += 20;
  if ((campName.includes('snack') || campName.includes('coffee')) && infl.niche === 'Food') score += 20;
  const er = parseFloat(infl.er);
  if (er >= 6) score += 12;
  else if (er >= 4) score += 6;
  if (infl.verified) score += 5;
  if (infl.campaigns >= 20) score += 8;
  else if (infl.campaigns >= 10) score += 4;
  if (infl.rating >= 4.8) score += 5;
  return Math.min(score, 99);
}

function matchColor(score) {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#f59e0b';
  return '#94a3b8';
}
