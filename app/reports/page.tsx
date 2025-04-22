import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { DailyReportForm } from "@/components/daily-report-form"
import { SafetyInspectionForm } from "@/components/safety-inspection-form"
import { ReportsList } from "@/components/reports-list"
import { ReportExport } from "@/components/report-export"
import { FileText, Shield, List, FileOutput } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">現場報告書</h1>

          <Tabs defaultValue="daily" className="mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-3xl">
              <TabsTrigger value="daily" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                作業日報
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                安全巡視
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center">
                <List className="w-4 h-4 mr-2" />
                報告一覧
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center">
                <FileOutput className="w-4 h-4 mr-2" />
                エクスポート
              </TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="mt-4">
              <Card className="p-6">
                <DailyReportForm />
              </Card>
            </TabsContent>
            <TabsContent value="safety" className="mt-4">
              <Card className="p-6">
                <SafetyInspectionForm />
              </Card>
            </TabsContent>
            <TabsContent value="list" className="mt-4">
              <Card className="p-6">
                <ReportsList />
              </Card>
            </TabsContent>
            <TabsContent value="export" className="mt-4">
              <Card className="p-6">
                <ReportExport />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
