// キャッシュの名前とバージョン
const CACHE_NAME = "habuken-cache-v1"

// キャッシュするアセットのリスト
const urlsToCache = [
  "/",
  "/offline",
  "/dashboard",
  "/login",
  "/styles/main.css",
  "/scripts/main.js",
  "/icons/icon-192x192.png",
]

// Service Workerのインストール時
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("キャッシュを開きました")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Service Workerのアクティベート時（古いキャッシュの削除など）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("古いキャッシュを削除します:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// ネットワークリクエスト時
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュにヒットした場合はそれを返す
      if (response) {
        return response
      }

      // キャッシュにない場合はネットワークリクエストを行う
      return fetch(event.request)
        .then((response) => {
          // 有効なレスポンスでない場合はそのまま返す
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // ネットワークエラーの場合、オフラインページを表示
          if (event.request.mode === "navigate") {
            return caches.match("/offline")
          }
        })
    }),
  )
})

// プッシュ通知の受信時
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// 通知クリック時
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})

// バックグラウンド同期
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-reports") {
    event.waitUntil(syncReports())
  }
})

// バックグラウンド同期の実装例
async function syncReports() {
  try {
    const reportsToSync = await getReportsToSync()
    for (const report of reportsToSync) {
      await sendReportToServer(report)
      await markReportAsSynced(report.id)
    }
    return true
  } catch (error) {
    console.error("同期エラー:", error)
    return false
  }
}

// これらの関数は実際の実装に合わせて定義する必要があります
async function getReportsToSync() {
  // IndexedDBからの未同期レポート取得ロジック
  return []
}

async function sendReportToServer(report) {
  // サーバーへのレポート送信ロジック
}

async function markReportAsSynced(id) {
  // 同期済みとしてマークするロジック
}
