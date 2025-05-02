"use client"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Briefcase,
  Users,
  Truck,
  Car,
  Key,
  ClipboardList,
  FileText,
  X,
  Settings,
  User,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  if (!isOpen) return null

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const isActive = (path: string) => {
    return pathname === path ? "bg-darkgray-light text-gold" : "text-white hover:bg-darkgray-light hover:text-gold"
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
      onClose()
    } catch (error) {
      console.error("サインアウトエラー:", error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-darkgray shadow-lg overflow-y-auto">
        <div className="flex h-16 items-center justify-between px-4 border-b border-gold/30">
          <div className="flex items-center">
            <Image src="/favicon.ico" alt="現助ロゴ" width={24} height={24} className="mr-2" />
            <span className="text-xl font-bold text-gold font-mincho">現助</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-darkgray-light hover:text-gold"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>

        {user && (
          <div className="p-4 border-b border-gold/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-darkgray font-bold">{user.email?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-muted-foreground">ログイン中</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-1 p-2">
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/dashboard")}`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <Calendar className="h-5 w-5" />
            <span>ダッシュボード</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/deals")}`}
            onClick={() => handleNavigation("/deals")}
          >
            <Briefcase className="h-5 w-5" />
            <span>案件</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/master/staff")}`}
            onClick={() => handleNavigation("/master/staff")}
          >
            <Users className="h-5 w-5" />
            <span>スタッフ</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/master/heavy")}`}
            onClick={() => handleNavigation("/master/heavy")}
          >
            <Truck className="h-5 w-5" />
            <span>重機</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/master/vehicle")}`}
            onClick={() => handleNavigation("/master/vehicle")}
          >
            <Car className="h-5 w-5" />
            <span>車両</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/tools")}`}
            onClick={() => handleNavigation("/tools")}
          >
            <Key className="h-5 w-5" />
            <span>備品</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/leave")}`}
            onClick={() => handleNavigation("/leave")}
          >
            <ClipboardList className="h-5 w-5" />
            <span>休暇申請</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex w-full justify-start gap-3 p-3 ${isActive("/reports")}`}
            onClick={() => handleNavigation("/reports")}
          >
            <FileText className="h-5 w-5" />
            <span>現場報告</span>
          </Button>
        </div>

        <div className="border-t border-gold/30 p-2 mt-2">
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-3 p-3 text-white hover:bg-darkgray-light hover:text-gold"
            onClick={() => handleNavigation("/profile")}
          >
            <User className="h-5 w-5" />
            <span>プロフィール</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-3 p-3 text-white hover:bg-darkgray-light hover:text-gold"
            onClick={() => handleNavigation("/settings")}
          >
            <Settings className="h-5 w-5" />
            <span>設定</span>
          </Button>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-3 p-3 text-white hover:bg-destructive hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>ログアウト</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
