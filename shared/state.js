// ── UI State ────────────────────────────────────────────────────────────────
const S = {
  role: null,            // 'business' | 'influencer'
  bizPage: 'dashboard',
  inflPage: 'dashboard',
  loginTab: 'biz',
  connectedSocials: [],
  chatPartner: null,
  inflAnalyticsTab: 'revenue',
  bizAnalyticsTab: 'performance',
  bizWalletTab: 'overview',
  inflWalletTab: 'overview',
  msgFilter: 'all',
  msgSearch: '',
  msgInfoOpen: false,
  charts: {},
  _brandFilter: null,
  _brandCampaigns: [],
  _brandProfileData: null,
  _brandProfileTab: 'active',
  _bpCollaborating: false,
  _campDetail: null,
  _bizCampFilter: 'active',
  // mobile state
  mobMsgView: 'list',
  mobSettingsOpen: null,
  mobCampTab: 'applications',
  mobBizPage: 'dashboard',
  mobInflPage: 'dashboard',
  mobProfileEdit: false,
  mobIBANOpen: false,
  mobAnalyticsPeriod: '30d',
  mobInflSettingsOpen: null,
  mobBrandTab: 'active',
};

// ── Sample / fallback data (replaced by real Supabase data on login) ─────────
let INFLUENCERS = [
  { id:1, name:'Jana Nováková',   handle:'@jananova',    niche:'Fashion',  followers:'124K',  er:'5.2%', avatar:'JN', verified:true,  platforms:['ig','tt'],      rating:4.9, campaigns:14, price:'€200–500'  },
  { id:2, name:'Tomáš Kováč',     handle:'@tomaskovac',  niche:'Tech',     followers:'89K',   er:'4.8%', avatar:'TK', verified:true,  platforms:['yt','ig'],      rating:4.7, campaigns:22, price:'€300–800'  },
  { id:3, name:'Mária Horáčková', handle:'@mariah',      niche:'Fitness',  followers:'210K',  er:'6.1%', avatar:'MH', verified:true,  platforms:['ig','tt','yt'], rating:4.8, campaigns:31, price:'€500–1200' },
  { id:4, name:'Peter Novák',     handle:'@peternovak',  niche:'Food',     followers:'67K',   er:'7.4%', avatar:'PN', verified:false, platforms:['ig'],           rating:4.5, campaigns:8,  price:'€100–300'  },
  { id:5, name:'Eva Blaho',       handle:'@evablaho',    niche:'Travel',   followers:'340K',  er:'3.9%', avatar:'EB', verified:true,  platforms:['ig','yt'],      rating:4.6, campaigns:18, price:'€800–2000' },
  { id:6, name:'Lukáš Šimko',     handle:'@lukassimko',  niche:'Gaming',   followers:'178K',  er:'8.2%', avatar:'LS', verified:true,  platforms:['yt','tt'],      rating:4.9, campaigns:27, price:'€400–900'  },
  { id:7, name:'Katarína Vlčková',handle:'@katavlckova', niche:'Beauty',   followers:'95K',   er:'5.8%', avatar:'KV', verified:true,  platforms:['ig','tt'],      rating:4.7, campaigns:19, price:'€250–600'  },
  { id:8, name:'Marek Oravec',    handle:'@marekoravec', niche:'Business', followers:'52K',   er:'4.1%', avatar:'MO', verified:false, platforms:['yt'],           rating:4.3, campaigns:5,  price:'€150–400'  },
];

let BIZ_CAMPAIGNS = [
  { id:1, name:'Summer Fashion Drop',    type:'Affiliate', status:'active',    budget:'€2,400', spent:'€1,100', apps:18, accepted:6,  reach:'124K',  conversions:312  },
  { id:2, name:'App Launch — TechFlow',  type:'Fixed',     status:'active',    budget:'€5,000', spent:'€3,800', apps:34, accepted:12, reach:'890K',  conversions:1240 },
  { id:3, name:'Healthy Snack Box Collab',type:'Barter',   status:'paused',    budget:'€800',   spent:'€640',   apps:9,  accepted:4,  reach:'67K',   conversions:89   },
  { id:4, name:'Winter Promo Hybrid',    type:'Hybrid',    status:'completed', budget:'€3,200', spent:'€3,200', apps:41, accepted:15, reach:'1.2M',  conversions:2100 },
  { id:5, name:'Brand Awareness Q1',     type:'Fixed',     status:'draft',     budget:'€1,500', spent:'€0',     apps:0,  accepted:0,  reach:'—',     conversions:0    },
];

let INFL_CAMPAIGNS = [
  { id:1, name:'Summer Fashion Drop',  brand:'Zara Slovakia', type:'Affiliate', status:'active', reward:'10% commission',   deadline:'2026-06-30', applied:false },
  { id:2, name:'FitTrack App Launch',  brand:'FitTrack',      type:'Fixed',     status:'active', reward:'€350',             deadline:'2026-05-31', applied:true  },
  { id:3, name:'Organic Coffee Collab',brand:'BeanBox',       type:'Barter',    status:'active', reward:'Product + €50',    deadline:'2026-06-15', applied:false },
  { id:4, name:'Gaming Chair Review',  brand:'SitPro',        type:'Fixed',     status:'active', reward:'€200 + chair',     deadline:'2026-06-01', applied:true  },
  { id:5, name:'Travel Gear Hybrid',   brand:'NomadGear',     type:'Hybrid',    status:'active', reward:'€150 + 5%',        deadline:'2026-07-15', applied:false },
  { id:6, name:'Beauty Box Partnership',brand:'GlowCo',       type:'Barter',    status:'active', reward:'Full product set', deadline:'2026-06-20', applied:false },
];

const MESSAGES_BIZ  = [];   // populated by loadConversations()
const MESSAGES_INFL = [];   // populated by loadConversations()

const CHAT_HISTORY = [
  { from:'them', text:'Hi! We saw your profile and love your content style 🎉' },
  { from:'me',   text:'Thank you! I\'m really interested in collaborating with your brand.' },
  { from:'them', text:'Great! We\'re running a summer campaign with an affiliate commission of 12%. Interested?' },
  { from:'me',   text:'That sounds amazing. What are the content requirements?' },
  { from:'them', text:'2 Instagram posts + 1 Reel. We\'ll send you the brief and product samples.' },
  { from:'me',   text:'Perfect. When is the campaign deadline?' },
  { from:'them', text:'June 30th. Does that work for you?' },
];

let BIZ_TRANSACTIONS = [
  { date:'2026-05-15', desc:'Campaign funded — App Launch',     amount:'-€500',   type:'debit'  },
  { date:'2026-05-12', desc:'Top-up via card',                  amount:'+€1,000', type:'credit' },
  { date:'2026-05-08', desc:'Campaign funded — Fashion Drop',   amount:'-€200',   type:'debit'  },
  { date:'2026-05-01', desc:'Influencer payout — Jana N.',      amount:'-€350',   type:'debit'  },
  { date:'2026-04-28', desc:'Top-up via bank transfer',         amount:'+€2,000', type:'credit' },
];

let INFL_TRANSACTIONS = [
  { date:'2026-05-14', desc:'Earnings — FitTrack App',   amount:'+€350', type:'credit' },
  { date:'2026-05-10', desc:'Earnings — Winter Promo',   amount:'+€420', type:'credit' },
  { date:'2026-05-05', desc:'Withdrawal to IBAN',        amount:'-€600', type:'debit'  },
  { date:'2026-04-28', desc:'Earnings — SitPro Gaming',  amount:'+€200', type:'credit' },
  { date:'2026-04-20', desc:'Affiliate — Fashion Drop',  amount:'+€89',  type:'credit' },
];
