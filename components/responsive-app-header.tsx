"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { InstallButton } from "@/components/install-button"
import { UserNav } from "@/components/user-nav"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Truck,
  Car,
  Package,
  Calendar,
  FileText,
  UserPlus,
  Menu,
  LogOut,
} from "lucide-react"

interface ResponsiveAppHeaderProps {
  user: {
    email?: string
    id: string
    user_metadata: {
      full_name: string
      role: string
    }
  }
  isAdmin?: boolean
}

export default function ResponsiveAppHeader({ user, isAdmin = false }: ResponsiveAppHeaderProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path)
    if (open) setOpen(false)
  }

  const handleSignOut = async () => {
    // This would typically call your auth context's signOut method
    // For now, we'll just navigate to login
    router.push("/login")
  }

  // Navigation links configuration
  const navLinks = [
    { name: "一覧表示", icon: <LayoutDashboard className="h-5 w-5" />, path: "/dashboard" },
    { name: "現場", icon: <Briefcase className="h-5 w-5" />, path: "/deals" },
    { name: "スタッフ", icon: <Users className="h-5 w-5" />, path: "/master/staff" },
    { name: "重機", icon: <Truck className="h-5 w-5" />, path: "/master/heavy" },
    { name: "車両", icon: <Car className="h-5 w-5" />, path: "/master/vehicle" },
    { name: "備品", icon: <Package className="h-5 w-5" />, path: "/tools" },
    { name: "休暇申請", icon: <Calendar className="h-5 w-5" />, path: "/leave" },
    { name: "現場報告", icon: <FileText className="h-5 w-5" />, path: "/reports" },
  ]

  // Add admin link if isAdmin is true
  if (isAdmin) {
    navLinks.push({
      name: "ユーザー作成",
      icon: <UserPlus className="h-5 w-5" />,
      path: "/admin/create-user",
    })
  }

  return (
    <header className="fixed top-0 left-0 bg-zinc-800 h-16 w-full shadow-md z-50 flex items-center justify-between px-4">
      {/* Logo and Wordmark */}
      <div className="flex items-center">
        <Image src="/habuken-logo.png" alt="Habuken Logo" width={28} height={28} className="rounded-full" />
        <span className="ml-2 text-gold font-serif text-xl">現助</span>
      </div>

      {/* Desktop Navigation - 完全に非表示にする */}
      <nav className="hidden lg:flex items-center gap-6">
        {navLinks.map((link) => (
          <Button
            key={link.path}
            variant="ghost"
            className="text-white hover:text-gold"
            onClick={() => navigateTo(link.path)}
          >
            {link.name}
          </Button>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <InstallButton />
        <UserNav user={user} />

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[250px] backdrop-blur bg-background/80">
            <div className="flex flex-col gap-2 mt-8">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:text-gold"
                  onClick={() => navigateTo(link.path)}
                >
                  {link.icon}
                  {link.name}
                </Button>
              ))}

              {/* Logout Button */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 mt-4"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                ログアウト
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
