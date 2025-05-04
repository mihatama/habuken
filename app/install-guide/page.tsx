import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chrome, Smartphone, Apple } from "lucide-react"
import Image from "next/image"

export default function InstallGuidePage() {
  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">現助アプリのインストール方法</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>ホーム画面に追加する方法</CardTitle>
          <CardDescription>
            現助アプリをインストールすると、ホーム画面からすぐにアクセスでき、オフラインでも使用できます。
            お使いのデバイスに合わせた手順でインストールしてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chrome" className="w-full">
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
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Chrome デスクトップでのインストール方法:</h3>
                <ol className="list-decimal list-inside space-y-4 pl-4">
                  <li className="pl-2">
                    ブラウザのアドレスバー右側にある「インストール」アイコン（＋）をクリック
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/chrome-install-icon.png"
                        alt="Chromeのインストールアイコン"
                        width={500}
                        height={100}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                  <li className="pl-2">
                    または、メニュー（⋮）から「アプリをインストール」を選択
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/chrome-install-menu.png"
                        alt="Chromeのインストールメニュー"
                        width={300}
                        height={400}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                  <li className="pl-2">
                    表示されるダイアログで「インストール」をクリック
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/chrome-install-dialog.png"
                        alt="Chromeのインストールダイアログ"
                        width={400}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="android" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Android でのインストール方法:</h3>
                <ol className="list-decimal list-inside space-y-4 pl-4">
                  <li className="pl-2">
                    Chromeメニュー（⋮）をタップ
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/android-menu.png"
                        alt="Androidのメニュー"
                        width={300}
                        height={500}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                  <li className="pl-2">
                    「ホーム画面に追加」を選択
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/android-add-home.png"
                        alt="Androidのホーム画面に追加"
                        width={300}
                        height={500}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                  <li className="pl-2">
                    「追加」をタップ
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/android-confirm.png"
                        alt="Androidの確認ダイアログ"
                        width={300}
                        height={200}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="ios" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">iOS (iPhone/iPad) でのインストール方法:</h3>
                <p className="text-red-500 font-medium">
                  ※ iOSではSafariブラウザを使用する必要があります。Chromeでは動作しません。
                </p>
                <ol className="list-decimal list-inside space-y-4 pl-4">
                  <li className="pl-2">Safariで現助アプリを開く</li>
                  <li className="pl-2">
                    共有ボタン（□↑）をタップ
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/ios-share.png"
                        alt="iOSの共有ボタン"
                        width={300}
                        height={500}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                  <li className="pl-2">
                    「ホーム画面に追加」をタップ
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/ios-add-home.png"
                        alt="iOSのホーム画面に追加"
                        width={300}
                        height={400}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                  <li className="pl-2">
                    右上の「追加」をタップ
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                      <Image
                        src="/screenshots/ios-confirm.png"
                        alt="iOSの確認画面"
                        width={300}
                        height={400}
                        className="mx-auto"
                      />
                    </div>
                  </li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
