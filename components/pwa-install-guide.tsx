"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share2, MoreVertical, Plus, MenuIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PWAInstallGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  // PWAがすでにインストールされているかチェック
  useState(() => {
    if (typeof window !== "undefined") {
      if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
        setIsInstalled(true)
      }
    }
  })

  if (isInstalled) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Download className="h-4 w-4 mr-1" />
          アプリをインストール
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>現助アプリをインストール</DialogTitle>
          <DialogDescription>
            ホーム画面に追加してオフラインでも使用できます。デバイスに合わせた手順でインストールしてください。
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="android" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="desktop">PC</TabsTrigger>
          </TabsList>
          <TabsContent value="android" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 border-b pb-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 mt-1">
                  <MoreVertical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">方法1: Chromeメニューから</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1. 画面右上の「︙」（メニュー）をタップ</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2. 「アプリをインストール」または「ホーム画面に追加」を選択
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b pb-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 mt-1">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">方法2: 共有メニューから</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1. 画面右上の「︙」（メニュー）をタップ</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2. 「共有」を選択</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    3. 「ホーム画面に追加」または「インストール」を選択
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 mt-1">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">方法3: アドレスバーから</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1. アドレスバー右側に表示される「+」または「インストール」アイコンをタップ
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2. 「インストール」を選択</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>表示されない場合:</strong>{" "}
                ブラウザを最新バージョンに更新するか、別のブラウザ（Chrome推奨）で試してください。
              </p>
            </div>
            <Button className="w-full" onClick={() => setIsOpen(false)}>
              閉じる
            </Button>
          </TabsContent>
          <TabsContent value="ios" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 mt-1">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Safariから追加</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1. Safariブラウザで現助アプリを開く</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2. 画面下部の「共有」アイコン（□↑）をタップ
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">3. 「ホーム画面に追加」をタップ</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">4. 右上の「追加」をタップ</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>注意:</strong>{" "}
                iOSではSafariブラウザからのみインストールできます。Chrome等の他のブラウザでは利用できません。
              </p>
            </div>
            <Button className="w-full" onClick={() => setIsOpen(false)}>
              閉じる
            </Button>
          </TabsContent>
          <TabsContent value="desktop" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 border-b pb-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 mt-1">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Chrome/Edgeブラウザ</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1. アドレスバー右側の「インストール」アイコンをクリック
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2. 表示されるダイアログで「インストール」をクリック
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 mt-1">
                  <MenuIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">メニューから</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1. ブラウザの右上にある「︙」（メニュー）をクリック
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2. 「アプリをインストール」または「現助をインストール」を選択
                  </p>
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={() => setIsOpen(false)}>
              閉じる
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
