"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Download, Chrome, Apple, Smartphone } from "lucide-react"

export function PWAInstallGuide() {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState("chrome")

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = typeof navigator !== "undefined" && /Android/.test(navigator.userAgent)

  const defaultPlatform = isIOS ? "ios" : isAndroid ? "android" : "chrome"

  return (
    <>
      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">アプリをインストール</span>
        <span className="sm:hidden">インストール</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>現助アプリをインストール</DialogTitle>
            <DialogDescription>ホーム画面に追加してオフラインでも使用できます</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={defaultPlatform} className="w-full" onValueChange={setPlatform}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="chrome" className="flex items-center gap-1">
                <Chrome className="h-4 w-4" />
                <span>Chrome</span>
              </TabsTrigger>
              <TabsTrigger value="android" className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span>Android</span>
              </TabsTrigger>
              <TabsTrigger value="ios" className="flex items-center gap-1">
                <Apple className="h-4 w-4" />
                <span>iOS</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chrome" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Chrome デスクトップでのインストール方法:</p>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>ブラウザのアドレスバー右側にある「インストール」アイコン（＋）をクリック</li>
                  <li>または、メニュー（⋮）から「アプリをインストール」を選択</li>
                  <li>表示されるダイアログで「インストール」をクリック</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="android" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Android でのインストール方法:</p>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>Chromeメニュー（⋮）をタップ</li>
                  <li>「ホーム画面に追加」を選択</li>
                  <li>「追加」をタップ</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="ios" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">iOS (iPhone/iPad) でのインストール方法:</p>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>Safariで現助アプリを開く（Chromeでは動作しません）</li>
                  <li>共有ボタン（□↑）をタップ</li>
                  <li>「ホーム画面に追加」をタップ</li>
                  <li>右上の「追加」をタップ</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
