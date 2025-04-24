import { Header } from "@/components/header"
import { CalendarView } from "@/components/calendar-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShiftManagement } from "@/components/shift-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Repeat, Settings, Car, UserCheck, ShieldCheck } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">スケジュール管理</h1>

          <Tabs defaultValue="calendar" className="mb-6">
            <TabsList>
              <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
              <TabsTrigger value="shift">シフト管理</TabsTrigger>
              <TabsTrigger value="features">その他機能</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="mt-4">
              <CalendarView />
            </TabsContent>
            <TabsContent value="shift" className="mt-4">
              <ShiftManagement />
            </TabsContent>
            <TabsContent value="features" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">カレンダー切替機能</CardTitle>
                    <CalendarDays className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      スタッフごとや案件ごと、日・週・月ごとなど、柔軟に自社に最も合う表示を選べます。
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      設定を開く
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">表示項目設定</CardTitle>
                    <Settings className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      カレンダー画面にどの項目を表示するか、各社ごとに自由にカスタマイズできます。
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      設定を開く
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">繰り返し設定</CardTitle>
                    <Repeat className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      特定の頻度で繰り返し発生する案件は、繰り返し設定で一括登録することができます。
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      設定を開く
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">車両・備品管理機能</CardTitle>
                    <Car className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      現場にどの車両で行くか、何の道具を持って行くかなどを一緒に管理できます。
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      設定を開く
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">スタッフ条件登録</CardTitle>
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      スタッフのスキルや資格、担当エリアなどの条件を登録しておけば、絞り込みも簡単に行えます。
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      設定を開く
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">権限管理機能</CardTitle>
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      管理画面にアクセスできるユーザーに対し、それぞれどの画面を編集できるか設定できます。
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      設定を開く
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
