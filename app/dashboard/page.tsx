import { Suspense } from "react"
import Loading from "../loading"
import DashboardClientPage from "./DashboardClientPage"

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardClientPage />
    </Suspense>
  )
}
