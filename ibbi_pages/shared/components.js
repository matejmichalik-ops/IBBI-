// ══════════════════ SHARED UI COMPONENTS ══════════════════════════════════

function statCard(label, val, sub, dir, icon) {
  return `<div class="stat-card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div class="stat-label">${label}</div>
      <div style="width:40px;height:40px;border-radius:11px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" style="color:var(--blue)"><use href="#ico-${icon}"/></svg>
      </div>
    </div>
    <div class="stat-val">${val}</div>
    <div class="stat-delta ${dir==='up'?'delta-up':dir==='dn'?'delta-dn':''}" style="margin-top:6px;font-size:.82rem">${sub}</div>
  </div>`;
}

function starSvg(size=13, color='#f59e0b') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="color:${color};vertical-align:middle;margin-left:1px;flex-shrink:0"><use href="#ico-star"/></svg>`;
}

function starRating(n, size=12) {
  return Array(Math.min(n,5)).fill(0).map(()=>starSvg(size)).join('');
}

function miniStat(label, val) {
  return `<div style="background:var(--blue-soft);border-radius:10px;padding:12px;text-align:center">
    <div style="font-weight:800;color:var(--navy);font-size:1.1rem">${val}</div>
    <div style="font-size:.75rem;color:var(--text-mid);margin-top:2px">${label}</div>
  </div>`;
}

function typeBadge(type) {
  const norm = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : type;
  const colorMap = { Affiliate:'badge-purple', Fixed:'badge-blue', Barter:'badge-yellow', Hybrid:'badge-green' };
  const keyMap   = { Affiliate:'type-affiliate', Fixed:'type-fixed', Barter:'type-barter', Hybrid:'type-hybrid' };
  return `<span class="badge ${colorMap[norm]||'badge-gray'}">${t(keyMap[norm]) || norm || type}</span>`;
}

function statusBadge(s) {
  const map = { active:'badge-green', paused:'badge-yellow', completed:'badge-gray', draft:'badge-blue' };
  return `<span class="badge ${map[s]||'badge-gray'}">${t('status-'+s) || s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
}

const NICHES = ['Fashion','Beauty','Fitness','Food','Travel',
  'Tech','Gaming','Lifestyle','Business','Health','Other'];
const GEO_DATA = {
  SK: {
    name: 'Slovensko', flag: '🇸🇰',
    regions: {
      'BA': { name: 'Bratislavský kraj', cities: ['Bratislava','Senec','Pezinok','Malacky','Stupava'] },
      'TT': { name: 'Trnavský kraj', cities: ['Trnava','Galanta','Hlohovec','Piešťany','Senica','Skalica'] },
      'TN': { name: 'Trenčiansky kraj', cities: ['Trenčín','Považská Bystrica','Nové Mesto nad Váhom','Prievidza','Púchov'] },
      'NR': { name: 'Nitriansky kraj', cities: ['Nitra','Komárno','Levice','Nové Zámky','Šaľa','Zlaté Moravce'] },
      'ZA': { name: 'Žilinský kraj', cities: ['Žilina','Čadca','Dolný Kubín','Liptovský Mikuláš','Martin','Ružomberok','Turčianske Teplice'] },
      'BB': { name: 'Banskobystrický kraj', cities: ['Banská Bystrica','Brezno','Detva','Revúca','Rimavská Sobota','Veľký Krtíš','Zvolen','Žiar nad Hronom'] },
      'PO': { name: 'Prešovský kraj', cities: ['Prešov','Bardejov','Humenné','Kežmarok','Levoča','Poprad','Sabinov','Stará Ľubovňa','Stropkov','Vranov nad Topľou'] },
      'KE': { name: 'Košický kraj', cities: ['Košice','Gelnica','Michalovce','Rožňava','Sobrance','Spišská Nová Ves','Trebišov'] },
    }
  },
  CZ: {
    name: 'Česká republika', flag: '🇨🇿',
    regions: {
      'PRG': { name: 'Praha', cities: ['Praha'] },
      'JHC': { name: 'Jihočeský kraj', cities: ['České Budějovice','Písek','Strakonice','Tábor'] },
      'JHM': { name: 'Jihomoravský kraj', cities: ['Brno','Břeclav','Hodonín','Znojmo'] },
      'KVK': { name: 'Karlovarský kraj', cities: ['Karlovy Vary','Cheb','Sokolov'] },
      'HKK': { name: 'Královéhradecký kraj', cities: ['Hradec Králové','Jičín','Náchod','Trutnov'] },
      'LBK': { name: 'Liberecký kraj', cities: ['Liberec','Jablonec nad Nisou','Česká Lípa'] },
      'MSK': { name: 'Moravskoslezský kraj', cities: ['Ostrava','Frýdek-Místek','Karviná','Opava'] },
      'OLK': { name: 'Olomoucký kraj', cities: ['Olomouc','Přerov','Šumperk'] },
      'PAK': { name: 'Pardubický kraj', cities: ['Pardubice','Chrudim','Svitavy'] },
      'PLK': { name: 'Plzeňský kraj', cities: ['Plzeň','Domažlice','Klatovy'] },
      'STC': { name: 'Středočeský kraj', cities: ['Kladno','Mladá Boleslav','Příbram','Kolín','Mělník'] },
      'ULK': { name: 'Ústecký kraj', cities: ['Ústí nad Labem','Most','Chomutov','Teplice','Děčín'] },
      'VYS': { name: 'Kraj Vysočina', cities: ['Jihlava','Havlíčkův Brod','Třebíč','Žďár nad Sázavou'] },
      'ZLK': { name: 'Zlínský kraj', cities: ['Zlín','Kroměříž','Uherské Hradiště','Vsetín'] },
    }
  },
  HU: {
    name: 'Maďarsko', flag: '🇭🇺',
    regions: {
      'BP':  { name: 'Budapest', cities: ['Budapest'] },
      'PE':  { name: 'Pest megye', cities: ['Érd','Vác','Gödöllő'] },
      'GY':  { name: 'Győr-Moson-Sopron', cities: ['Győr','Sopron','Mosonmagyaróvár'] },
      'KO':  { name: 'Komárom-Esztergom', cities: ['Tatabánya','Esztergom','Komárom'] },
      'NO':  { name: 'Nógrád megye', cities: ['Salgótarján'] },
      'HE':  { name: 'Heves megye', cities: ['Eger','Gyöngyös'] },
      'BO':  { name: 'Borsod-Abaúj-Zemplén', cities: ['Miskolc','Ózd','Kazincbarcika'] },
      'SZ':  { name: 'Szabolcs-Szatmár-Bereg', cities: ['Nyíregyháza','Kisvárda'] },
      'HA':  { name: 'Hajdú-Bihar', cities: ['Debrecen','Hajdúböszörmény'] },
      'JN':  { name: 'Jász-Nagykun-Szolnok', cities: ['Szolnok','Jászberény'] },
      'BE':  { name: 'Békés megye', cities: ['Békéscsaba','Gyula'] },
      'CS':  { name: 'Csongrád-Csanád', cities: ['Szeged','Hódmezővásárhely'] },
      'BA':  { name: 'Baranya megye', cities: ['Pécs','Mohács'] },
      'TO':  { name: 'Tolna megye', cities: ['Szekszárd','Dombóvár'] },
      'SO':  { name: 'Somogy megye', cities: ['Kaposvár','Marcali'] },
      'ZA':  { name: 'Zala megye', cities: ['Zalaegerszeg','Keszthely'] },
      'VA':  { name: 'Vas megye', cities: ['Szombathely','Körmend'] },
      'VE':  { name: 'Veszprém megye', cities: ['Veszprém','Ajka','Pápa'] },
      'FE':  { name: 'Fejér megye', cities: ['Székesfehérvár','Dunaújváros'] },
    }
  },
  PL: {
    name: 'Poľsko', flag: '🇵🇱',
    regions: {
      'DS': { name: 'Dolnośląskie', cities: ['Wrocław','Legnica','Wałbrzych'] },
      'KP': { name: 'Kujawsko-Pomorskie', cities: ['Bydgoszcz','Toruń'] },
      'LU': { name: 'Lubelskie', cities: ['Lublin','Zamość'] },
      'LB': { name: 'Lubuskie', cities: ['Zielona Góra','Gorzów Wielkopolski'] },
      'LD': { name: 'Łódzkie', cities: ['Łódź','Piotrków Trybunalski'] },
      'MA': { name: 'Małopolskie', cities: ['Kraków','Tarnów','Nowy Sącz'] },
      'MZ': { name: 'Mazowieckie', cities: ['Warszawa','Radom','Płock'] },
      'OP': { name: 'Opolskie', cities: ['Opole','Kędzierzyn-Koźle'] },
      'PK': { name: 'Podkarpackie', cities: ['Rzeszów','Przemyśl','Krosno'] },
      'PD': { name: 'Podlaskie', cities: ['Białystok','Suwałki','Łomża'] },
      'PM': { name: 'Pomorskie', cities: ['Gdańsk','Gdynia','Sopot','Słupsk'] },
      'SL': { name: 'Śląskie', cities: ['Katowice','Częstochowa','Sosnowiec','Gliwice','Zabrze','Bytom'] },
      'SK': { name: 'Świętokrzyskie', cities: ['Kielce','Ostrowiec Świętokrzyski'] },
      'WN': { name: 'Warmińsko-Mazurskie', cities: ['Olsztyn','Ełk'] },
      'WP': { name: 'Wielkopolskie', cities: ['Poznań','Kalisz','Konin','Leszno'] },
      'ZP': { name: 'Zachodniopomorskie', cities: ['Szczecin','Koszalin'] },
    }
  },
  AT: {
    name: 'Rakúsko', flag: '🇦🇹',
    regions: {
      'W':  { name: 'Wien', cities: ['Wien'] },
      'NO': { name: 'Niederösterreich', cities: ['St. Pölten','Wiener Neustadt','Klosterneuburg'] },
      'OO': { name: 'Oberösterreich', cities: ['Linz','Wels','Steyr'] },
      'S':  { name: 'Salzburg', cities: ['Salzburg','Hallein'] },
      'ST': { name: 'Steiermark', cities: ['Graz','Leoben','Klagenfurt'] },
      'K':  { name: 'Kärnten', cities: ['Klagenfurt','Villach'] },
      'T':  { name: 'Tirol', cities: ['Innsbruck','Kufstein'] },
      'V':  { name: 'Vorarlberg', cities: ['Bregenz','Dornbirn'] },
      'B':  { name: 'Burgenland', cities: ['Eisenstadt','Oberwart'] },
    }
  },
  DE: {
    name: 'Nemecko', flag: '🇩🇪',
    regions: {
      'BB': { name: 'Brandenburg', cities: ['Potsdam','Cottbus'] },
      'BE': { name: 'Berlin', cities: ['Berlin'] },
      'BW': { name: 'Baden-Württemberg', cities: ['Stuttgart','Karlsruhe','Freiburg','Heidelberg'] },
      'BY': { name: 'Bayern', cities: ['München','Nürnberg','Augsburg','Würzburg'] },
      'HB': { name: 'Bremen', cities: ['Bremen'] },
      'HE': { name: 'Hessen', cities: ['Frankfurt','Wiesbaden','Kassel','Darmstadt'] },
      'HH': { name: 'Hamburg', cities: ['Hamburg'] },
      'MV': { name: 'Mecklenburg-Vorpommern', cities: ['Rostock','Schwerin'] },
      'NI': { name: 'Niedersachsen', cities: ['Hannover','Braunschweig','Osnabrück'] },
      'NW': { name: 'Nordrhein-Westfalen', cities: ['Köln','Düsseldorf','Dortmund','Essen','Duisburg'] },
      'RP': { name: 'Rheinland-Pfalz', cities: ['Mainz','Ludwigshafen','Koblenz','Trier'] },
      'SH': { name: 'Schleswig-Holstein', cities: ['Kiel','Lübeck','Flensburg'] },
      'SL': { name: 'Saarland', cities: ['Saarbrücken'] },
      'SN': { name: 'Sachsen', cities: ['Dresden','Leipzig','Chemnitz'] },
      'ST': { name: 'Sachsen-Anhalt', cities: ['Magdeburg','Halle (Saale)'] },
      'TH': { name: 'Thüringen', cities: ['Erfurt','Jena','Gera'] },
    }
  },
  OTHER: {
    name: 'Iná krajina', flag: '🌍',
    regions: {}
  }
};
const COUNTRIES = Object.entries(GEO_DATA).map(([code, data]) => ({ code, name: data.name, flag: data.flag }));
const PHONE_PREFIXES = [
  { code:'SK', prefix:'+421', flag:'🇸🇰', name:'SK' },
  { code:'CZ', prefix:'+420', flag:'🇨🇿', name:'CZ' },
  { code:'HU', prefix:'+36',  flag:'🇭🇺', name:'HU' },
  { code:'PL', prefix:'+48',  flag:'🇵🇱', name:'PL' },
  { code:'AT', prefix:'+43',  flag:'🇦🇹', name:'AT' },
  { code:'DE', prefix:'+49',  flag:'🇩🇪', name:'DE' },
  { code:'GB', prefix:'+44',  flag:'🇬🇧', name:'GB' },
  { code:'US', prefix:'+1',   flag:'🇺🇸', name:'US' },
  { code:'FR', prefix:'+33',  flag:'🇫🇷', name:'FR' },
  { code:'IT', prefix:'+39',  flag:'🇮🇹', name:'IT' },
  { code:'ES', prefix:'+34',  flag:'🇪🇸', name:'ES' },
  { code:'NL', prefix:'+31',  flag:'🇳🇱', name:'NL' },
  { code:'UA', prefix:'+380', flag:'🇺🇦', name:'UA' },
  { code:'RO', prefix:'+40',  flag:'🇷🇴', name:'RO' },
  { code:'HR', prefix:'+385', flag:'🇭🇷', name:'HR' },
];
const INDUSTRIES = ['Fashion','Beauty','Tech','Food','Gaming',
  'Travel','Fitness','Finance','Health','E-commerce','Education','Other'];

function settingSelect(label, val, id, options) {
  return `<div>
    <label style="font-size:.85rem;font-weight:600;
      color:var(--navy);display:block;margin-bottom:6px">
      ${label}
    </label>
    <select ${id ? `id="${id}"` : ''}
      style="width:100%;padding:11px 14px;
        border:1.5px solid var(--border);
        border-radius:10px;font-size:.9rem;
        outline:none;box-sizing:border-box;
        background:#fff;appearance:none;cursor:pointer"
      onfocus="this.style.borderColor='var(--blue)'"
      onblur="this.style.borderColor='var(--border)'">
      <option value="">${t('sel-choose') || 'Vyber...'}</option>
      ${options.map(o =>
        `<option value="${o}" ${val===o ? 'selected' : ''}>${o}</option>`
      ).join('')}
    </select>
  </div>`;
}

function settingField(label, val, id='') {
  return `<div>
    <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-bottom:6px">${label}</label>
    <input ${id ? `id="${id}"` : ''} type="text" value="${val}" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
  </div>`;
}

function settingCountry(label, val, id, regionVal, regionId, cityVal, cityId) {
  const regions = val && GEO_DATA[val] ? GEO_DATA[val].regions : {};
  const hasRegions = Object.keys(regions).length > 0;
  const cities = regionVal && regions[regionVal] ? regions[regionVal].cities : [];
  const hasCities = cities.length > 0;
  return `<div>
    <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-bottom:6px">
      ${label}<span style="color:var(--red,#EF4444)"> *</span>
    </label>
    <div style="position:relative;margin-bottom:10px">
      <select id="${id}"
        onchange="_onCountryChange('${id}','${regionId}','${cityId}')"
        style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;background:#fff;appearance:none;cursor:pointer;box-sizing:border-box"
        onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
        <option value="">${t('sel-choose')||'Vyber krajinu...'}</option>
        ${Object.entries(GEO_DATA).map(([code,data]) =>
          `<option value="${code}" ${val===code?'selected':''}>${data.flag} ${data.name}</option>`
        ).join('')}
      </select>
      <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-mid)">▾</span>
    </div>
    <div id="${regionId}-wrap" style="display:${hasRegions?'block':'none'};margin-bottom:10px">
      <label style="font-size:.82rem;font-weight:600;color:var(--text-mid);display:block;margin-bottom:6px">
        ${t('fld-region')||'Kraj / región'}
        <span style="font-weight:400;color:var(--text-light,#8EAFD4)">(${t('optional')||'voliteľné'})</span>
      </label>
      <div style="position:relative">
        <select id="${regionId}"
          onchange="_onRegionChange('${id}','${regionId}','${cityId}')"
          style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;background:#fff;appearance:none;cursor:pointer;box-sizing:border-box"
          onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
          <option value="">${t('sel-choose-region')||'Vyber kraj...'}</option>
          ${Object.entries(regions).map(([code,reg]) =>
            `<option value="${code}" ${regionVal===code?'selected':''}>${reg.name}</option>`
          ).join('')}
        </select>
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-mid)">▾</span>
      </div>
    </div>
    <div id="${cityId}-wrap" style="display:${hasCities?'block':'none'}">
      <label style="font-size:.82rem;font-weight:600;color:var(--text-mid);display:block;margin-bottom:6px">
        ${t('fld-city')||'Mesto'}
        <span style="font-weight:400;color:var(--text-light,#8EAFD4)">(${t('optional')||'voliteľné'})</span>
      </label>
      <div style="position:relative">
        <select id="${cityId}"
          style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;background:#fff;appearance:none;cursor:pointer;box-sizing:border-box"
          onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
          <option value="">${t('sel-choose-city')||'Vyber mesto...'}</option>
          ${cities.map(city => `<option value="${city}" ${cityVal===city?'selected':''}>${city}</option>`).join('')}
        </select>
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-mid)">▾</span>
      </div>
    </div>
  </div>`;
}

function _onCountryChange(countryId, regionId, cityId) {
  const country = document.getElementById(countryId)?.value;
  const regions = country && GEO_DATA[country] ? GEO_DATA[country].regions : {};
  const hasRegions = Object.keys(regions).length > 0;
  const regionWrap = document.getElementById(regionId + '-wrap');
  const regionSel = document.getElementById(regionId);
  if (regionWrap) regionWrap.style.display = hasRegions ? 'block' : 'none';
  if (regionSel) {
    regionSel.innerHTML = `<option value="">${t('sel-choose-region')||'Vyber kraj...'}</option>`
      + Object.entries(regions).map(([code,reg]) => `<option value="${code}">${reg.name}</option>`).join('');
  }
  const cityWrap = document.getElementById(cityId + '-wrap');
  const citySel = document.getElementById(cityId);
  if (cityWrap) cityWrap.style.display = 'none';
  if (citySel) citySel.innerHTML = `<option value="">${t('sel-choose-city')||'Vyber mesto...'}</option>`;
}

function _onRegionChange(countryId, regionId, cityId) {
  const country = document.getElementById(countryId)?.value;
  const region = document.getElementById(regionId)?.value;
  const cities = country && region && GEO_DATA[country]?.regions[region]?.cities
    ? GEO_DATA[country].regions[region].cities : [];
  const cityWrap = document.getElementById(cityId + '-wrap');
  const citySel = document.getElementById(cityId);
  if (cityWrap) cityWrap.style.display = cities.length ? 'block' : 'none';
  if (citySel) {
    citySel.innerHTML = `<option value="">${t('sel-choose-city')||'Vyber mesto...'}</option>`
      + cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
}

function settingPhone(label, phoneVal, prefixVal, phoneId, prefixId) {
  const currentPrefix = PHONE_PREFIXES.find(p => p.prefix === prefixVal || p.code === prefixVal) || PHONE_PREFIXES[0];
  return `<div>
    <label style="font-size:.85rem;font-weight:600;color:var(--navy);display:block;margin-bottom:6px">${label}</label>
    <div style="display:flex;gap:8px">
      <div style="position:relative;flex-shrink:0">
        <select id="${prefixId}" style="padding:11px 32px 11px 10px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;background:#fff;appearance:none;cursor:pointer;min-width:90px" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
          ${PHONE_PREFIXES.map(p => `<option value="${p.prefix}" ${currentPrefix.code===p.code?'selected':''}>${p.flag} ${p.prefix}</option>`).join('')}
        </select>
        <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-mid);font-size:.8rem">▾</span>
      </div>
      <input id="${phoneId}" type="tel" value="${phoneVal||''}" placeholder="901 234 567" style="flex:1;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--border)'">
    </div>
  </div>`;
}

function toggle(label, desc, checked) {
  const id = 'tog-' + Math.random().toString(36).slice(2,7);
  return `<div style="display:flex;align-items:center;
    justify-content:space-between;padding:14px 0;
    border-bottom:1px solid var(--border)">
    <div>
      <div style="font-weight:600;color:var(--navy);
        font-size:.9rem">${label}</div>
      <div style="font-size:.82rem;color:var(--text-mid)">
        ${desc}</div>
    </div>
    <label style="position:relative;display:inline-block;
      width:44px;height:24px;cursor:pointer">
      <input type="checkbox" ${checked ? 'checked' : ''}
        style="opacity:0;width:0;height:0"
        onchange="
          var t=this.nextElementSibling;
          t.style.background=this.checked
            ?'var(--blue)':'var(--border)';
          t.querySelector('span').style.transform=
            this.checked?'translateX(20px)':'translateX(0)';
        ">
      <span id="${id}" style="position:absolute;inset:0;
        border-radius:24px;
        background:${checked ? 'var(--blue)' : 'var(--border)'};
        transition:.2s">
        <span style="position:absolute;top:3px;left:3px;
          width:18px;height:18px;border-radius:50%;
          background:white;transition:.2s;display:block;
          transform:${checked ? 'translateX(20px)' : 'translateX(0)'}">
        </span>
      </span>
    </label>
  </div>`;
}

// ── Profile banner / avatar preview (used in both biz and infl profile) ───
function previewBanner(input, targetId) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById(targetId);
    if (el) el.style.backgroundImage = `url('${e.target.result}')`;
  };
  reader.readAsDataURL(file);
}

function previewAvatar(input, targetId) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.style.backgroundImage = `url('${e.target.result}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  };
  reader.readAsDataURL(file);
}

// ── Profile data helpers ───────────────────────────────────────────────────
function renderBizProfileData() {
  const p = APP.profile || {};
  return {
    name: p.company_name || 'Your Company',
    industry: p.industry || '—',
    website: p.website || '',
    about: p.about || p.description || t('profile-empty-about'),
    country: p.country || p.location || '—',
  };
}

function renderInflProfileData() {
  const p = APP.profile || {};
  const er = p.engagement_rate || p.avg_engagement_rate;
  return {
    name: p.full_name || p.name || p.username || p.handle || 'Your Name',
    handle: p.username ? `@${p.username}` : (p.handle || '@yourhandle'),
    niche: p.niche || '—',
    bio: p.bio || t('profile-empty-bio'),
    followers: fmtFollowers(p.follower_count),
    er: er ? `${er}%` : '—',
    rating: p.avg_rating || p.rating || 0,
    campaigns: p.campaign_count || 0,
    price: p.price_range || '—',
  };
}

// ── Campaign card (used in biz renders) ───────────────────────────────────
function bizCampCard(c) {
  const spentRaw = parseInt(String(c.spent).replace(/[€,]/g,'')) || 0;
  const budgetRaw = parseInt(String(c.budget).replace(/[€,]/g,'')) || 1;
  const pct = Math.min(Math.round(spentRaw/budgetRaw*100), 100);
  let barterQty = null;
  if ((c.type||'').toLowerCase() === 'barter') {
    try {
      const req = typeof c.requirements === 'string' ? JSON.parse(c.requirements) : (c.requirements || {});
      barterQty = req.barter_qty || null;
    } catch {}
  }
  return `
  <div class="campaign-card" id="biz-camp-${c.id}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
      <div>
        <div onclick="viewCampaignDetail('${c.id}')" style="font-weight:800;color:var(--navy);font-size:1rem;margin-bottom:4px;cursor:pointer;text-decoration:underline;text-decoration-color:var(--blue-mid)">${h(c.name)}</div>
        <div style="display:flex;gap:6px;align-items:center">${typeBadge(c.type)} ${statusBadge(c.status)}${barterQty ? `<span style="font-size:.78rem;color:var(--text-mid);margin-left:4px">${barterQty} ${t('wiz-barter-qty-label-short')||'ks'}</span>` : ''}</div>
      </div>
      <div style="text-align:right;font-size:.82rem;color:var(--text-mid)">${t('comp-budget-label')}<br><span style="font-weight:800;color:var(--navy);font-size:1rem">${c.budget}</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:16px">
      ${miniStat(t('c-applications'), c.apps)} ${miniStat(t('c-accepted-lbl'), c.accepted)} ${miniStat(t('th-reach'), c.reach)} ${miniStat(t('th-conversions'), c.conversions)}
    </div>
    <div style="background:var(--blue-light);border-radius:8px;height:6px;margin-bottom:12px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:var(--blue);border-radius:8px"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--text-mid);align-items:center">
      <span>${t('c-spent-lbl')} <strong style="color:var(--navy)">${c.spent}</strong></span>
      <button onclick="viewCampaignDetail('${c.id}')" style="padding:6px 16px;border:none;background:var(--blue);color:white;border-radius:8px;font-size:.82rem;cursor:pointer;font-weight:700">${t('c-manage-btn')}</button>
    </div>
  </div>`;
}

// ── Campaign creation wizard ───────────────────────────────────────────────

function renderCampWizard() {
  const STEPS = [
    { id:1, label:t('wiz-step-type')||'Typ' },
    { id:2, label:t('wiz-step-details')||'Detaily' },
    { id:3, label:t('wiz-step-budget')||'Budget' },
    { id:4, label:t('wiz-step-audience')||'Publikum' },
    { id:5, label:t('wiz-step-schedule')||'Rozvrh' },
  ];
  const stepper = STEPS.map((s,i) => {
    const done = s.id < _wizStep, active = s.id === _wizStep;
    const dotCls = active ? 'wiz-step-dot active' : done ? 'wiz-step-dot done' : 'wiz-step-dot';
    return `<button class="wiz-step-btn" ${s.id <= _wizStep ? `onclick="wizSetStep(${s.id})"` : 'disabled'} type="button">
      <div class="${dotCls}">${done ? '✓' : s.id}</div>
      <span class="wiz-step-label${active?' active':''}">${s.label}</span>
    </button>${i < STEPS.length-1 ? `<div class="wiz-step-line${s.id < _wizStep?' done':''}"></div>` : ''}`;
  }).join('');
  const steps = [null, _wizStep1, _wizStep2, _wizStep3, _wizStep4, _wizStep5];
  const isLast = _wizStep === 5;
  return `<div class="wiz-layout" onclick="event.stopPropagation()">
    <div class="wiz-form-col">
      <div class="wiz-panel">
        <div class="wiz-header">
          <div>
            <h2 class="wiz-title">${t('camp-modal-title')||'Vytvoriť kampaň'}</h2>
            <p class="wiz-sub">${t('wiz-step-lbl')||'Krok'} ${_wizStep} z 5 · ${STEPS[_wizStep-1].label}</p>
          </div>
          <button class="wiz-close" onclick="hideCampaignForm()" type="button">✕</button>
        </div>
        <div class="wiz-stepper">${stepper}</div>
        <div class="wiz-body">${steps[_wizStep]()}</div>
        <div class="wiz-footer">
          <button class="wiz-btn-ghost" onclick="wizBack()" type="button"${_wizStep===1?' disabled':''}>← ${t('wiz-back')||'Späť'}</button>
          <div style="flex:1"></div>
          <div id="wiz-err" class="wiz-err"></div>
          <button class="wiz-btn-draft" onclick="saveCampaign('draft')" type="button">${t('wiz-save-draft')||'Uložiť koncept'}</button>
          ${isLast
            ? `<button class="wiz-btn-primary" onclick="saveCampaign('active')" id="cc-launch-btn" type="button">🚀 ${t('wiz-launch')||'Spustiť kampaň'}</button>`
            : `<button class="wiz-btn-primary" onclick="wizNext()" type="button">${t('wiz-next')||'Pokračovať'} →</button>`}
        </div>
      </div>
    </div>
    <div class="wiz-preview-col">
      ${_renderCampPreview()}
    </div>
  </div>`;
}

function _renderCampPreview() {
  const TYPE_META = {
    affiliate:{ label:t('camp-type-affiliate'), icon:'ico-bar-chart' },
    fixed:    { label:t('camp-type-fixed'),     icon:'ico-coin' },
    barter:   { label:t('camp-type-barter'),    icon:'ico-gift' },
    hybrid:   { label:t('camp-type-hybrid'),    icon:'ico-bolt' },
  };
  const tm = TYPE_META[_wizData.type] || TYPE_META.affiliate;
  const hasContent = _wizData.name || _wizData.budget || _wizData.niches.length > 0;
  const delvs = [];
  if (_wizData.reels > 0) delvs.push(`<span class="wiz-preview-delv-pill">${_wizData.reels} reels</span>`);
  if (_wizData.stories > 0) delvs.push(`<span class="wiz-preview-delv-pill">${_wizData.stories} stories</span>`);
  if (_wizData.posts > 0) delvs.push(`<span class="wiz-preview-delv-pill">${_wizData.posts} posts</span>`);
  const deadlineStr = _wizData.deadline
    ? new Date(_wizData.deadline).toLocaleDateString('sk',{day:'numeric',month:'short',year:'numeric'})
    : t('wiz-prev-open-ended')||'Open-ended';
  const payoutVal = _wizData.type==='fixed' && _wizData.fixedFee ? `€${_wizData.fixedFee}`
    : _wizData.payoutMethod==='views' && _wizData.cpmRate ? `€${_wizData.cpmRate}/1K`
    : _wizData.commission ? `${_wizData.commission}%` : '—';
  const payoutLbl = _wizData.type==='fixed' ? t('wiz-prev-payout-fee')||'Honorár' : _wizData.payoutMethod==='views' ? t('wiz-prev-payout-cpm')||'CPM' : t('wiz-prev-payout-comm')||'Provízia';
  return `<div class="wiz-preview-header">
    <span class="wiz-preview-eyebrow">${t('wiz-prev-eyebrow')}</span>
    <span class="wiz-preview-device">${t('wiz-prev-marketplace')}</span>
  </div>
  <div class="wiz-preview-card">
    <div class="wiz-preview-cover type-${_wizData.type}">
      <div class="wiz-preview-brand-row">
        <div class="wiz-preview-brand-avatar">IB</div>
        <div class="wiz-preview-brand-info">
          <span class="wiz-preview-brand-name">${t('wiz-prev-brand')}</span>
          <span class="wiz-preview-brand-handle">${t('wiz-prev-handle')}</span>
        </div>
      </div>
      <div class="wiz-preview-type-badge">
        <svg width="12" height="12"><use href="#${tm.icon}"/></svg>
        ${tm.label}
      </div>
    </div>
    <div class="wiz-preview-body">
      <h3 class="wiz-preview-title" id="wiz-prev-title">${_wizData.name ? h(_wizData.name) : `<span class="wiz-preview-title-empty">${t('wiz-prev-name-ph')||'Názov kampane…'}</span>`}</h3>
      <div class="wiz-preview-meta-grid">
        <div class="wiz-preview-meta"><div class="wiz-preview-meta-label">${t('wiz-prev-budget-lbl')||'Budget'}</div><div class="wiz-preview-meta-value">${_wizData.budget ? `€${Number(_wizData.budget).toLocaleString('sk')}` : '—'}</div></div>
        <div class="wiz-preview-meta"><div class="wiz-preview-meta-label">${payoutLbl}</div><div class="wiz-preview-meta-value">${payoutVal}</div></div>
        <div class="wiz-preview-meta"><div class="wiz-preview-meta-label">${t('wiz-prev-deadline-lbl')||'Termín'}</div><div class="wiz-preview-meta-value">${deadlineStr}</div></div>
      </div>
      ${_wizData.niches.length > 0 ? `<div class="wiz-preview-tags">${_wizData.niches.map(n => `<span class="wiz-preview-tag">#${n}</span>`).join('')}</div>` : ''}
      ${_wizData.description
        ? `<p class="wiz-preview-desc" id="wiz-prev-desc">${h(_wizData.description)}</p>`
        : !hasContent ? `<div class="wiz-preview-empty">${t('wiz-prev-empty-msg')}</div>` : ''}
      <div class="wiz-preview-delv">
        <div class="wiz-preview-delv-label">Deliverables</div>
        <div class="wiz-preview-delv-row">${delvs.length > 0 ? delvs.join('') : `<span class="wiz-preview-delv-empty">${t('wiz-prev-step5')}</span>`}</div>
      </div>
      <button class="wiz-preview-cta type-${_wizData.type}">${t('wiz-prev-apply')}</button>
    </div>
  </div>
  <div class="wiz-preview-footer">ℹ️ ${t('wiz-prev-realtime')}</div>`;
}

function _wizStep1() {
  const TYPES = [
    { id:'affiliate', label:t('wiz-type-affiliate')||'Affiliate', sub:t('wiz-type-affiliate-sub')||'Pay per result',     icon:'ico-bar-chart', desc:t('wiz-type-affiliate-desc')||'Pay creators based on real results.' },
    { id:'fixed',     label:t('wiz-type-fixed')||'Fixed fee',     sub:t('wiz-type-fixed-sub')||'Set fee per creator',    icon:'ico-coin',      desc:t('wiz-type-fixed-desc')||'Pay a set fee per creator for completed deliverables.' },
    { id:'barter',    label:t('wiz-type-barter')||'Barter',       sub:t('wiz-type-barter-sub')||'Product / service',    icon:'ico-gift',      desc:t('wiz-type-barter-desc')||'Send your product in exchange for content.' },
    { id:'hybrid',    label:t('wiz-type-hybrid')||'Hybrid',       sub:t('wiz-type-hybrid-sub')||'Mix & match',          icon:'ico-bolt',      desc:t('wiz-type-hybrid-desc')||'Combine fixed fee + affiliate or barter.' },
  ];
  const cards = TYPES.map(tp => {
    const isActive = _wizData.type === tp.id;
    return `<button type="button" class="wiz-type-card type-${tp.id}${isActive?' active':''}" onclick="_wizSet('type','${tp.id}');_wizRefresh()">
      <div class="wiz-type-icon ${tp.id}">
        <svg width="22" height="22"><use href="#${tp.icon}"/></svg>
      </div>
      <div class="wiz-type-label">${tp.label}</div>
      <div class="wiz-type-sub">${tp.sub}</div>
      <div class="wiz-type-desc">${tp.desc}</div>
      ${isActive ? `<div class="wiz-type-check ${tp.id}">✓</div>` : ''}
    </button>`;
  }).join('');
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s1-title')||'Aký typ kampane vytváraš?'}</h3>
    <p class="wiz-section-sub">${t('wiz-s1-sub')||'Vyber model platby, ktorý najviac sedí tvojim cieľom.'}</p>
    <div class="wiz-type-grid">${cards}</div>
  </div>`;
}

function _wizStep2() {
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s2-title')||'Základné informácie'}</h3>
    <p class="wiz-section-sub">${t('wiz-s2-sub')||'Toto uvidí každý influencer pri prezeraní tvojej kampane.'}</p>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-camp-name-label')||'Názov kampane'} <span class="wiz-req">*</span></label>
      <input class="wiz-input" id="wiz-name" value="${h(_wizData.name)}" oninput="_wizSet('name',this.value);_wizPreviewUpdate()" placeholder="napr. Letná kolekcia 2026 – skincare">
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-camp-brief-label')||'Popis a brief'}</label>
      <div class="wiz-label-hint">${t('wiz-brief-hint-full')||'Čo je produkt/služba, aký obsah očakávaš, tone of voice, hashtags, kľúčové frázy.'}</div>
      <textarea class="wiz-textarea" id="wiz-desc" oninput="_wizSet('description',this.value);document.getElementById('wiz-char').textContent=this.value.length+' / 1000';_wizPreviewUpdate()" placeholder="${t('wiz-brief-ph')||'Popíš čo kampaň prezentuje…'}">${h(_wizData.description)}</textarea>
      <div class="wiz-char-count" id="wiz-char">${_wizData.description.length} / 1000</div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-brief-doc')||'Brief dokument'}</label>
      <div class="wiz-label-hint">${t('wiz-brief-doc-hint')||'Voliteľné — PDF s podrobnejším zadaním (max 10MB).'}</div>
      <button type="button" class="wiz-upload-btn">
        <svg width="16" height="16"><use href="#ico-link"/></svg>
        ${t('wiz-upload-brief')}
        <span class="wiz-upload-hint">${t('wiz-upload-drag')}</span>
      </button>
    </div>
  </div>`;
}

function _wizBudgetTotals() {
  return `<div class="wiz-grid-2">
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-budget-label')||'Celkový budget'} <span class="wiz-req">*</span></label>
      <div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.budget}" oninput="_wizSet('budget',this.value)" placeholder="5000"></div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-max-per-creator')||'Max budget na tvorcu'}</label>
      <div class="wiz-label-hint">${t('wiz-max-per-creator-hint')||'Voliteľné — bez limitu ak prázdne.'}</div>
      <div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.maxPerCreator}" oninput="_wizSet('maxPerCreator',this.value)" placeholder="bez limitu"></div>
    </div>
  </div>`;
}

function _wizPayoutSelector() {
  const pm = _wizData.payoutMethod;
  const PAYOUT = [
    { id:'discount', label:t('wiz-payout-discount')||'Discount code', desc:t('wiz-payout-discount-desc')||'Unikátny promo kód; provízia z každého predaja.', icon:'ico-credit-card' },
    { id:'views',    label:t('wiz-payout-views')||'Views / CPM',      desc:t('wiz-payout-views-desc')||'Platba za dosiahnuté zhliadnutia (CPM milestones).', icon:'ico-eye' },
  ];
  const cards = PAYOUT.map(p => `
    <button type="button" class="wiz-payout-card${pm===p.id?' active':''}" onclick="_wizSet('payoutMethod','${p.id}');_wizRefresh()">
      <div class="wiz-payout-icon">
        <svg width="16" height="16"><use href="#${p.icon}"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <div class="wiz-payout-label">${p.label}</div>
        <div class="wiz-payout-desc">${p.desc}</div>
      </div>
      <div class="wiz-payout-radio${pm===p.id?' active':''}">${pm===p.id?'<div class="wiz-payout-radio-dot"></div>':''}</div>
    </button>`).join('');
  const rateField = pm==='views'
    ? `<div class="wiz-field">
        <label class="wiz-label">${t('wiz-cpm')||'Sadzba za 1 000 views (CPM)'} <span class="wiz-req">*</span></label>
        <div class="wiz-label-hint">${t('wiz-cpm-hint')||'Koľko influencer dostane za každých 1 000 dosiahnutých views.'}</div>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.cpmRate}" oninput="_wizSet('cpmRate',this.value)" placeholder="8"><span class="wiz-suffix">/ 1K</span></div></div>
      </div>`
    : `<div class="wiz-field">
        <label class="wiz-label">${t('wiz-commission-label')||'Provízia z predaja'} <span class="wiz-req">*</span></label>
        <div class="wiz-label-hint">${t('wiz-commission-hint')||'Percento z hodnoty každého predaja, ktoré influencer dostane.'}</div>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><input class="wiz-input-plain" type="number" value="${_wizData.commission}" oninput="_wizSet('commission',this.value)" placeholder="10"><span class="wiz-suffix">%</span></div></div>
      </div>`;
  return `<div class="wiz-field">
    <label class="wiz-label">${t('wiz-payout-method')||'Spôsob vyplácania'}</label>
    <div class="wiz-payout-grid">${cards}</div>
  </div>
  ${rateField}`;
}

function _wizHybridBlock(key, title, sub, iconClass, iconId, children) {
  const isOn = !!_wizData[key];
  return `<div class="wiz-hybrid-block${isOn?' on':''}">
    <button type="button" class="wiz-hybrid-trigger" onclick="_wizSet('${key}',!_wizData['${key}']);_wizRefresh()">
      <div class="wiz-hybrid-icon ${iconClass}">
        <svg width="18" height="18"><use href="#${iconId}"/></svg>
      </div>
      <div class="wiz-hybrid-text">
        <div class="wiz-hybrid-title">${title}</div>
        <div class="wiz-hybrid-sub">${sub}</div>
      </div>
      <div class="wiz-hybrid-toggle${isOn?' on':''}">
        <span class="wiz-hybrid-toggle-thumb"></span>
      </div>
    </button>
    ${isOn ? `<div class="wiz-hybrid-body">${children}</div>` : ''}
  </div>`;
}

function _wizStep3() {
  let content = '';
  if (_wizData.type === 'affiliate') {
    content = `${_wizBudgetTotals()}${_wizPayoutSelector()}
    <div class="wiz-info">ℹ️ ${t('wiz-budget-info')||'Budget slúži ako horný strop celkovo vyplatených provízií. Kampaň automaticky končí po jeho vyčerpaní.'}</div>`;
  } else if (_wizData.type === 'fixed') {
    content = `<div class="wiz-field">
      <label class="wiz-label">${t('wiz-fixed-fee-label')||'Fixná odmena za content'} <span class="wiz-req">*</span></label>
      <div class="wiz-label-hint">${t('wiz-fixed-fee-hint')}</div>
      <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.fixedFee}" oninput="_wizSet('fixedFee',this.value)" placeholder="450"></div></div>
    </div>
    <div class="wiz-info">ℹ️ ${t('wiz-info-fixed')}</div>`;
  } else if (_wizData.type === 'barter') {
    content = `<div class="wiz-field">
      <label class="wiz-label">${t('wiz-barter-product-label')||'Produkt alebo služba'} <span class="wiz-req">*</span></label>
      <input class="wiz-input" value="${h(_wizData.barterProduct)}" oninput="_wizSet('barterProduct',this.value)" placeholder="napr. Skincare set – krém + sérum + tonik">
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-barter-qty-label')||'Počet produktov / influencerov'}</label>
      <div class="wiz-label-hint"></div>
      <input type="number" id="wiz-barter-qty"
        min="1" max="9999"
        value="${_wizData.barterQty || ''}"
        placeholder="napr. 10"
        style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:.9rem;outline:none;box-sizing:border-box"
        onfocus="this.style.borderColor='var(--blue)'"
        onblur="this.style.borderColor='var(--border)'"
        oninput="_wizSet('barterQty', parseInt(this.value)||null)">
      <div style="font-size:.78rem;color:var(--text-mid);margin-top:5px">
        ${t('wiz-barter-qty-hint')||'Každý produkt = 1 influencer. Kampaň sa uzavrie po minutí produktov.'}
      </div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-barter-desc-label')||'Popis produktu / služby'} <span class="wiz-req">*</span></label>
      <div class="wiz-label-hint">${t('wiz-barter-desc-hint')||'Čo presne influencer dostane, čo to robí, prečo je to zaujímavé.'}</div>
      <textarea class="wiz-textarea" oninput="_wizSet('barterDescription',this.value)" placeholder="${t('wiz-barter-ph')}">${h(_wizData.barterDescription)}</textarea>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-product-value')||'Hodnota produktu'}</label>
      <div class="wiz-label-hint">${t('wiz-product-value-hint')}</div>
      <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.productValue}" oninput="_wizSet('productValue',this.value)" placeholder="120"></div></div>
    </div>
    <div class="wiz-info">ℹ️ ${t('wiz-info-barter')}</div>`;
  } else {
    const fixedBlock = _wizHybridBlock('hybridFixed', t('wiz-hybrid-fixed-title')||'Fixná odmena', t('wiz-hybrid-fixed-sub')||'Garantovaná suma za splnené deliverables', 'fixed', 'ico-coin',
      `<div class="wiz-field">
        <label class="wiz-label">${t('wiz-budget-label')||'Celkový budget'} <span class="wiz-req">*</span></label>
        <div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.budget}" oninput="_wizSet('budget',this.value)" placeholder="5000"></div>
      </div>
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-fixed-fee-label')||'Fixná odmena za content'} <span class="wiz-req">*</span></label>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.fixedFee}" oninput="_wizSet('fixedFee',this.value)" placeholder="300"></div></div>
      </div>`
    );
    const affBlock = _wizHybridBlock('hybridAffiliate', t('wiz-hybrid-aff-title')||'Affiliate provízia', t('wiz-hybrid-aff-sub')||'Bonus za výsledky — % z predaja alebo CPM', 'affiliate', 'ico-bar-chart',
      _wizPayoutSelector()
    );
    const barterBlock = _wizHybridBlock('hybridBarter', t('wiz-hybrid-barter-title')||'Produkt / služba (Barter)', t('wiz-hybrid-barter-sub')||'Vec ktorú influencer dostane navyše', 'barter', 'ico-gift',
      `<div class="wiz-field">
        <label class="wiz-label">${t('wiz-barter-product-label')||'Produkt alebo služba'} <span class="wiz-req">*</span></label>
        <input class="wiz-input" value="${h(_wizData.barterProduct)}" oninput="_wizSet('barterProduct',this.value)" placeholder="napr. Skincare set">
      </div>
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-barter-desc-label')||'Popis'}</label>
        <textarea class="wiz-textarea" oninput="_wizSet('barterDescription',this.value)" placeholder="Stručný popis…">${h(_wizData.barterDescription)}</textarea>
      </div>
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-product-value')||'Hodnota produktu'}</label>
        <div class="wiz-field-narrow"><div class="wiz-prefix-wrap"><span class="wiz-prefix">€</span><input class="wiz-input-plain" type="number" value="${_wizData.productValue}" oninput="_wizSet('productValue',this.value)" placeholder="120"></div></div>
      </div>`
    );
    const noneSelected = !_wizData.hybridFixed && !_wizData.hybridAffiliate && !_wizData.hybridBarter;
    content = `<div class="wiz-hybrid-intro">${t('wiz-hybrid-intro')||'Vyber ktoré zložky chceš kombinovať. Influencer dostane všetko zapnuté.'}</div>
    ${fixedBlock}${affBlock}${barterBlock}
    ${noneSelected ? `<div class="wiz-info">ℹ️ ${t('wiz-info-hybrid-empty')}</div>` : ''}`;
  }
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s3-title')||'Rozpočet a spôsob platby'}</h3>
    <p class="wiz-section-sub">${t('wiz-s3-sub')||'Konfigurácia sa mení podľa typu kampane z kroku 1.'}</p>
    ${content}
  </div>`;
}

function _wizStep4() {
  const NICHES = ['Fashion','Beauty','Fitness','Food','Tech','Travel','Gaming','Lifestyle','Health','Business','Parenting','Auto'];
  const nicheChips = NICHES.map(n => `<button type="button" class="wiz-chip${_wizData.niches.includes(n)?' active':''}" onclick="_wizToggle('niches','${n}');this.classList.toggle('active')">${n}</button>`).join('');
  const geoSelector = settingCountry(
    t('wiz-geo-label')||'Cieľová krajina',
    _wizData.audienceCountry || '',
    'wiz-geo-country',
    _wizData.audienceRegion || '',
    'wiz-geo-region',
    _wizData.audienceCity || '',
    'wiz-geo-city'
  )
  .replace(
    `onchange="_onCountryChange('wiz-geo-country','wiz-geo-region','wiz-geo-city')"`,
    `onchange="_onCountryChange('wiz-geo-country','wiz-geo-region','wiz-geo-city');_wizSet('audienceCountry',this.value);_wizSet('audienceRegion','');_wizSet('audienceCity','')"`
  )
  .replace(
    `onchange="_onRegionChange('wiz-geo-country','wiz-geo-region','wiz-geo-city')"`,
    `onchange="_onRegionChange('wiz-geo-country','wiz-geo-region','wiz-geo-city');_wizSet('audienceRegion',this.value);_wizSet('audienceCity','')"`
  )
  .replace(
    `id="wiz-geo-city"`,
    `id="wiz-geo-city" onchange="_wizSet('audienceCity',this.value)"`
  );
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s4-title')||'Cieľová skupina'}</h3>
    <p class="wiz-section-sub">${t('wiz-s4-sub')||'Aký typ influencerov hľadáš a aké publikum chceš osloviť.'}</p>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-niches')||'Nichy / kategórie'} <span class="wiz-req">*</span></label>
      <div class="wiz-label-hint">${t('wiz-niches-hint')||'Vyber všetky relevantné — kampaň sa zobrazí len creator-om z týchto kategórií.'}</div>
      <div class="wiz-chips">${nicheChips}</div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-audience-size')||'Veľkosť publika (followers)'}</label>
      <div class="wiz-range-row">
        <div style="flex:1"><div class="wiz-range-label">${t('wiz-range-from')||'Od'}</div><input class="wiz-input" type="number" id="wiz-aud-min" value="${_wizData.audienceMin}" oninput="_wizSet('audienceMin',+this.value)"></div>
        <div class="wiz-range-dash">—</div>
        <div style="flex:1"><div class="wiz-range-label">${t('wiz-range-to')||'Do'}</div><input class="wiz-input" type="number" id="wiz-aud-max" value="${_wizData.audienceMax}" oninput="_wizSet('audienceMax',+this.value)"></div>
      </div>
      <div class="wiz-range-presets">
        <button type="button" class="wiz-preset" onclick="_wizSetRange(1000,10000)">Nano (1K–10K)</button>
        <button type="button" class="wiz-preset" onclick="_wizSetRange(10000,100000)">Micro (10K–100K)</button>
        <button type="button" class="wiz-preset" onclick="_wizSetRange(100000,500000)">Mid (100K–500K)</button>
        <button type="button" class="wiz-preset" onclick="_wizSetRange(500000,5000000)">Macro (500K+)</button>
      </div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-geo')||'Geo targeting'}</label>
      ${geoSelector}
    </div>
  </div>`;
}

function _wizStep5() {
  const PLATFORMS = [{id:'instagram',label:'Instagram'},{id:'tiktok',label:'TikTok'},{id:'youtube',label:'YouTube'},{id:'facebook',label:'Facebook'}];
  const platformChips = PLATFORMS.map(p => `<button type="button" class="wiz-chip${_wizData.platforms.includes(p.id)?' active':''}" onclick="_wizToggle('platforms','${p.id}');this.classList.toggle('active')">${p.label}</button>`).join('');
  const counter = (label, key) => `<div class="wiz-counter">
    <div class="wiz-counter-label">${label}</div>
    <div class="wiz-counter-row">
      <button type="button" class="wiz-counter-btn" onclick="_wizDec('${key}')">−</button>
      <span class="wiz-counter-value${_wizData[key]>0?' positive':''}" id="wiz-cnt-${key}">${_wizData[key]}</span>
      <button type="button" class="wiz-counter-btn inc" onclick="_wizInc('${key}')">+</button>
    </div>
  </div>`;
  return `<div class="wiz-section">
    <h3 class="wiz-section-title">${t('wiz-s5-title')||'Rozvrh a deliverables'}</h3>
    <p class="wiz-section-sub">${t('wiz-s5-sub')||'Kedy kampaň prebieha a aký obsah od influencera očakávaš.'}</p>
    <div class="wiz-grid-2">
      <div class="wiz-field">
        <label class="wiz-label">${t('wiz-start-date')||'Štart kampane'}</label>
        <input type="date" class="wiz-input" value="${_wizData.startDate}" oninput="_wizSet('startDate',this.value)">
      </div>
      <div class="wiz-field">
        <label class="wiz-label">${t('c-form-deadline')||'Uzávierka'}</label>
        <div class="wiz-label-hint">${(_wizData.type === 'affiliate' || (_wizData.type === 'hybrid' && _wizData.hybridAffiliate)) ? 'Voliteľné — bez dátumu beží do vyčerpania budgetu.' : 'Voliteľné.'}</div>
        <input type="date" class="wiz-input" value="${_wizData.deadline}" oninput="_wizSet('deadline',this.value)">
      </div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-platforms')||'Platformy'}</label>
      <div class="wiz-chips">${platformChips}</div>
    </div>
    <div class="wiz-field">
      <label class="wiz-label">${t('wiz-deliverables')||'Deliverables na influencera'}</label>
      <div class="wiz-delv-grid">
        ${counter(t('wiz-delv-reels')||'Reels / videá','reels')}
        ${counter(t('wiz-delv-stories')||'Stories','stories')}
        ${counter(t('wiz-delv-posts')||'Statické posty','posts')}
      </div>
    </div>
    <div class="wiz-field" style="border-top:1px solid var(--border);padding-top:16px;margin-top:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px">
        <div>
          <div class="wiz-label" style="margin-bottom:2px">${t('wiz-allow-reapply-label')||'Povoliť opakovanú účasť'}</div>
          <div class="wiz-label-hint">${t('wiz-allow-reapply-desc')||'Ak zapnuté, influencer sa môže zapojiť opakovane po dokončení predchádzajúcej účasti.'}</div>
        </div>
        <button type="button" role="switch" aria-checked="${_wizData.allow_reapply}"
          onclick="_wizSet('allow_reapply',!_wizData.allow_reapply);_wizRefresh()"
          class="wiz-hybrid-toggle${_wizData.allow_reapply?' on':''}">
          <span class="wiz-hybrid-toggle-thumb"></span>
        </button>
      </div>
    </div>
  </div>`;
}
