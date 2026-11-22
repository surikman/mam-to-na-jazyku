// Service worker: hra funguje aj offline.
// Vlastné súbory: najprv sieť (s limitom), pri výpadku cache -> online vždy čerstvá verzia, bez ručného bumpovania.
// Google Fonts: najprv cache.
// Sieťové požiadavky idú s cache:"no-cache", aby HTTP cache prehliadača (GitHub Pages: max-age=600)
// nevrátila starý JS k novému HTML.
// CACHE zvýš len pri zmene zoznamu ASSETS (pridaný/odstránený súbor).
var CACHE = "mtnj-v2";
var ASSETS = [
  "./",
  "index.html",
  "css/styles.css",
  "js/config.js",
  "js/cards/phonetic.js",
  "js/cards/translations.js",
  "js/cards/slang.js",
  "js/cards/descriptions.js",
  "js/cards/emoji.js",
  "js/cards/reversed.js",
  "js/cards/rebus.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png"
];
var NET_TIMEOUT = 3000;

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS.map(function(u){ return new Request(u, {cache:"no-cache"}); })); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf("mtnj-")===0 && k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function networkFirst(req){
  return caches.open(CACHE).then(function(cache){
    var net = fetch(req.url, {cache:"no-cache", credentials:"same-origin"}).then(function(res){
      if(res && res.ok) cache.put(req, res.clone());
      return res;
    });
    var fallback = function(){
      return cache.match(req, {ignoreSearch:true}).then(function(hit){
        if(hit) return hit;
        if(req.mode==="navigate") return cache.match("index.html");
        return net;
      });
    };
    var timer = new Promise(function(resolve){ setTimeout(resolve, NET_TIMEOUT); }).then(fallback);
    return Promise.race([net.catch(fallback), timer]).then(function(res){ return res || net; });
  });
}

function cacheFirst(req){
  return caches.open(CACHE).then(function(cache){
    return cache.match(req).then(function(hit){
      return hit || fetch(req).then(function(res){
        if(res && (res.ok || res.type==="opaque")) cache.put(req, res.clone());
        return res;
      });
    });
  });
}

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method!=="GET") return;
  var url = new URL(req.url);
  if(url.origin===self.location.origin) e.respondWith(networkFirst(req));
  else if(url.hostname==="fonts.googleapis.com" || url.hostname==="fonts.gstatic.com") e.respondWith(cacheFirst(req));
});
