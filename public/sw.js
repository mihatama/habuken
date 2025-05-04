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
  console.log("Service Worker: インストール中")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: キャッシュを開きました")
      return cache.addAll(urlsToCache)
    }),
  )
  // 古いService Workerを待たずにアクティベート
  self.skipWaiting()
})

// Service Workerのアクティベート時（古いキャッシュの削除など）
self.addEventListener("activate", (event) => {
  console.log("Service Worker: アクティベート中")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: 古いキャッシュを削除します:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: アクティベート完了")
        // すべてのクライアントを制御
        return self.clients.claim()
      }),
  )
})

// ネットワークリクエスト時
self.addEventListener("fetch", (event) => {
  // HTMLリクエストの場合はネットワークファーストで処理
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline").then((response) => response || caches.match("/"))
      }),
    )
    return
  }

  // その他のリクエストはキャッシュファーストで処理
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
          // 画像リクエストの場合はプレースホルダー画像を返す
          if (event.request.destination === "image") {
            return caches.match("/icons/placeholder.png")
          }
        })
    }),
  )
})

// プッシュ通知の受信時
self.addEventListener("push", (event) => {
  console.log("Push通知を受信しました", event)

  let notificationData = {
    title: "現助からのお知らせ",
    body: "お知らせがあります",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: "/",
    },
  }

  try {
    if (event.data) {
      notificationData = { ...notificationData, ...event.data.json() }
    }
  } catch (e) {
    console.error("Push通知データの解析に失敗しました", e)
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: [100, 50, 100],
      data: notificationData.data,
    }),
  )
})

// 通知クリック時
self.addEventListener("notificationclick", (event) => {
  console.log("通知がクリックされました", event)

  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // すでに開いているウィンドウがあればそれをフォーカス
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus()
        }
      }
      // なければ新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url)
      }
    }),
  )
})

// バックグラウンド同期
self.addEventListener("sync", (event) => {
  console.log("バックグラウンド同期イベント:", event.tag)

  if (event.tag === "sync-reports") {
    event.waitUntil(syncReports())
  }
})

// バックグラウンド同期の実装例
async function syncReports() {
  try {
    const reportsToSync = await getReportsToSync()
    console.log("同期するレポート:", reportsToSync.length)

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
  console.log("レポートをサーバーに送信:", report.id)
}

async function markReportAsSynced(id) {
  // 同期済みとしてマークするロジック
  console.log("レポートを同期済みとしてマーク:", id)
}
