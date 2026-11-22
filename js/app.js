(function(){
"use strict";

// Dáta sú v js/config.js a js/cards/*.js
var CATS = GAME.categories, TYPES = GAME.types, CARDS = GAME.cards;
var TYPE_MIX_TAG = GAME.typeMixTag, SK_PLAIN = GAME.skPlain, ORIG_FORCE = GAME.origForce;

function typeOf(id){ return TYPES.filter(function(t){return t.id===id;})[0]; }
function normTy(a){
  var r = (a||[]).filter(function(id){ return !!typeOf(id); });
  return r.length ? r : ["fon"];
}

var KEY = "uhadni-co-pocujes-v2";
var CKEY = "uhadni-co-pocujes-cards-v1";
var $ = function(id){return document.getElementById(id);};

/* ---------- Karty (s úpravami používateľa) ---------- */
var CS = {edits:{}, custom:[]};   // úpravy a vlastné karty
var ALL = [];                      // výsledný zoznam kariet
var editingId = null;

function loadCards(){
  try{
    var raw = localStorage.getItem(CKEY);
    if(raw){ var o = JSON.parse(raw); if(o && o.edits && o.custom) CS = o; }
  }catch(e){}
}
function saveCards(){ try{ localStorage.setItem(CKEY, JSON.stringify(CS)); }catch(e){} }
var SK_RE = /[áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/;
// jazyk odpovede: "sk" = po slovensky, "orig" = v origináli
function guessLang(a, cat){
  if(ORIG_FORCE.indexOf(a)>-1) return "orig";
  if(cat==="slov") return "sk";
  if(SK_PLAIN.indexOf(a)>-1 || SK_RE.test(a)) return "sk";
  return "orig";
}
function langLabel(lg){ return lg==="sk" ? "🇸🇰 Odpoveď po slovensky" : "🌍 Odpoveď v origináli"; }

function buildAll(){
  ALL = CARDS.map(function(c,i){
    var id = "d:"+c.p, e = CS.edits[id] || {};
    return {id:id, c:c.c, p:e.p!==undefined?e.p:c.p, h:e.h!==undefined?e.h:c.h, a:e.a!==undefined?e.a:c.a, off:!!e.off, del:!!e.del, ty:normTy(e.ty!==undefined?e.ty:(c.ty||(c.t?["pre"]:["fon"]))), lg:(e.lg||c.lg||guessLang(e.a!==undefined?e.a:c.a, c.c)), custom:false};
  }).filter(function(x){return !x.del;});
  CS.custom.forEach(function(c){
    ALL.push({id:c.id, c:c.c, p:c.p, h:c.h, a:c.a, off:!!c.off, ty:normTy(c.ty||(c.t?["pre"]:["fon"])), lg:(c.lg||guessLang(c.a,c.c)), custom:true});
  });
}
function patchCard(id, patch){
  var card = ALL.filter(function(x){return x.id===id;})[0];
  if(card && card.custom){
    var cc = CS.custom.filter(function(x){return x.id===id;})[0];
    Object.keys(patch).forEach(function(k){ cc[k] = patch[k]; });
  } else {
    CS.edits[id] = CS.edits[id] || {};
    Object.keys(patch).forEach(function(k){ CS.edits[id][k] = patch[k]; });
  }
  saveCards(); buildAll();
}

/* ---------- Stav ---------- */
var settings = {mode:"teams", n:2, rounds:5, hints:true, hintTimer:false, t1:8, timer:false, t2:15, preview:true, pen:0, v:2, cats:["film","osob","znac","mies","hud","slov"], known:["film","osob","znac","mies","hud","slov"], types:["fon","pre","sla","opi","emo","rev","reb"], knownTypes:["fon","pre","sla","opi","emo","rev","reb"]};
var game = null, cfg = null;
var rankBy = "count";

var cur = null, curPlayer = 1, phase = "back", phaseStart = 0, ticker = null;
// čas hádania: runAcc = odbehnuté ms pri fráze, segStart = začiatok bežiaceho úseku, penMs = tresty
var runAcc = 0, segStart = 0, penMs = 0;
var pendingTime = 0, recIdx = -1;
// pauza (obrazovka Skóre, zamknutý telefón, iná aplikácia)
var paused = false, pausedAt = 0;
// tlačidlá a karta nereagujú hneď po zmene fázy (proti omylom pri dvojťuknutí)
var TAP_GUARD_MS = 400;
function tooSoon(){ return performance.now() - phaseStart < TAP_GUARD_MS; }

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify({settings:settings, game:game})); }catch(e){}
}
function load(){
  try{ var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}

/* ---------- Pomocné ---------- */
function fmt(t){ return t.toFixed(1).replace(".", ",") + " s"; }
// pevná paleta: navzájom odlíšiteľné farby s dobrým kontrastom k bielemu číslu
var PALETTE = ["#4b3fd1","#c62828","#1b7a43","#b35300","#8e24aa","#0b6e99","#ad1457","#6d4c41","#00796b","#455a64","#1a237e","#5f6b00"];
function pcol(i){ return PALETTE[(i-1) % PALETTE.length]; }
function noun(){ return cfg.mode==="teams" ? "tím" : "hráč"; }
function who(i){ return (cfg.mode==="teams" ? "Tím " : "Hráč ") + i; }
function readerOf(g){ return (g % cfg.n) + 1; }
function totalTurns(){ return cfg.rounds ? cfg.rounds * cfg.n : 0; }
function isLastTurn(){ var t = totalTurns(); return t>0 && game.results.length >= t; }
function shuffle(a){
  for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}
function newDeck(c){
  var idx=[];
  ALL.forEach(function(card,i){ var wt = c.types || TYPES.map(function(t){return t.id;});
    var typeOk = card.ty.some(function(t){ return wt.indexOf(t)>-1; });
    if(!card.off && typeOk && c.cats.indexOf(card.c)>-1) idx.push(i); });
  return shuffle(idx);
}
function show(id){
  ["setup","cards","game","results"].forEach(function(s){ $(s).classList.toggle("hidden", s!==id); });
  window.scrollTo(0,0);
  if(id==="game" || id==="results") keepAwake(); else letSleep();
}

/* ---------- Obrazovka nezhasne počas hry ---------- */
var wakeLock = null;
function keepAwake(){
  try{
    if(!("wakeLock" in navigator) || wakeLock || document.visibilityState!=="visible") return;
    navigator.wakeLock.request("screen").then(function(l){
      wakeLock = l; l.addEventListener("release", function(){ wakeLock = null; });
    }).catch(function(){});
  }catch(e){}
}
function letSleep(){ try{ if(wakeLock) wakeLock.release(); }catch(e){} wakeLock = null; }

/* ---------- Zvuk a vibrácia pri vypršaní času ---------- */
var audioCtx = null;
function unlockAudio(){
  try{
    if(!audioCtx){ var AC = window.AudioContext || window.webkitAudioContext; if(AC) audioCtx = new AC(); }
    if(audioCtx && audioCtx.state==="suspended") audioCtx.resume();
  }catch(e){}
}
function timeUpSignal(){
  try{ if(navigator.vibrate) navigator.vibrate([200,80,200]); }catch(e){}
  try{
    if(!audioCtx) return;
    var t = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "square"; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(440, t+0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t+0.02); g.gain.exponentialRampToValueAtTime(0.0001, t+0.45);
    o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t+0.5);
  }catch(e){}
}

/* ---------- Pauza ---------- */
function pauseClock(){
  if(paused || !game) return;
  paused = true; pausedAt = performance.now();
  clearInterval(ticker);
  if(phase==="phon") runAcc += pausedAt - segStart;
}
function resumeClock(){
  if(!paused) return;
  paused = false;
  var now = performance.now();
  if(phase==="phon") segStart = now;
  else if(phase==="hint") phaseStart += now - pausedAt;
  if(phase==="phon" || phase==="hint"){ clearInterval(ticker); ticker = setInterval(tick, 100); }
}
document.addEventListener("visibilitychange", function(){
  var inGame = !$("game").classList.contains("hidden");
  if(document.visibilityState==="hidden"){ if(inGame) pauseClock(); }
  else {
    if(inGame) resumeClock();
    if(inGame || !$("results").classList.contains("hidden")) keepAwake();
  }
});
function enabledCount(){ return ALL.filter(function(c){return !c.off;}).length; }

/* ---------- Nastavenia ---------- */
function setSeg(id, attr, value){
  document.querySelectorAll("#"+id+" button").forEach(function(b){
    var on = b.getAttribute(attr)===value;
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false");
  });
}
function moreSummary(){
  var parts = [];
  parts.push(settings.timer ? settings.t2 + " s na kartu" : "bez časomiery");
  parts.push(settings.pen ? "trest " + settings.pen + " s" : "bez trestu");
  parts.push(settings.hints ? "s nápovedou" : "bez nápovedy");
  var n = ALL.filter(function(c){
    return !c.off && settings.cats.indexOf(c.c)>-1 && c.ty.some(function(t){ return settings.types.indexOf(t)>-1; });
  }).length;
  parts.push(n + " kariet");
  return parts.join(" · ");
}
function renderSetup(){
  setSeg("modeSeg","data-mode",settings.mode);
  setSeg("hintsSeg","data-v",settings.hints?"1":"0");
  setSeg("hintSeg","data-v",settings.hintTimer?"1":"0");
  setSeg("timerSeg","data-v",settings.timer?"1":"0");
  setSeg("prevSeg","data-v",settings.preview?"1":"0");
  $("hintTimerRow").classList.toggle("hidden", !settings.hints);
  $("t1row").classList.toggle("hidden", !(settings.hints && settings.hintTimer));
  $("t2row").classList.toggle("hidden", !settings.timer);
  $("countLbl").textContent = settings.mode==="teams" ? "Počet tímov" : "Počet hráčov";
  $("roundsHelp").textContent = settings.rounds
    ? "V každom kole háda každý " + (settings.mode==="teams" ? "tím" : "hráč") + " raz"
    : "Bez limitu, hrá sa, kým neukončíte";
  document.querySelectorAll(".step").forEach(function(s){
    var k = s.getAttribute("data-key");
    s.querySelector("output").textContent = (k==="rounds" && !settings.rounds) ? "∞" : settings[k];
  });
  var box = $("catChips"); box.innerHTML = "";
  CATS.forEach(function(c){
    var b = document.createElement("button");
    b.type="button"; b.className = "chip" + (settings.cats.indexOf(c.id)>-1 ? " on":"");
    b.setAttribute("aria-pressed", settings.cats.indexOf(c.id)>-1 ? "true" : "false");
    b.textContent = c.name;
    b.onclick = function(){
      var i = settings.cats.indexOf(c.id);
      if(i>-1){ if(settings.cats.length>1) settings.cats.splice(i,1); }
      else settings.cats.push(c.id);
      renderSetup();
    };
    box.appendChild(b);
  });
  var tbox = $("typeChips"); tbox.innerHTML = "";
  TYPES.forEach(function(t){
    var b = document.createElement("button");
    b.type="button"; b.className = "chip" + (settings.types.indexOf(t.id)>-1 ? " on":"");
    b.setAttribute("aria-pressed", settings.types.indexOf(t.id)>-1 ? "true" : "false");
    var n = ALL.filter(function(c){ return !c.off && c.ty.indexOf(t.id)>-1; }).length;
    b.textContent = t.icon + " " + t.name + " (" + n + ")";
    b.onclick = function(){
      var i = settings.types.indexOf(t.id);
      if(i>-1){ if(settings.types.length>1) settings.types.splice(i,1); }
      else settings.types.push(t.id);
      renderSetup();
    };
    tbox.appendChild(b);
  });
  $("cardsBtn").textContent = "Prehľad kariet (" + enabledCount() + " zapnutých)";
  $("moreSum").textContent = moreSummary();
  $("startMsg").textContent = "";
  $("resumeBtn").classList.toggle("hidden", !(game && game.cfg && game.round>0 && !game.over));
  save(); // nastavenia sa pamätajú hneď, nielen po štarte hry
}

document.querySelectorAll("#modeSeg button").forEach(function(b){
  b.onclick = function(){ settings.mode = b.getAttribute("data-mode"); renderSetup(); };
});
document.querySelectorAll("#hintsSeg button").forEach(function(b){
  b.onclick = function(){ settings.hints = b.getAttribute("data-v")==="1"; renderSetup(); };
});
document.querySelectorAll("#hintSeg button").forEach(function(b){
  b.onclick = function(){ settings.hintTimer = b.getAttribute("data-v")==="1"; renderSetup(); };
});
document.querySelectorAll("#timerSeg button").forEach(function(b){
  b.onclick = function(){ settings.timer = b.getAttribute("data-v")==="1"; renderSetup(); };
});
document.querySelectorAll("#prevSeg button").forEach(function(b){
  b.onclick = function(){ settings.preview = b.getAttribute("data-v")==="1"; renderSetup(); };
});
document.querySelectorAll(".step button").forEach(function(b){
  b.onclick = function(){
    var s = b.parentNode, k = s.getAttribute("data-key");
    var v = settings[k] + parseInt(b.getAttribute("data-d"),10)*parseInt(s.getAttribute("data-inc"),10);
    v = Math.max(parseInt(s.getAttribute("data-min"),10), Math.min(parseInt(s.getAttribute("data-max"),10), v));
    settings[k] = v; renderSetup();
  };
});

$("startBtn").onclick = function(){
  var c = JSON.parse(JSON.stringify(settings));
  var deck = newDeck(c);
  if(!deck.length){ $("startMsg").textContent = "Zapni aspoň jednu kartu vo zvolených kategóriách a typoch."; return; }
  game = {cfg:c, deck:deck, pos:0, round:0, turn:1, results:[], over:false};
  cfg = game.cfg; cur = null;
  save(); show("game"); nextCard(false);
};
$("resumeBtn").onclick = function(){
  cfg = game.cfg;
  if(cfg.hints===undefined) cfg.hints = true;
  if(cfg.timer===undefined) cfg.timer = true;
  cur = null;
  show("game"); nextCard(false);
};

/* ---------- Prehľad kariet ---------- */
function renderCards(){
  $("cardsLead").textContent = "Zapnutých " + enabledCount() + " z " + ALL.length + ". Vypnuté karty sa v hre neukážu.";
  var nd = deletedCount();
  $("restoreBtn").classList.toggle("hidden", nd===0);
  $("restoreBtn").textContent = "Obnoviť odstránené karty (" + nd + ")";
  var box = $("cardList"); box.innerHTML = "";
  CATS.forEach(function(cat){
    var items = ALL.filter(function(c){return c.c===cat.id;});
    if(!items.length) return;
    var h = document.createElement("div"); h.className="cat-h"; h.textContent = cat.name + " (" + items.length + ")";
    box.appendChild(h);
    items.forEach(function(card){ box.appendChild(cardRow(card)); });
  });
  if(editingId==="new"){ box.insertBefore(editForm(null), box.firstChild); }
}

function deletedCount(){ return Object.keys(CS.edits).filter(function(k){ return CS.edits[k].del; }).length; }
function removeCard(card){
  if(card.custom){ CS.custom = CS.custom.filter(function(x){return x.id!==card.id;}); saveCards(); buildAll(); }
  else patchCard(card.id,{del:true});
}

function cardRow(card){
  var row = document.createElement("div");
  row.className = "crow" + (card.off ? " off" : "");
  if(editingId===card.id){ row.appendChild(editForm(card)); return row; }
  var cb = document.createElement("input"); cb.type="checkbox"; cb.checked = !card.off;
  cb.setAttribute("aria-label","Zapnúť kartu " + card.p);
  cb.onchange = function(){ patchCard(card.id,{off:!cb.checked}); renderCards(); };
  var t = document.createElement("div"); t.className="txt";
  var b = document.createElement("b"); b.textContent = card.p;
  // odpoveď je rozmazaná, kým na ňu neťukneš (nech ju nevidí niekto cez plece)
  var an = document.createElement("span"); an.className="ans spoiler";
  an.setAttribute("role","button"); an.tabIndex = 0;
  an.setAttribute("aria-label","Ukázať odpoveď");
  var aa = document.createElement("span"); aa.className = "a"; aa.textContent = card.a;
  an.appendChild(aa);
  an.appendChild(document.createTextNode("  " + card.ty.map(function(id){ return typeOf(id).icon; }).join("") + " " + (card.lg==="sk" ? "🇸🇰" : "🌍")));
  var reveal = function(){ an.classList.toggle("spoiler"); an.setAttribute("aria-label", an.classList.contains("spoiler") ? "Ukázať odpoveď" : card.a); };
  an.onclick = reveal;
  an.onkeydown = function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); reveal(); } };
  var hh = document.createElement("small"); hh.textContent = card.h || "(bez nápovedy)";
  t.appendChild(b); t.appendChild(an); t.appendChild(hh);
  var ed = document.createElement("button"); ed.type="button"; ed.className="ed"; ed.textContent="Upraviť";
  ed.onclick = function(){ editingId = card.id; renderCards(); };
  row.appendChild(cb); row.appendChild(t); row.appendChild(ed);
  return row;
}

function field(label, value){
  var l = document.createElement("label"); l.textContent = label;
  var i = document.createElement("input"); i.type="text"; i.value = value || "";
  l.appendChild(i); return {el:l, input:i};
}

function editForm(card){
  var isNew = !card;
  var wrap = document.createElement("div");
  if(isNew) wrap.className = "crow";
  var f = document.createElement("div"); f.className = "eform";
  var fp = field("Fráza na čítanie", card ? card.p : "");
  var fh = field("Nápoveda (čo to znamená)", card ? card.h : "");
  var fa = field("Správna odpoveď", card ? card.a : "");
  f.appendChild(fp.el); f.appendChild(fh.el); f.appendChild(fa.el);
  var tw = document.createElement("div");
  tw.style.cssText = "display:grid;gap:6px";
  var tlab = document.createElement("div"); tlab.style.cssText = "font-size:13px;color:var(--muted)"; tlab.textContent = "Typ karty";
  tw.appendChild(tlab);
  var tcs = [];
  TYPES.forEach(function(t){
    var l = document.createElement("label"); l.className = "tyc";
    l.style.cssText = "display:flex;align-items:center;gap:10px;flex-direction:row;color:var(--fg);font-size:15px";
    var cb = document.createElement("input"); cb.type = "checkbox";
    cb.checked = card ? card.ty.indexOf(t.id)>-1 : t.id==="fon";
    tcs.push({id:t.id, cb:cb});
    l.appendChild(cb); l.appendChild(document.createTextNode(t.icon + " " + t.name));
    tw.appendChild(l);
  });
  f.appendChild(tw);
  var ll = document.createElement("label"); ll.textContent = "Jazyk odpovede";
  var ls = document.createElement("select");
  [["sk","🇸🇰 Po slovensky"],["orig","🌍 V origináli"]].forEach(function(o){
    var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; ls.appendChild(op);
  });
  ls.value = card ? card.lg : "orig";
  ll.appendChild(ls); f.appendChild(ll);
  var pickedTypes = function(){
    var r = tcs.filter(function(x){return x.cb.checked;}).map(function(x){return x.id;});
    return r.length ? r : ["fon"];
  };
  var sel = null;
  if(isNew){
    var l = document.createElement("label"); l.textContent = "Kategória";
    sel = document.createElement("select");
    CATS.forEach(function(c){ var o=document.createElement("option"); o.value=c.id; o.textContent=c.name; sel.appendChild(o); });
    l.appendChild(sel); f.appendChild(l);
  }
  var pr = document.createElement("div"); pr.className = "pair";
  var sv = document.createElement("button"); sv.type="button"; sv.className="save"; sv.textContent="Uložiť";
  var cn = document.createElement("button"); cn.type="button"; cn.className="cancel"; cn.textContent="Zrušiť";
  sv.onclick = function(){
    var p = fp.input.value.trim(), h = fh.input.value.trim(), a = fa.input.value.trim();
    if(!p || !a){ fp.input.focus(); return; }
    if(isNew){
      CS.custom.push({id:"u"+Date.now(), c:sel.value, p:p, h:h, a:a, ty:pickedTypes(), lg:ls.value, off:false});
      saveCards(); buildAll();
    } else {
      patchCard(card.id,{p:p,h:h,a:a,ty:pickedTypes(),lg:ls.value});
    }
    editingId = null; renderCards();
  };
  cn.onclick = function(){ editingId = null; renderCards(); };
  pr.appendChild(sv); pr.appendChild(cn); f.appendChild(pr);
  if(!isNew){
    var dl = document.createElement("button"); dl.type="button"; dl.className="btn ghost small";
    dl.style.color = "var(--bad)"; dl.textContent = "Odstrániť kartu";
    var armed = false;
    dl.onclick = function(){
      if(!armed){ armed = true; dl.textContent = "Naozaj odstrániť? Ťukni znova"; return; }
      removeCard(card); editingId = null; renderCards();
    };
    f.appendChild(dl);
  }
  wrap.appendChild(f);
  return isNew ? wrap : f;
}

$("cardsBtn").onclick = function(){ editingId = null; renderCards(); show("cards"); };
$("cardsBack").onclick = function(){ editingId = null; show("setup"); renderSetup(); };
$("allOn").onclick = function(){
  ALL.forEach(function(c){ if(c.off) patchCard(c.id,{off:false}); });
  renderCards();
};
$("addCard").onclick = function(){ editingId = "new"; renderCards(); window.scrollTo(0,0); };
$("restoreBtn").onclick = function(){
  Object.keys(CS.edits).forEach(function(k){ if(CS.edits[k].del) delete CS.edits[k].del; });
  saveCards(); buildAll(); renderCards();
};

/* ---------- Hra ---------- */
function nextCard(advance){
  clearInterval(ticker);
  var toast = "";
  if(advance) game.turn = (game.turn % cfg.n) + 1;
  cur = null;
  if(game.pos < game.deck.length) cur = ALL[game.deck[game.pos]];
  if(!cur){
    game.deck = newDeck(cfg); game.pos = 0;
    if(!game.deck.length){ game.deck = ALL.map(function(c,i){return i;}); }
    cur = ALL[game.deck[0]];
    toast = "Všetky karty prešli, miešam znova.";
  }
  curPlayer = game.turn;
  game.pos++; game.round++;
  phase = "back"; recIdx = -1; pendingTime = 0; runAcc = 0; segStart = 0; penMs = 0; paused = false;
  // kolo = každý tím/hráč raz hádal; počíta sa podľa zapísaných pokusov (preskočené karty sa nerátajú)
  var k = Math.floor(game.results.length / cfg.n) + 1;
  $("roundCount").textContent = cfg.rounds ? "Kolo " + Math.min(k, cfg.rounds) + " z " + cfg.rounds : "Kolo " + k;
  $("toast").textContent = toast;
  save();
  renderTurn();
  setPhase(cfg.preview!==false ? "prep" : "back", true);
  renderBoard();
}

function renderTurn(){
  var g = game.turn, r = readerOf(g);
  $("turnDot").textContent = g; $("turnDot").style.background = pcol(g);
  $("turnLab").textContent = who(g);
  $("readDot").textContent = r; $("readDot").style.background = pcol(r);
  $("readLab").textContent = who(r);
}

function showPeek(on){
  if(on && cur){ $("peekText").textContent = cur.a; }
  $("peek").classList.toggle("on", !!on);
}

function effTypes(c){
  var wt = (cfg && cfg.types) ? cfg.types : TYPES.map(function(t){return t.id;});
  var r = c.ty.filter(function(t){ return wt.indexOf(t)>-1; });
  return r.length ? r : c.ty;
}
function tagPhon(c){ var e = effTypes(c); return e.length>1 ? TYPE_MIX_TAG : typeOf(e[0]).tag; }
function tagHint(c){ var e = effTypes(c); return e.length>1 ? "Čo to znamená" : typeOf(e[0]).hintTag; }

function hasHint(){ return cfg.hints && cur && cur.h; }

function applyPhase(p){
  var card = $("card");
  card.className = "card c-" + p;
  showPeek(false);
  var main = $("main"), tag = $("tag"), sub = $("sub"), tm = $("tm");
  var cc = cur ? CATS.filter(function(c){ return c.id===cur.c; })[0] : null;
  $("cat").textContent = cc ? cc.name : "";
  $("typ").textContent = cur ? effTypes(cur).map(function(id){ var t = typeOf(id); return t.icon + " " + t.name; }).join(" / ") : "";
  $("lng").textContent = cur ? langLabel(cur.lg) : "";
  main.className = "main"; sub.textContent = ""; tm.style.visibility = "hidden";
  var g = game ? game.turn : 1, r = cfg ? readerOf(g) : 2;
  if(p==="back"){
    tag.textContent = "Podaj telefón: číta " + who(r);
    main.textContent = "?"; main.classList.add("q");
    sub.textContent = "Háda " + who(g) + ". Ťukni na kartu a otoč ju.";
  } else if(p==="prep"){
    tag.textContent = "Len pre čitateľa";
    main.textContent = "Podaj telefón: číta " + who(r); main.classList.add("long");
    sub.textContent = "Háda " + who(g) + ". Podrž tlačidlo s odpoveďou, potom stlač Štart.";
  } else if(p==="judge"){
    tag.textContent = "Čas zastavený";
    main.textContent = fmt((runAcc + penMs)/1000);
    // fráza (a nápoveda) ostáva na očiach, aby sa dalo hádať ďalej
    sub.textContent = "„" + cur.p + "“" + (hasHint() ? " · 💡 " + cur.h : "") + "\nOver odpoveď: podrž tlačidlo dole";
  } else if(p==="hint"){
    tag.textContent = tagHint(cur) + " · prečítaj nahlas";
    main.textContent = cur.h; main.classList.add("long");
    if(cfg.hintTimer) tm.style.visibility = "visible";
    else sub.textContent = "Ťukni na kartu pre frázu";
  } else if(p==="phon"){
    tag.textContent = tagPhon(cur);
    main.textContent = cur.p;
    if(cur.p.length>34) main.classList.add("long");
    if(hasHint()) sub.textContent = "💡 " + cur.h; // nápoveda ostáva viditeľná aj počas hádania
    if(cfg.timer) tm.style.visibility = "visible";
  } else if(p==="red"){
    tag.textContent = "Neuhádnuté. Malo sa uhádnuť:";
    main.textContent = cur.a;
    sub.textContent = "„" + cur.p + "“";
  } else if(p==="green"){
    tag.textContent = "Správne! ✓";
    main.textContent = cur.a;
    sub.textContent = who(curPlayer) + " · ⏱ " + fmt(pendingTime) + (penMs>0 ? " (z toho trest " + fmt(penMs/1000) + ")" : "");
  }
}

function setPhase(p, animate){
  phase = p; phaseStart = performance.now();
  if(p==="phon") segStart = performance.now(); // čas beží len pri zobrazenej fráze
  var card = $("card");
  if(animate){
    card.classList.add("flipping");
    setTimeout(function(){
      applyPhase(p);
      if(p==="hint") updateTimer(cfg.t1, cfg.t1);
      else updateTimer(cfg.t2 - runAcc/1000, cfg.t2);
    }, 180);
  } else {
    applyPhase(p);
  }
  renderActions();
}

function updateTimer(rem, total){
  $("num").textContent = Math.max(0, Math.ceil(rem));
  $("bar").style.width = Math.max(0, Math.min(100, rem/total*100)) + "%";
}

function markMiss(){
  game.results.push({p:curPlayer, time:null, card:cur.a});
  recIdx = game.results.length-1;
  save(); renderBoard();
}

function tick(){
  var now = performance.now();
  if(phase==="hint"){
    if(cfg.hintTimer){
      var rem = cfg.t1 - (now-phaseStart)/1000;
      if(rem<=0) setPhase("phon", true); else updateTimer(rem, cfg.t1);
    }
  } else if(phase==="phon"){
    if(cfg.timer){
      var rem2 = cfg.t2 - (runAcc + (now-segStart))/1000;
      if(rem2<=0){ runAcc = cfg.t2*1000; clearInterval(ticker); markMiss(); setPhase("red", true); timeUpSignal(); }
      else updateTimer(rem2, cfg.t2);
    }
  }
}

function startRound(){
  unlockAudio(); // zvuk musí odomknúť ťuknutie používateľa
  setPhase(hasHint() ? "hint" : "phon", true);
  clearInterval(ticker);
  ticker = setInterval(tick, 100);
}
function onCard(){
  if(tooSoon()) return;
  if(phase==="back"){
    if(cfg.preview!==false) setPhase("prep", true);
    else startRound();
  } else if(phase==="hint"){
    setPhase("phon", true);
  }
}
$("card").onclick = onCard;
$("card").onkeydown = function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); onCard(); } };

function stopRun(){ runAcc += performance.now() - segStart; }

// niekto má tip: čas sa zastaví a fráza sa skryje
function stopTip(){
  if(phase!=="phon") return;
  stopRun(); clearInterval(ticker);
  setPhase("judge", true);
}
// zlý tip, háda sa ďalej: pripočíta sa trest a čas beží od miesta, kde zastal
function wrongContinue(){
  if(phase!=="judge") return;
  penMs += (cfg.pen || 0)*1000;
  setPhase("phon", true);
  clearInterval(ticker);
  ticker = setInterval(tick, 100);
}

function guessed(){
  if(phase!=="judge" && phase!=="red") return;
  pendingTime = (runAcc + penMs)/1000;
  clearInterval(ticker);
  var rec = {p:curPlayer, time:pendingTime, card:cur.a};
  if(recIdx>-1) game.results[recIdx] = rec;
  else { game.results.push(rec); recIdx = game.results.length-1; }
  save();
  setPhase("green", true);
  renderBoard();
}

function giveUp(){
  if(phase!=="phon" && phase!=="judge") return;
  if(phase==="phon") stopRun();
  clearInterval(ticker);
  markMiss(); setPhase("red", true);
}
function skipCard(){ clearInterval(ticker); nextCard(false); }
function doneCard(){
  if(isLastTurn()){
    clearInterval(ticker);
    game.over = true; save();
    openResults();
    return;
  }
  nextCard(true);
}

function btn(cls, text, fn){
  var b = document.createElement("button");
  b.type="button"; b.className = "btn " + cls; b.textContent = text;
  b.onclick = function(e){ if(tooSoon()) return; fn(e); };
  return b;
}

// tlačidlo: kým je podržané, ukáže správnu odpoveď
function holdBtn(){
  var b = document.createElement("button");
  b.type = "button"; b.className = "btn ghost hold";
  b.textContent = "👁 Podrž pre odpoveď";
  var on = function(e){
    if(e && e.preventDefault) e.preventDefault();
    try{ if(e && e.pointerId!==undefined) b.setPointerCapture(e.pointerId); }catch(x){}
    b.classList.add("down"); showPeek(true);
  };
  var off = function(){ b.classList.remove("down"); showPeek(false); };
  b.addEventListener("pointerdown", on);
  ["pointerup","pointercancel","lostpointercapture","pointerleave","blur"].forEach(function(ev){
    b.addEventListener(ev, off);
  });
  b.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  b.addEventListener("keydown", function(e){ if((e.key===" "||e.key==="Enter") && !e.repeat){ on(e); } });
  b.addEventListener("keyup", off);
  return b;
}

function pair(a, b){
  var d = document.createElement("div"); d.className = "pair";
  d.appendChild(a); d.appendChild(b); return d;
}

function renderActions(){
  var box = $("actions"); box.innerHTML = "";
  if(phase==="back"){
    var p = document.createElement("p"); p.className="hintline";
    p.textContent = "Čas beží, len keď je vidieť frázu.";
    box.appendChild(p);
    box.appendChild(btn("ghost small","Preskočiť kartu", skipCard));
  } else if(phase==="prep"){
    box.appendChild(holdBtn());
    box.appendChild(btn("primary","Štart", startRound));
    box.appendChild(btn("ghost small","Preskočiť kartu", skipCard));
  } else if(phase==="hint"){
    // po štarte sa už preskočiť nedá, len vzdať (zapíše sa ako neuhádnuté)
    box.appendChild(btn("primary","Ukázať frázu", function(){ setPhase("phon", true); }));
  } else if(phase==="phon"){
    box.appendChild(btn("primary","✋ Stop, mám tip", stopTip));
    box.appendChild(btn("ghost small","Vzdávame sa", giveUp));
  } else if(phase==="judge"){
    box.appendChild(holdBtn());
    box.appendChild(btn("ok","✓ Správne", guessed));
    var pen = cfg.pen || 0;
    box.appendChild(pair(
      btn("ghost small","✗ Zle, hádajte ďalej" + (pen>0 ? " (+" + pen + " s)" : ""), wrongContinue),
      btn("ghost small","✗ Zle, vzdávame sa", giveUp)));
  } else if(phase==="red"){
    box.appendChild(btn("primary", isLastTurn() ? "Výsledky hry" : "Ďalšia karta", doneCard));
    box.appendChild(btn("ghost small","✓ Predsa len uhádli", guessed));
  } else if(phase==="green"){
    box.appendChild(btn("primary", isLastTurn() ? "Výsledky hry" : "Ďalšia karta", doneCard));
  }
}

/* ---------- Štatistiky ---------- */
function stats(){
  var out = [];
  for(var i=1;i<=cfg.n;i++){
    var all = game.results.filter(function(r){return r.p===i;});
    var t = all.filter(function(r){return r.time!==null;}).map(function(r){return r.time;});
    var sum = t.reduce(function(a,b){return a+b;},0);
    out.push({p:i, tries:all.length, count:t.length, best:t.length?Math.min.apply(null,t):null, avg:t.length?sum/t.length:null});
  }
  return out;
}

function renderBoard(){
  var box = $("board"); box.innerHTML = "";
  stats().forEach(function(s){
    var d = document.createElement("div"); d.className = "pc" + (s.p===game.turn ? " now" : "");
    d.innerHTML = '<div class="dot" style="background:' + pcol(s.p) + '">' + s.p + '</div>' +
      (s.tries ? '<span>✓ ' + s.count + ' z ' + s.tries + '</span><span>' + (s.avg===null ? "–" : "⌀ " + fmt(s.avg)) + '</span>'
               : '<span>zatiaľ</span><span>nehádal</span>');
    d.setAttribute("aria-label", who(s.p) + ": uhádnuté " + s.count + " z " + s.tries);
    box.appendChild(d);
  });
}

/* ---------- Výsledky ---------- */
function renderResults(){
  clearInterval(ticker);
  var st = stats();
  var tries = game.results.length;
  var ok = game.results.filter(function(r){return r.time!==null;}).length;
  // víťaz: najviac uhádnutých, pri zhode lepší priemerný čas
  var byCount = function(a,b){
    if(b.count!==a.count) return b.count-a.count;
    if(a.avg===null && b.avg===null) return a.p-b.p;
    if(a.avg===null) return 1; if(b.avg===null) return -1;
    return a.avg-b.avg;
  };
  var lead = tries ? "Uhádnuté karty: " + ok + " z " + tries + "." : "Zatiaľ nikto nehádal. Vráť sa do hry.";
  if(game.over && ok){
    var top = st.slice().sort(byCount);
    var wins = top.filter(function(s){ return s.count===top[0].count && s.avg===top[0].avg; });
    lead = (wins.length>1 ? "🤝 Remíza: " + wins.map(function(s){ return who(s.p); }).join(" a ")
                           : "🏆 Vyhráva " + who(top[0].p)) + ". " + lead;
  }
  $("resTitle").textContent = game.over ? "Koniec hry" : "Skóre";
  $("resLead").textContent = lead;
  $("backBtn").classList.toggle("hidden", !!game.over);
  $("newBtn").className = "btn " + (game.over ? "primary" : "ghost");
  st.sort(function(a,b){
    if(rankBy==="best"){
      if(a.best===null && b.best===null) return a.p-b.p;
      if(a.best===null) return 1; if(b.best===null) return -1;
      return a.best-b.best || b.count-a.count;
    }
    return byCount(a,b);
  });
  var medals = ["🥇","🥈","🥉"];
  var list = $("rankList"); list.innerHTML = "";
  st.forEach(function(s,i){
    var r = document.createElement("div"); r.className="rank";
    var has = s.count>0;
    var big = rankBy==="best" ? (has?fmt(s.best):"–") : ("✓ " + s.count);
    var small = !s.tries ? "zatiaľ nehádal" :
      ("uhádnuté " + s.count + " z " + s.tries + (has ? ", priemer " + fmt(s.avg) + ", najlepší " + fmt(s.best) : ""));
    r.innerHTML = '<div class="pos">' + (has && i<3 ? medals[i] : (i+1)+".") + '</div>' +
      '<div class="dot" style="background:' + pcol(s.p) + '">' + s.p + '</div>' +
      '<div class="info"><b>' + who(s.p) + '</b><span>' + small + '</span></div>' +
      '<div class="big">' + big + '</div>';
    list.appendChild(r);
  });
  var log = $("log"); log.innerHTML = "";
  if(!game.results.length){ log.innerHTML = '<div class="empty">Zatiaľ žiadne karty.</div>'; }
  game.results.slice().reverse().forEach(function(r){
    var d = document.createElement("div");
    var a = document.createElement("span"); a.textContent = r.card;
    var b = document.createElement("em"); b.textContent = who(r.p) + " · " + (r.time===null ? "neuhádnuté" : fmt(r.time));
    d.appendChild(a); d.appendChild(b); log.appendChild(d);
  });
  setSeg("rankSeg","data-r",rankBy);
}
document.querySelectorAll("#rankSeg button").forEach(function(b){
  b.onclick = function(){ rankBy = b.getAttribute("data-r"); renderResults(); };
});

function openResults(){ if(!game) return; pauseClock(); showPeek(false); renderResults(); show("results"); }
$("scoreBtn").onclick = openResults;
$("backBtn").onclick = function(){
  show("game");
  resumeClock();
};
$("newBtn").onclick = function(){ clearInterval(ticker); paused = false; show("setup"); renderSetup(); };

/* ---------- Tip na inštaláciu (iPhone/iPad v Safari) ---------- */
(function(){
  var TIP_KEY = "mam-to-na-jazyku-install-tip";
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
  var standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  var dismissed = false;
  try{ dismissed = localStorage.getItem(TIP_KEY)==="1"; }catch(e){}
  if(ios && !standalone && !dismissed) $("installTip").classList.remove("hidden");
  $("tipClose").onclick = function(){
    $("installTip").classList.add("hidden");
    try{ localStorage.setItem(TIP_KEY, "1"); }catch(e){}
  };
})();

/* ---------- Štart ---------- */
loadCards();
buildAll();
var saved = load();
if(saved && saved.settings){
  var s = saved.settings;
  settings.mode = s.mode==="solo" ? "solo" : "teams";
  settings.n = s.n || 2; settings.t1 = s.t1 || 8; settings.t2 = s.t2 || 15;
  settings.rounds = (typeof s.rounds==="number") ? s.rounds : 5;
  settings.hintTimer = !!s.hintTimer;
  settings.hints = s.hints!==false;
  // v2: predvolene bez časomiery a bez trestu; staršie uložené nastavenia sa na to raz prepnú
  var old = !s.v || s.v < 2;
  settings.timer = old ? false : s.timer!==false;
  settings.preview = s.preview!==false;
  settings.pen = old ? 0 : ((typeof s.pen==="number") ? s.pen : 0);
  settings.cats = (s.cats && s.cats.length) ? s.cats : settings.cats;
  var known = s.known || ["film","osob","znac"];
  if(s.seenHud) known = known.concat(["hud"]);
  CATS.forEach(function(c){ if(known.indexOf(c.id)<0 && settings.cats.indexOf(c.id)<0) settings.cats.push(c.id); });
  settings.known = CATS.map(function(c){return c.id;});
  var kt = s.knownTypes || [];
  settings.types = (s.types && s.types.length) ? s.types.slice() : [];
  TYPES.forEach(function(t){ if(kt.indexOf(t.id)<0 && settings.types.indexOf(t.id)<0) settings.types.push(t.id); });
  settings.types = settings.types.filter(function(id){ return !!typeOf(id); });
  if(!settings.types.length) settings.types = TYPES.map(function(t){return t.id;});
  settings.knownTypes = TYPES.map(function(t){return t.id;});
  if(saved.game && saved.game.deck && saved.game.cfg){ game = saved.game; if(!game.turn) game.turn = 1; }
}
renderSetup();
})();
