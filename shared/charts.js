// ══════════════════ CHART INIT ════════════════════════════════════════════

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].slice(0,6);
const BLUE = '#2079FF', BLUE_LIGHT = 'rgba(32,121,255,.15)', NAVY = '#0D1B3E';

function mkBar(id, labels, datasets, opts={}) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  S.charts[id] = new Chart(ctx, { type:'bar', data:{labels, datasets}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:datasets.length>1,position:'top'}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.05)'}}},...opts} });
}

function mkLine(id, labels, datasets) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  S.charts[id] = new Chart(ctx, { type:'line', data:{labels, datasets}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:datasets.length>1,position:'top'}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.05)'}}}} });
}

function mkDoughnut(id, labels, data, colors) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  S.charts[id] = new Chart(ctx, { type:'doughnut', data:{labels, datasets:[{data, backgroundColor:colors, borderWidth:2, borderColor:'white'}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}} });
}

function initBizCharts() {
  const tab = S.bizAnalyticsTab;
  if (tab === 'performance') {
    const now = new Date();
    const months = [], reachData = [], convData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('en', {month:'short'}));
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const campsThisMonth = BIZ_CAMPAIGNS.filter(c => (c._raw?.created_at || '').startsWith(key));
      const reach = campsThisMonth.reduce((s, c) => {
        const r = String(c.reach || '');
        if (r === '—') return s;
        if (r.includes('M')) return s + parseFloat(r) * 1000;
        if (r.includes('K')) return s + parseFloat(r);
        return s + (parseFloat(r) || 0);
      }, 0);
      reachData.push(Math.round(reach));
      convData.push(campsThisMonth.reduce((s, c) => s + (Number(c.conversions) || 0), 0));
    }
    mkBar('biz-perf-chart', months,
      [{label:'Reach (K)', data:reachData, backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2},
       {label:'Conversions', data:convData, backgroundColor:'rgba(16,185,129,.2)', borderColor:'#10b981', borderWidth:2}]);
    const typeCount = {Affiliate:0, Fixed:0, Barter:0, Hybrid:0};
    BIZ_CAMPAIGNS.forEach(c => { if (typeCount[c.type] !== undefined) typeCount[c.type]++; });
    mkDoughnut('biz-mix-chart', ['Affiliate','Fixed','Barter','Hybrid'], Object.values(typeCount), ['#7c3aed','#2079FF','#f59e0b','#10b981']);
  }
  if (tab === 'campaigns') {
    const camps = BIZ_CAMPAIGNS.filter(c => c.status !== 'draft');
    mkBar('biz-camp-chart', camps.map(c => c.name.split(' ').slice(0,2).join(' ')),
      [{label:'Conversions', data:camps.map(c => c.conversions || 0), backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
  }
  if (tab === 'collaboration') {
    const infls = INFLUENCERS.slice(0, 8);
    const labels = infls.map(i => i.handle !== '—' ? i.handle.replace(/^@/, '') : i.name.split(' ')[0]);
    const data = infls.map(i => i.campaigns || 0);
    mkBar('biz-collab-chart', labels,
      [{label:'Campaigns', data, backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
  }
}

function initInflCharts() {
  const tab = S.inflAnalyticsTab;
  if (tab === 'revenue') {
    const now = new Date();
    const months = [], earningsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('en', {month:'short'}));
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      earningsData.push(INFL_TRANSACTIONS.filter(t => t.type === 'credit' && t.date?.startsWith(key))
        .reduce((s, t) => s + (parseFloat(String(t.amount).replace(/[^0-9.]/g,'')) || 0), 0));
    }
    mkBar('infl-rev-chart', months, [{label:'Earnings (€)', data:earningsData, backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
    const typeCount = {Fixed:0, Affiliate:0, Barter:0, Hybrid:0};
    INFL_CAMPAIGNS.filter(c => c.applied).forEach(c => { if (typeCount[c.type] !== undefined) typeCount[c.type]++; });
    mkDoughnut('infl-rev-type-chart', ['Fixed','Affiliate','Barter','Hybrid'], Object.values(typeCount), ['#2079FF','#7c3aed','#f59e0b','#10b981']);
  }
  if (tab === 'performance') {
    const pd = renderInflProfileData();
    const followers = parseFloat(String(pd.followers).replace(/[KMk]/g,'')) * (String(pd.followers).includes('M') ? 1000 : 1) || 0;
    const er = parseFloat(pd.er) || 0;
    mkLine('infl-perf-chart', MONTHS,
      [{label:'Reach (K)', data:Array(6).fill(Math.round(followers)), borderColor:BLUE, backgroundColor:BLUE_LIGHT, tension:.4, fill:true},
       {label:'ER (%)', data:Array(6).fill(er), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.1)', tension:.4, fill:true}]);
  }
  if (tab === 'campaigns') {
    const applied = INFL_CAMPAIGNS.filter(c => c.applied);
    mkBar('infl-camp-chart', applied.map(c => c.brand),
      [{label:'Reward', data:applied.map(c => parseFloat(String(c.reward).replace(/[^0-9.]/g,'')) || 0), backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
  }
  if (tab === 'collaboration') {
    const brands = APP.brands.slice(0, 6);
    mkBar('infl-collab-chart', brands.map(b => b.name.split(' ')[0]),
      [{label:'Campaigns', data:brands.map(b => b.campaigns || 0), backgroundColor:BLUE_LIGHT, borderColor:BLUE, borderWidth:2}]);
  }
}

function initBizWalletCharts() {
  const now = new Date();
  const months = [], spend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en', {month:'short'}));
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    spend.push(BIZ_TRANSACTIONS.filter(t=>t.type==='debit'&&t.date?.startsWith(key))
      .reduce((s,t)=>s+(parseFloat(String(t.amount).replace(/[^0-9.]/g,''))||0), 0));
  }
  const hasData = spend.some(e=>e>0);
  mkBar('biz-spend-chart', hasData?months:MONTHS, [{label:'Spend (€)',data:hasData?spend:[800,1200,650,1800,2100,1900],backgroundColor:BLUE_LIGHT,borderColor:BLUE,borderWidth:2}]);
  mkDoughnut('biz-spend-type-chart', ['Affiliate','Fixed','Barter','Hybrid'], [30,40,15,15], ['#7c3aed','#2079FF','#f59e0b','#10b981']);
}

function initInflWalletCharts() {
  const now = new Date();
  const months = [], earnings = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en', {month:'short'}));
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    earnings.push(INFL_TRANSACTIONS.filter(t=>t.type==='credit'&&t.date?.startsWith(key))
      .reduce((s,t)=>s+(parseFloat(String(t.amount).replace(/[^0-9.]/g,''))||0), 0));
  }
  const hasData = earnings.some(e=>e>0);
  mkBar('infl-wallet-chart', hasData?months:MONTHS, [{label:'Earnings (€)',data:hasData?earnings:[120,85,200,150,350,280],backgroundColor:BLUE_LIGHT,borderColor:BLUE,borderWidth:2}]);
}
