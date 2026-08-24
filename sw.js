// 오프라인 캐시 (F-12). index.html 하나만 캐시해서, 통신이 끊겨도 앱이 열리고
// 입력·저장(localStorage)이 되게 한다. 버전을 올리면 새 캐시로 교체되고 예전 캐시는 지운다.
const CACHE_NAME = "golf-recording-v1";
const ASSETS = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패하면 캐시. 성공한 응답은 캐시를 최신으로 갱신해둔다.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
