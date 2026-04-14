// SkinHelper Popup JS — with Google Translate for any language

const COIN_VALUE = 0.66;
const BUFF_API   = 'https://prices.csgotrader.app/latest/buff163.json';

// ─── All Google Translate supported languages (~130+) ─────────────────────
const LANGUAGES = [
  {code:'en',name:'English'},
  {code:'af',name:'Afrikaans'},{code:'sq',name:'Albanian'},{code:'am',name:'Amharic'},
  {code:'ar',name:'Arabic'},{code:'hy',name:'Armenian'},{code:'az',name:'Azerbaijani'},
  {code:'eu',name:'Basque'},{code:'be',name:'Belarusian'},{code:'bn',name:'Bengali'},
  {code:'bs',name:'Bosnian'},{code:'bg',name:'Bulgarian'},{code:'ca',name:'Catalan'},
  {code:'ceb',name:'Cebuano'},{code:'ny',name:'Chichewa'},{code:'zh-cn',name:'Chinese (Simplified)'},
  {code:'zh-tw',name:'Chinese (Traditional)'},{code:'co',name:'Corsican'},{code:'hr',name:'Croatian'},
  {code:'cs',name:'Czech'},{code:'da',name:'Danish'},{code:'nl',name:'Dutch'},
  {code:'eo',name:'Esperanto'},{code:'et',name:'Estonian'},{code:'tl',name:'Filipino'},
  {code:'fi',name:'Finnish'},{code:'fr',name:'French'},{code:'fy',name:'Frisian'},
  {code:'gl',name:'Galician'},{code:'ka',name:'Georgian'},{code:'de',name:'German'},
  {code:'el',name:'Greek'},{code:'gu',name:'Gujarati'},{code:'ht',name:'Haitian Creole'},
  {code:'ha',name:'Hausa'},{code:'haw',name:'Hawaiian'},{code:'iw',name:'Hebrew'},
  {code:'hi',name:'Hindi'},{code:'hmn',name:'Hmong'},{code:'hu',name:'Hungarian'},
  {code:'is',name:'Icelandic'},{code:'ig',name:'Igbo'},{code:'id',name:'Indonesian'},
  {code:'ga',name:'Irish'},{code:'it',name:'Italian'},{code:'ja',name:'Japanese'},
  {code:'jw',name:'Javanese'},{code:'kn',name:'Kannada'},{code:'kk',name:'Kazakh'},
  {code:'km',name:'Khmer'},{code:'rw',name:'Kinyarwanda'},{code:'ko',name:'Korean'},
  {code:'ku',name:'Kurdish (Kurmanji)'},{code:'ky',name:'Kyrgyz'},{code:'lo',name:'Lao'},
  {code:'la',name:'Latin'},{code:'lv',name:'Latvian'},{code:'lt',name:'Lithuanian'},
  {code:'lb',name:'Luxembourgish'},{code:'mk',name:'Macedonian'},{code:'mg',name:'Malagasy'},
  {code:'ms',name:'Malay'},{code:'ml',name:'Malayalam'},{code:'mt',name:'Maltese'},
  {code:'mi',name:'Maori'},{code:'mr',name:'Marathi'},{code:'mn',name:'Mongolian'},
  {code:'my',name:'Myanmar (Burmese)'},{code:'ne',name:'Nepali'},{code:'no',name:'Norwegian'},
  {code:'or',name:'Odia (Oriya)'},{code:'ps',name:'Pashto'},{code:'fa',name:'Persian'},
  {code:'pl',name:'Polish'},{code:'pt',name:'Portuguese'},{code:'pa',name:'Punjabi'},
  {code:'ro',name:'Romanian'},{code:'ru',name:'Russian'},{code:'sm',name:'Samoan'},
  {code:'gd',name:'Scots Gaelic'},{code:'sr',name:'Serbian'},{code:'st',name:'Sesotho'},
  {code:'sn',name:'Shona'},{code:'sd',name:'Sindhi'},{code:'si',name:'Sinhala'},
  {code:'sk',name:'Slovak'},{code:'sl',name:'Slovenian'},{code:'so',name:'Somali'},
  {code:'es',name:'Spanish'},{code:'su',name:'Sundanese'},{code:'sw',name:'Swahili'},
  {code:'sv',name:'Swedish'},{code:'tg',name:'Tajik'},{code:'ta',name:'Tamil'},
  {code:'tt',name:'Tatar'},{code:'te',name:'Telugu'},{code:'th',name:'Thai'},
  {code:'tr',name:'Turkish'},{code:'tk',name:'Turkmen'},{code:'uk',name:'Ukrainian'},
  {code:'ur',name:'Urdu'},{code:'ug',name:'Uyghur'},{code:'uz',name:'Uzbek'},
  {code:'vi',name:'Vietnamese'},{code:'cy',name:'Welsh'},{code:'xh',name:'Xhosa'},
  {code:'yi',name:'Yiddish'},{code:'yo',name:'Yoruba'},{code:'zu',name:'Zulu'}
];

// ─── English base strings (source for translation) ────────────────────────
const BASE = {
  info:        'Price is based on $0.66 per coin  (1c = $0.66)',
  checkSkin:   'Check Skin',
  skinName:    'Skin Name',
  skinPh:      'Type e.g. AK-47 Redline FT...',
  rollCoins:   'Roll Coins',
  rollPh:      'e.g. 2854',
  buffUSD:     'Buff USD (auto)',
  buffPh:      'auto or type manually',
  buffPrice:   'Buff Price',
  correctRoll: 'Correct Roll Price',
  youPaying:   'You are paying',
  saveSkin:    'Save Skin',
  csv:         'CSV',
  export:      'Export',
  clearAll:    'Clear All',
  savedSkins:  'Saved Skins',
  noSkins:     'No skins saved yet.',
  errName:     'Enter a skin name.',
  errBuff:     'Select a skin from the dropdown first.',
  confirmClear:'Delete all saved skins?',
  overpriced:  'Overpriced by',
  underpriced: 'Underpriced by',
  goodDeal:    'Good deal!',
  fairPrice:   'Fair price',
  saved:       'Saved!',
  imported:    'skins imported',
  translating: 'Translating...',
};

// ─── Translation cache & state ────────────────────────────────────────────
let currentLang = 'en';
let translations = { en: BASE };
let isTranslating = false;

function tr(key) {
  const t = translations[currentLang] || BASE;
  return t[key] || BASE[key] || key;
}

// ─── Translate all strings via Google Translate ───────────────────────────
async function translateTo(langCode) {
  if (langCode === 'en') { translations['en'] = BASE; return BASE; }
  if (translations[langCode]) return translations[langCode]; // cached

  const strings = Object.values(BASE);
  const joined  = strings.join('\n||||\n'); // use separator to batch in one request

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(langCode)}&dt=t&q=${encodeURIComponent(joined)}`;
    const res  = await fetch(url);
    const data = await res.json();

    // Google returns array of translated segments
    const rawText = data[0].map(seg => seg[0]).join('');
    const parts   = rawText.split('||||\n').map(s => s.trim());

    const keys = Object.keys(BASE);
    const result = {};
    keys.forEach((key, i) => { result[key] = parts[i] || BASE[key]; });

    translations[langCode] = result;
    return result;
  } catch (e) {
    console.error('[SkinHelper] Translation failed:', e);
    return BASE;
  }
}

// ─── Apply translations to DOM ────────────────────────────────────────────
function setText(id, val) { var el=document.getElementById(id); if(el) el.textContent=val; }
function setPlaceholder(id, val) { var el=document.getElementById(id); if(el) el.placeholder=val; }

function applyTranslations() {
  setText('infoNote', tr('info'));
  setText('labelSkinName', tr('skinName'));
  setPlaceholder('skinName', tr('skinPh'));
  setText('labelRollCoins', tr('rollCoins'));
  setPlaceholder('rollCoins', tr('rollPh'));
  setText('labelBuffUSD', tr('buffUSD'));
  setPlaceholder('buffUSD', tr('buffPh'));
  setText('labelPreviewBuff', tr('buffPrice'));
  setText('labelPreviewCorrect', tr('correctRoll'));
  setText('labelPreviewPaying', tr('youPaying'));
  setText('labelCSV', '📂 ' + tr('csv'));
  setText('exportBtn', tr('export'));
  setText('clearAll', tr('clearAll'));
  setText('emptySkins', tr('noSkins'));

  var addSkin = document.getElementById('addSkin');
  if (addSkin) addSkin.textContent = '+ ' + tr('saveSkin');

  var rtlLangs = ['ar','fa','iw','ur','yi','ps','ug','sd','ku'];
  document.body.dir = rtlLangs.includes(currentLang) ? 'rtl' : 'ltr';

  renderSkinList();
}

// ─── Build language dropdown ──────────────────────────────────────────────
function buildLangSelector() {
  const sel = document.getElementById('langSelect');
  sel.innerHTML = LANGUAGES.map(l =>
    `<option value="${l.code}">${l.name}</option>`
  ).join('');
  sel.value = currentLang;

  sel.addEventListener('change', async () => {
    currentLang = sel.value;
    browserAPI.storage.local.set({ lang: currentLang });

    if (currentLang === 'en') {
      applyTranslations();
      return;
    }

    // Show translating state
    document.getElementById('infoNote').textContent = tr('translating') || 'Translating...';
    sel.disabled = true;

    await translateTo(currentLang);
    sel.disabled = false;
    applyTranslations();
  });
}

// ─── Core ─────────────────────────────────────────────────────────────────
var skins = {}, buffPrices = {}, portfolio = {}, searchTimeout = null;

function normalize(s) { return s.toLowerCase().replace(/[★|()\\.]/g,' ').replace(/-/g,' ').replace(/\s+/g,' ').trim(); }
function expandQuery(q) {
  return q.replace(/\bp1\b/g,'phase 1').replace(/\bp2\b/g,'phase 2').replace(/\bp3\b/g,'phase 3').replace(/\bp4\b/g,'phase 4')
    .replace(/\bbp\b/g,'black pearl').replace(/\bgamma\b/g,'gamma doppler').replace(/\bdopp\b/g,'doppler')
    .replace(/\bfn\b/g,'factory new').replace(/\bmw\b/g,'minimal wear').replace(/\bft\b/g,'field-tested')
    .replace(/\bww\b/g,'well-worn').replace(/\bbs\b/g,'battle-scarred');
}
function compute(roll, buff) {
  var correct = buff / COIN_VALUE;
  var pct = roll != null ? (roll * 100 / correct) - 100 : null;
  return { correct: correct, pct: pct };
}
function formatDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getFullYear();
}

// ─── Tab switching ────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
    tab.classList.add('active');
    document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
  });
});

// ─── Load ─────────────────────────────────────────────────────────────────
browserAPI.storage.local.get(['skins','buffPrices','buffPricesTime','lang','translationCache','portfolio',]).then(async function(data) {
  skins     = data.skins     || {};
  portfolio = data.portfolio || {};
  
  if (data.translationCache) Object.assign(translations, data.translationCache);
  currentLang = data.lang || 'en';
  buildLangSelector();
  applyTranslations();
  if (currentLang !== 'en' && !translations[currentLang]) {
    document.getElementById('langSelect').disabled = true;
    await translateTo(currentLang);
    document.getElementById('langSelect').disabled = false;
    browserAPI.storage.local.set({ translationCache: translations });
    applyTranslations();
  }
  var age = Date.now() - (data.buffPricesTime || 0);
  if (data.buffPrices && age < 60000) { buffPrices = data.buffPrices; setNameStatus('✅'); }
  else fetchBuffPrices();
  renderSkinList();
  renderPortfolio();
  
}).catch(function() { buildLangSelector(); applyTranslations(); fetchBuffPrices(); });

// ─── Buff API ─────────────────────────────────────────────────────────────
function extractPrice(v) {
  if (typeof v === 'number') return v;
  if (!v || typeof v !== 'object') return null;
  var f = v.price != null ? v.price : v.buff_price != null ? v.buff_price : v.last_24h != null ? v.last_24h : v.suggested_price != null ? v.suggested_price : v.value != null ? v.value : v.USD != null ? v.USD : null;
  if (typeof f === 'number') return f;
  var vals = Object.values(v);
  for (var i=0;i<vals.length;i++) {
    if (typeof vals[i]==='number'&&vals[i]>0) return vals[i];
    if (vals[i]&&typeof vals[i]==='object') { var n=vals[i].price||vals[i].average||vals[i].value||null; if (typeof n==='number'&&n>0) return n; }
  }
  return null;
}

function fetchBuffPrices(silent) {
  if (!silent) setNameStatus('⏳');
  fetch(BUFF_API).then(function(r){return r.json();}).then(function(data){
    buffPrices={};
    Object.keys(data).forEach(function(k){ var p=extractPrice(data[k]); if(p>0) buffPrices[k.toLowerCase()]=p; });
    if (Object.keys(buffPrices).length) {
      browserAPI.storage.local.set({buffPrices:buffPrices,buffPricesTime:Date.now()});
      setNameStatus('✅');
      refreshPrice();
      renderPortfolio();
      
    } else if(!silent) setNameStatus('⚠️');
  }).catch(function(){ if(!silent) setNameStatus('⚠️'); });
}
setInterval(function(){ fetchBuffPrices(true); }, 60000);

function refreshPrice() {
  var cur = document.getElementById('skinName').value.trim().toLowerCase();
  if (cur && buffPrices[cur]) { document.getElementById('buffUSD').value = parseFloat(buffPrices[cur]).toFixed(2); updatePreview(); }
}

// ─── Search engine (reusable for all 4 search boxes) ──────────────────────
function makeSearch(inputId, suggestId, statusId, onSelect) {
  var inputEl   = document.getElementById(inputId);
  var suggestEl = document.getElementById(suggestId);
  var timer     = null;

  function runSearch(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) { closeSug(); return; }
    var words = normalize(expandQuery(q)).split(' ').filter(function(w){return w.length>1;});
    var matches = Object.entries(buffPrices).filter(function(e){
      var kn=normalize(e[0]); return words.every(function(w){return kn.includes(w);});
    }).slice(0,25);
    if (!matches.length && words.length>1) {
      for (var i=words.length-1;i>=1;i--) {
        var sub=words.slice(0,i);
        matches=Object.entries(buffPrices).filter(function(e){return sub.every(function(w){return normalize(e[0]).includes(w);});}).slice(0,25);
        if (matches.length) break;
      }
    }
    if (!matches.length) { closeSug(); return; }
    window['_sc_'+inputId] = matches.map(function(e){
      return {display:e[0].split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' '),price:e[1]};
    });
    suggestEl.innerHTML = window['_sc_'+inputId].map(function(e,i){
      return '<div class="sugg-item" data-idx="'+i+'">'+e.display+' — <span style="color:#4caf81">$'+parseFloat(e.price).toFixed(2)+'</span></div>';
    }).join('');
    suggestEl.classList.add('open');
  }

  function closeSug(){ suggestEl.classList.remove('open'); suggestEl.innerHTML=''; }

  inputEl.addEventListener('input', function(){
    clearTimeout(timer);
    var q=inputEl.value.trim();
    if (q.length<2){ closeSug(); return; }
    timer=setTimeout(function(){runSearch(q);},200);
  });

  suggestEl.addEventListener('click', function(e){
    var item=e.target.closest('.sugg-item'); if(!item) return;
    var entry=window['_sc_'+inputId][parseInt(item.dataset.idx)]; if(!entry) return;
    inputEl.value=entry.display;
    closeSug();
    onSelect(entry);
  });

  document.addEventListener('click', function(e){
    if (!e.target.closest('#'+inputId) && !e.target.closest('#'+suggestId)) closeSug();
  });
}

// ─── CHECK TAB ────────────────────────────────────────────────────────────
var buffUSDEl   = document.getElementById('buffUSD');
var rollCoinsEl = document.getElementById('rollCoins');

makeSearch('skinName','suggestions','nameStatus', function(entry){
  buffUSDEl.value = entry.price.toFixed(2);
  buffUSDEl.classList.add('found');
  updatePreview();
});

rollCoinsEl.addEventListener('input', updatePreview);
buffUSDEl.addEventListener('input', updatePreview);

function updatePreview() {
  var roll=parseFloat(rollCoinsEl.value), buff=parseFloat(buffUSDEl.value);
  if (isNaN(buff)||buff<=0){ clearPreview(); return; }
  var r=compute(isNaN(roll)?null:roll, buff);
  document.getElementById('preview').classList.add('visible');
  document.getElementById('prev-buff').textContent    = '$'+buff.toFixed(2);
  document.getElementById('prev-correct').textContent = r.correct.toFixed(2)+' coins';
  document.getElementById('prev-roll').textContent    = !isNaN(roll)?roll.toFixed(2)+' coins':'—';
  var v=document.getElementById('prev-verdict');
  if (r.pct===null){v.textContent='';v.className='verdict';}
  else if(r.pct>1) {v.textContent='🔴 '+tr('overpriced')+' '+r.pct.toFixed(2)+'%';v.className='verdict over';}
  else if(r.pct<-1){v.textContent='🟢 '+tr('underpriced')+' '+Math.abs(r.pct).toFixed(2)+'% — '+tr('goodDeal');v.className='verdict under';}
  else             {v.textContent='⚪ '+tr('fairPrice')+' ('+r.pct.toFixed(2)+'%)';v.className='verdict fair';}

  // Break-even: at what Roll price is this skin exactly fair (0% over)?
  var be=document.getElementById('breakeven');
  var beText=document.getElementById('breakeven-text');
  if (!isNaN(buff) && buff>0) {
    be.classList.add('visible');
    var fairCoins = r.correct;
    beText.innerHTML = 'Break-even: <span class="breakeven-val">'+fairCoins.toFixed(2)+' coins</span> — buy below this for a good deal';
  } else {
    be.classList.remove('visible');
  }
}
function clearPreview(){
  document.getElementById('preview').classList.remove('visible');
  document.getElementById('breakeven').classList.remove('visible');
}

// ─── Save Skin ────────────────────────────────────────────────────────────
document.getElementById('addSkin').addEventListener('click', function(){
  var name=document.getElementById('skinName').value.trim();
  var roll=parseFloat(rollCoinsEl.value), buff=parseFloat(buffUSDEl.value);
  if (!name) return showStatus('skinStatus', tr('errName'), false);
  if (isNaN(buff)) return showStatus('skinStatus', tr('errBuff'), false);
  skins[name.toLowerCase()]={name:name,rollCoins:isNaN(roll)?null:roll,buffUSD:buff,savedAt:new Date().toISOString()};
  browserAPI.storage.local.set({skins:skins});
  renderSkinList();
  document.getElementById('skinName').value=''; rollCoinsEl.value=''; buffUSDEl.value='';
  buffUSDEl.classList.remove('found'); clearPreview();
  showStatus('skinStatus','✓ "'+name+'" — '+tr('saved'), true);
});

function renderSkinList(){
  var list=document.getElementById('skinList');
  var entries=Object.values(skins);
  document.getElementById('titleSavedSkins').textContent=tr('savedSkins')+' ('+entries.length+')';
  if (!entries.length){list.innerHTML='<div class="empty">'+tr('noSkins')+'</div>';return;}
  list.innerHTML=entries.map(function(skin,idx){
    var r=compute(skin.rollCoins,skin.buffUSD);
    var cls='tag-fair',lbl='—';
    if(r.pct!==null){if(r.pct>1){cls='tag-over';lbl='+'+r.pct.toFixed(2)+'%';}else if(r.pct<-1){cls='tag-under';lbl=r.pct.toFixed(2)+'%';}else{lbl=r.pct.toFixed(2)+'%';}}
    return '<div class="skin-item"><span class="skin-name" title="'+skin.name+'">'+skin.name+'</span>'
      +'<span class="tag tag-buff">$'+skin.buffUSD.toFixed(2)+'</span>'
      +'<span class="tag tag-correct">'+(skin.rollCoins!=null?skin.rollCoins.toFixed(0):'—')+'c</span>'
      +'<span class="tag '+cls+'">'+lbl+'</span>'
      +'<button class="btn-del" data-del="'+idx+'">✕</button></div>';
  }).join('');
}

document.getElementById('skinList').addEventListener('click', function(e){
  var btn=e.target.closest('[data-del]'); if(!btn) return;
  var idx=parseInt(btn.getAttribute('data-del'));
  var skin=Object.values(skins)[idx]; if(!skin) return;
  showConfirm('Delete "'+skin.name.substring(0,22)+'…"?', function(){
    delete skins[skin.name.toLowerCase()];
    browserAPI.storage.local.set({skins:skins}); renderSkinList();
  });
});

document.getElementById('clearAll').addEventListener('click', function(){
  if (!Object.keys(skins).length) return;
  showConfirm(tr('confirmClear'), function(){ skins={}; browserAPI.storage.local.set({skins:skins}); renderSkinList(); });
});

// CSV
document.getElementById('csvImport').addEventListener('change', function(e){
  var file=e.target.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=function(ev){
    var lines=ev.target.result.split('\n'),count=0;
    lines.forEach(function(line,i){
      if(i===0&&isNaN(parseFloat(line.split(',')[1])))return;
      var p=line.split(',').map(function(s){return s.replace(/"/g,'').trim();});
      if(!p[0]||isNaN(parseFloat(p[2])))return;
      skins[p[0].toLowerCase()]={name:p[0],rollCoins:isNaN(parseFloat(p[1]))?null:parseFloat(p[1]),buffUSD:parseFloat(p[2]),savedAt:new Date().toISOString()};
      count++;
    });
    browserAPI.storage.local.set({skins:skins}); renderSkinList();
    showStatus('skinStatus','✓ '+count+' '+tr('imported'), true); e.target.value='';
  };
  reader.readAsText(file);
});

document.getElementById('exportBtn').addEventListener('click', function(){
  var rows=['Skin Name,Roll Coins,Buff USD,Correct Roll Price,Percentage,Date Saved'];
  Object.values(skins).forEach(function(s){
    var r=compute(s.rollCoins,s.buffUSD);
    rows.push('"'+s.name+'",'+(s.rollCoins||'')+','+s.buffUSD+','+r.correct.toFixed(6)+','+(r.pct!=null?r.pct.toFixed(8):'')+','+(s.savedAt?formatDate(s.savedAt):''));
  });
  downloadCSV(rows.join('\n'), 'skinhelper.csv');
});

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────
makeSearch('portSkinName','portSuggestions','portNameStatus', function(entry){
  document.getElementById('portBuffUSD').value = entry.price.toFixed(2);
});

document.getElementById('portAddBtn').addEventListener('click', function(){
  var name=document.getElementById('portSkinName').value.trim();
  var paid=parseFloat(document.getElementById('portPaid').value);
  var qty=parseInt(document.getElementById('portQty').value)||1;
  var buff=parseFloat(document.getElementById('portBuffUSD').value);
  if (!name) return showStatus('portStatus','Enter a skin name.',false);
  if (isNaN(paid)) return showStatus('portStatus','Enter what you paid in coins.',false);
  if (isNaN(buff)) return showStatus('portStatus','Select skin from dropdown first.',false);
  var key=name.toLowerCase()+'_'+Date.now();
  portfolio[key]={name:name,paid:paid,qty:qty,buffUSD:buff,addedAt:new Date().toISOString()};
  browserAPI.storage.local.set({portfolio:portfolio});
  renderPortfolio();
  document.getElementById('portSkinName').value='';
  document.getElementById('portPaid').value='';
  document.getElementById('portQty').value='1';
  document.getElementById('portBuffUSD').value='';
  showStatus('portStatus','✓ "'+name+'" added to portfolio.',true);
});

function renderPortfolio(){
  var list=document.getElementById('portfolioList');
  var entries=Object.entries(portfolio);
  if (!entries.length){list.innerHTML='<div class="empty">No skins in portfolio yet.</div>';document.getElementById('portSummary').style.display='none';return;}

  var totalInvested=0, totalBuffValue=0;
  list.innerHTML=entries.map(function(entry,i){
    var key=entry[0], p=entry[1];
    // Get latest buff price
    var currentBuff=buffPrices[p.name.toLowerCase()]||p.buffUSD;
    var buffValueCoins=currentBuff/COIN_VALUE;
    var totalPaidCoins=p.paid*p.qty;
    var totalValueCoins=buffValueCoins*p.qty;
    var diff=totalValueCoins-totalPaidCoins;
    var diffPct=((totalValueCoins-totalPaidCoins)/totalPaidCoins*100);
    totalInvested+=totalPaidCoins;
    totalBuffValue+=totalValueCoins;
    var profitCls=diff>=0?'pos':'neg';
    var profitSign=diff>=0?'+':'';
    return '<div class="portfolio-item">'
      +'<div class="pi-top"><span class="pi-name" title="'+p.name+'">'+p.name+'</span>'
      +(p.qty>1?'<span class="tag tag-own">x'+p.qty+'</span>':'')
      +'<button class="btn-del" data-port-del="'+key+'">✕</button></div>'
      +'<div class="pi-bottom">'
      +'<span class="pi-stat">Paid: <span>'+totalPaidCoins.toFixed(0)+'c</span></span>'
      +'<span class="pi-stat">Buff: <span>$'+currentBuff.toFixed(2)+'</span></span>'
      +'<span class="pi-stat">Worth: <span>'+totalValueCoins.toFixed(0)+'c</span></span>'
      +'<span class="pi-profit '+profitCls+'">'+profitSign+diff.toFixed(0)+'c ('+profitSign+diffPct.toFixed(1)+'%)</span>'
      +'</div></div>';
  }).join('');

  // Summary
  document.getElementById('portSummary').style.display='grid';
  var totalDiff=totalBuffValue-totalInvested;
  var totalDiffPct=totalInvested>0?(totalDiff/totalInvested*100):0;
  document.getElementById('portTotalInvested').textContent=totalInvested.toFixed(0)+'c';
  document.getElementById('portTotalValue').textContent=totalBuffValue.toFixed(0)+'c';
  var pnlEl=document.getElementById('portPnL');
  pnlEl.textContent=(totalDiff>=0?'+':'')+totalDiff.toFixed(0)+'c';
  pnlEl.style.color=totalDiff>=0?'#4caf81':'#e05555';
}

document.getElementById('portClearAll').addEventListener('click', function(){
  if (!Object.keys(portfolio).length) return;
  var statusEl = document.getElementById('portStatus');
  var yes = document.createElement('button'), no = document.createElement('button');
  yes.textContent = 'Yes'; no.textContent = 'No';
  yes.style.cssText = 'background:#e05555;color:#fff;border:none;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px;margin:0 4px';
  no.style.cssText  = 'background:#1e2433;color:#ccc;border:1px solid #2a3148;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px';
  statusEl.style.color = '#f4a40b'; statusEl.textContent = 'Clear all portfolio? ';
  statusEl.appendChild(yes); statusEl.appendChild(no);
  yes.addEventListener('click', function(){ statusEl.innerHTML=''; portfolio={}; browserAPI.storage.local.set({portfolio:portfolio}); renderPortfolio(); });
  no.addEventListener('click',  function(){ statusEl.innerHTML=''; });
});

document.getElementById('portfolioList').addEventListener('click', function(e){
  var btn=e.target.closest('[data-port-del]'); if(!btn) return;
  var key=btn.getAttribute('data-port-del');
  var item=portfolio[key]; if(!item) return;
  var label=item.name.length>22?item.name.substring(0,22)+'…':item.name;
  var statusEl=document.getElementById('portStatus');
  var yes=document.createElement('button'), no=document.createElement('button');
  yes.textContent='Yes'; no.textContent='No';
  yes.style.cssText='background:#e05555;color:#fff;border:none;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px;margin:0 4px';
  no.style.cssText='background:#1e2433;color:#ccc;border:1px solid #2a3148;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px';
  statusEl.style.color='#f4a40b'; statusEl.textContent='Remove "'+label+'"? ';
  statusEl.appendChild(yes); statusEl.appendChild(no);
  yes.addEventListener('click',function(){
    statusEl.innerHTML='';
    delete portfolio[key];
    browserAPI.storage.local.set({portfolio:portfolio}); renderPortfolio();
  });
  no.addEventListener('click',function(){ statusEl.innerHTML=''; });
});

// ─── COMPARE TAB ─────────────────────────────────────────────────────────
// Format: "Skin Name, RollCoins" one per line
document.getElementById('compareBtn').addEventListener('click', function(){
  var lines=document.getElementById('compareInput').value.trim().split('\n');
  var results=document.getElementById('compareResults');
  if (!lines.length||!lines[0]) return;

  var html=lines.map(function(line){
    line=line.trim(); if(!line) return '';
    var lastComma=line.lastIndexOf(',');
    var name=lastComma>0?line.substring(0,lastComma).trim():line;
    var rollCoins=lastComma>0?parseFloat(line.substring(lastComma+1)):NaN;
    var buffPrice=buffPrices[name.toLowerCase()];
    // Try fuzzy match
    if (!buffPrice) {
      var nNorm=normalize(name);
      var words=nNorm.split(' ').filter(function(w){return w.length>2;});
      var best=null,bestScore=0;
      Object.entries(buffPrices).forEach(function(e){
        var score=words.filter(function(w){return normalize(e[0]).includes(w);}).length;
        if(score>bestScore){bestScore=score;best=e;}
      });
      if(best&&bestScore>=2){buffPrice=best[1];name=best[0].split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' ');}
    }
    if (!buffPrice) return '<div class="compare-item"><span class="ci-name">'+line+'</span><span class="ci-notfound">Not found</span></div>';
    var r=compute(isNaN(rollCoins)?null:rollCoins,buffPrice);
    var cls='tag-fair',lbl='—';
    if(r.pct!==null){if(r.pct>1){cls='tag-over';lbl='+'+r.pct.toFixed(2)+'%';}else if(r.pct<-1){cls='tag-under';lbl=r.pct.toFixed(2)+'%';}else{lbl=r.pct.toFixed(2)+'%';}}
    return '<div class="compare-item">'
      +'<span class="ci-name" title="'+name+'">'+name+'</span>'
      +'<span class="tag tag-buff">$'+buffPrice.toFixed(2)+'</span>'
      +'<span class="tag tag-correct">'+r.correct.toFixed(0)+'c</span>'
      +'<span class="tag '+cls+'">'+lbl+'</span></div>';
  }).join('');
  results.innerHTML=html||'<div class="empty">No results.</div>';
});

document.getElementById('compareClear').addEventListener('click', function(){
  document.getElementById('compareInput').value='';
  document.getElementById('compareResults').innerHTML='';
});


// ─── CONFIRM ──────────────────────────────────────────────────────────────
function showConfirm(msg, onYes) {
  var el=document.getElementById('skinStatus');
  var yes=document.createElement('button'), no=document.createElement('button');
  yes.textContent='Yes'; no.textContent='No';
  yes.style.cssText='background:#e05555;color:#fff;border:none;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px;margin:0 4px';
  no.style.cssText='background:#1e2433;color:#ccc;border:1px solid #2a3148;padding:2px 8px;border-radius:3px;cursor:pointer;font-size:10px';
  el.style.color='#f4a40b'; el.textContent=msg+' ';
  el.appendChild(yes); el.appendChild(no);
  yes.addEventListener('click',function(){el.innerHTML='';onYes();});
  no.addEventListener('click',function(){el.innerHTML='';});
}

// ─── CSV download ─────────────────────────────────────────────────────────
function downloadCSV(content, filename) {
  var blob=new Blob([content],{type:'text/csv'});
  var url=URL.createObjectURL(blob); var a=document.createElement('a');
  a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function setNameStatus(icon){ document.getElementById('nameStatus').textContent=icon; }
function showStatus(id, msg, ok){
  var el=document.getElementById(id);
  el.textContent=msg; el.style.color=ok?'#4caf81':'#e05555';
  setTimeout(function(){el.textContent='';},3000);
}
