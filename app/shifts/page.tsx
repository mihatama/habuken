import { Header } from "@/components/header"
import { ShiftManagement } from "@/components/shift-management"

export default function ShiftsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">シフト管理</h1>
          <ShiftManagement />
        </div>
      </main>
    </div>
  )
}
