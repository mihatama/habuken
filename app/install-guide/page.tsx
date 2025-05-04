import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "アプリのインストール方法",
  description: "現助アプリをデバイスにインストールする方法を説明します",
}

export default function InstallGuidePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">アプリのインストール方法</h1>

      <p className="text-lg mb-8 text-center">
        現助アプリをインストールすると、ブラウザを開かなくても直接アクセスでき、
        オフラインでも一部機能が利用できるようになります。
      </p>

      <Tabs defaultValue="android" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iOS</TabsTrigger>
          <TabsTrigger value="desktop">デスクトップ</TabsTrigger>
        </TabsList>

        <TabsContent value="android" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Androidでのインストール方法</CardTitle>
              <CardDescription>Chromeブラウザを使用してアプリをインストールする手順です</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">方法1: ブラウザのメニューから</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Chromeブラウザで現助アプリを開きます</li>
                  <li>右上の「︙」メニューをタップします</li>
                  <li>「ホーム画面に追加」または「アプリをインストール」を選択します</li>
                  <li>確認画面で「インストール」をタップします</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">方法2: インストールバナーから</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>アプリを使用していると、画面下部にインストールを促すバナーが表示されることがあります</li>
                  <li>バナーの「インストール」ボタンをタップします</li>
                  <li>確認画面で「インストール」をタップします</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">方法3: アドレスバーから</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>アドレスバーの右側に表示されるインストールアイコン（↓）をタップします</li>
                  <li>「インストール」をタップします</li>
                </ol>
              </div>

              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="text-lg font-medium text-amber-800">インストールオプションが表示されない場合</h3>
                <ul className="list-disc pl-5 space-y-1 text-amber-700">
                  <li>最新バージョンのChromeを使用していることを確認してください</li>
                  <li>ブラウザのキャッシュをクリアしてから再試行してください</li>
                  <li>アプリを数分間使用してから、再度インストールを試みてください</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>iOSでのインストール方法</CardTitle>
              <CardDescription>Safariブラウザを使用してアプリをインストールする手順です</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
                <p className="font-medium text-amber-800">
                  iOSでは、Safariブラウザからのみアプリをインストールできます。
                  Chrome、Firefox、その他のブラウザからはインストールできません。
                </p>
              </div>

              <div className="space-y-4">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <p>Safariブラウザで現助アプリを開きます</p>
                  </li>
                  <li>
                    <p>画面下部の「共有」ボタンをタップします</p>
                    <div className="flex justify-center my-2">
                      <div className="relative w-64 h-36 border rounded-md overflow-hidden">
                        <Image src="/pwa/ios-share.png" alt="iOSの共有ボタン" fill className="object-contain" />
                      </div>
                    </div>
                  </li>
                  <li>
                    <p>共有メニューを下にスクロールし、「ホーム画面に追加」をタップします</p>
                    <div className="flex justify-center my-2">
                      <div className="relative w-64 h-36 border rounded-md overflow-hidden">
                        <Image src="/pwa/ios-add-home.png" alt="ホーム画面に追加" fill className="object-contain" />
                      </div>
                    </div>
                  </li>
                  <li>
                    <p>確認画面で右上の「追加」をタップします</p>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="text-lg font-medium text-amber-800">注意事項</h3>
                <ul className="list-disc pl-5 space-y-1 text-amber-700">
                  <li>iOS 16.4以降では、インストール済みのPWAでプッシュ通知を受け取ることができます</li>
                  <li>ホーム画面に追加したアプリは、Safariのデータとは別に扱われます</li>
                  <li>アプリのアップデートは自動的に適用されます</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desktop" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>デスクトップでのインストール方法</CardTitle>
              <CardDescription>
                Chrome、Edge、またはその他のChromiumベースのブラウザでアプリをインストールする手順です
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">方法1: アドレスバーから</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>ブラウザで現助アプリを開きます</li>
                  <li>アドレスバーの右側に表示されるインストールアイコン（↓）をクリックします</li>
                  <li>「インストール」をクリックします</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">方法2: ブラウザのメニューから</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>ブラウザの右上にある「︙」メニューをクリックします</li>
                  <li>「アプリ」または「その他のツール」→「アプリ」を選択します</li>
                  <li>「このサイトをアプリとしてインストール」をクリックします</li>
                  <li>確認ダイアログで「インストール」をクリックします</li>
                </ol>
              </div>

              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="text-lg font-medium text-amber-800">インストールオプションが表示されない場合</h3>
                <ul className="list-disc pl-5 space-y-1 text-amber-700">
                  <li>最新バージョンのブラウザを使用していることを確認してください</li>
                  <li>ブラウザのキャッシュをクリアしてから再試行してください</li>
                  <li>
                    一部のブラウザ（Firefox、Safariなど）では、デスクトップへのインストールがサポートされていない場合があります
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
