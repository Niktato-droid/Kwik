const CACHE='kwik-v0.9';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* Réseau d'abord, pour avoir toujours la dernière version. Mais si le réseau est très lent (marché, campagne),
   Kwik s'ouvre depuis le téléphone au bout de 3 secondes. Les pages en erreur ne remplacent jamais la bonne copie. */
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;
  const reseau=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r});
  const copie=()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('./index.html'):undefined));
  e.respondWith(new Promise(ok=>{let fini=false;const rendre=r=>{if(!fini&&r){fini=true;ok(r)}};
    const t=setTimeout(()=>copie().then(rendre),3000);
    reseau.then(r=>{clearTimeout(t);rendre(r)}).catch(()=>{clearTimeout(t);copie().then(r=>{rendre(r||Response.error())})})}));
  e.waitUntil(reseau.catch(()=>{}))});
