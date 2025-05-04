// キャッシュの名前とバージョン
const CACHE_NAME = "habuken-cache-v1"
const APP_SHELL = "app-shell-v1"

// アプリシェルとしてキャッシュするリソース
const APP_SHELL_RESOURCES = [
  "/",
  "/offline",
  "/dashboard",
  "/login",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// 動的にキャッシュするリソースのパターン
const CACHEABLE_RESOURCES = [/\.(js|css|woff2)$/, /\/api\/static\//, /\/icons\//, /\/images\//]

// インストール時にアプリシェルをキャッシュ
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] インストール中")
  event.waitUntil(
    caches.open(APP_SHELL).then((cache) => {
      console.log("[ServiceWorker] アプリシェルをキャッシュ中")
      return cache.addAll(APP_SHELL_RESOURCES)
    }),
  )
  // 古いService Workerを待たずにアクティベート
  self.skipWaiting()
})

// アクティベート時に古いキャッシュを削除
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] アクティベート中")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== APP_SHELL) {
              console.log("[ServiceWorker] 古いキャッシュを削除:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[ServiceWorker] クライアントを制御中")
        return self.clients.claim()
      }),
  )
})

// リソースがキャッシュ可能かチェック
function isCacheable(url) {
  const requestUrl = new URL(url)

  // 同一オリジンのリソースのみキャッシュ
  if (requestUrl.origin !== location.origin) {
    return false
  }

  // キャッシュ可能なパターンとマッチするかチェック
  return CACHEABLE_RESOURCES.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(requestUrl.pathname)
    }
    return requestUrl.pathname === pattern
  })
}

// ネットワークリクエスト時の処理
self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  // APIリクエストはキャッシュしない（ネットワークのみ）
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/static/")) {
    return
  }

  // HTMLリクエストの場合はネットワークファーストで処理
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response
        })
        .catch(() => {
          return caches.match("/offline").then((response) => response || caches.match("/"))
        }),
    )
    return
  }

  // その他のリソースはキャッシュファーストで処理
  if (isCacheable(request.url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // キャッシュにヒットした場合はそれを返し、バックグラウンドで更新
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // 有効なレスポンスの場合はキャッシュを更新
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache)
              })
            }
            return networkResponse
          })
          .catch(() => {
            console.log("[ServiceWorker] ネットワークリクエスト失敗:", request.url)
          })

        return cachedResponse || fetchPromise
      }),
    )
  }
})

// プッシュ通知の受信時
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] プッシュ通知を受信:", event)

  let notificationData = {
    title: "現助からのお知らせ",
    body: "新しい通知があります",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: "/notifications",
    },
  }

  try {
    if (event.data) {
      notificationData = { ...notificationData, ...event.data.json() }
    }
  } catch (e) {
    console.error("[ServiceWorker] プッシュデータの解析エラー:", e)
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
  console.log("[ServiceWorker] 通知がクリックされました:", event)
  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // すでに開いているウィンドウがあればそれをフォーカス
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus()
        }
      }
      // なければ新しいウィンドウを開く
      return clients.openWindow(urlToOpen)
    }),
  )
})

// バックグラウンド同期
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] バックグラウンド同期:", event.tag)

  if (event.tag === "sync-reports") {
    event.waitUntil(syncPendingData())
  }
})

// バックグラウンド同期の実装
async function syncPendingData() {
  try {
    // IndexedDBからの未同期データ取得
    const db = await openDatabase()
    const pendingItems = await getPendingItems(db)

    console.log("[ServiceWorker] 同期するアイテム:", pendingItems.length)

    for (const item of pendingItems) {
      await syncItem(item)
      await markItemAsSynced(db, item.id)
    }

    return true
  } catch (error) {
    console.error("[ServiceWorker] 同期エラー:", error)
    return false
  }
}

// IndexedDBを開く
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("habuken-offline-db", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// 未同期アイテムを取得
function getPendingItems(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-items"], "readonly")
    const store = transaction.objectStore("pending-items")
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// アイテムを同期
async function syncItem(item) {
  try {
    const response = await fetch(item.url, {
      method: item.method || "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item.data),
    })

    if (!response.ok) {
      throw new Error(`サーバーエラー: ${response.status}`)
    }

    console.log("[ServiceWorker] アイテム同期成功:", item.id)
    return true
  } catch (error) {
    console.error("[ServiceWorker] アイテム同期失敗:", item.id, error)
    throw error
  }
}

// アイテムを同期済みとしてマーク
function markItemAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-items"], "readwrite")
    const store = transaction.objectStore("pending-items")
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
