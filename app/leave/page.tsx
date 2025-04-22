import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveRequestManagement } from "@/components/leave-request-management"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckSquare, BarChart3 } from "lucide-react"

export default function LeaveRequestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">休暇申請</h1>

          <Tabs defaultValue="apply" className="mb-6">
            <TabsList>
              <TabsTrigger value="apply">申請</TabsTrigger>
              <TabsTrigger value="approve">承認</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
              <TabsTrigger value="stats">統計</TabsTrigger>
            </TabsList>
            <TabsContent value="apply" className="mt-4">
              <LeaveRequestManagement />
            </TabsContent>
            <TabsContent value="approve" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="text-center p-12">
                      <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">休暇承認</h3>
                      <p className="mt-2 text-sm text-muted-foreground">申請された休暇の承認・否認を行います。</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="text-center p-12">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">休暇カレンダー</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        チーム全体の休暇予定をカレンダー形式で確認できます。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <div className="text-center p-12">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">休暇統計</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        有給消化率や休暇取得状況の統計を確認できます。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
