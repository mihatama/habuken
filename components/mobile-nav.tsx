"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Briefcase, Users, Truck, Car, Key, ClipboardList, FileText, X } from "lucide-react"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-lg">
        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-lg font-bold">メニュー</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>
        <div className="grid gap-1 px-2 py-4">
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/dashboard")}
          >
            <Calendar className="h-5 w-5" />
            <span>ダッシュボード</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/deals/register")}
          >
            <Briefcase className="h-5 w-5" />
            <span>案件</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/master/staff")}
          >
            <Users className="h-5 w-5" />
            <span>スタッフ</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/master/heavy")}
          >
            <Truck className="h-5 w-5" />
            <span>重機</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/master/vehicle")}
          >
            <Car className="h-5 w-5" />
            <span>車両</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/tools")}
          >
            <Key className="h-5 w-5" />
            <span>備品</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/leave")}
          >
            <ClipboardList className="h-5 w-5" />
            <span>休暇申請</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2"
            onClick={() => handleNavigation("/reports")}
          >
            <FileText className="h-5 w-5" />
            <span>現場報告</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
