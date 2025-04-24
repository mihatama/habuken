import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-green-700" />
            <span className="font-bold text-xl text-green-700">プロジェクト管理</span>
          </Link>
          <div className="flex-1 flex justify-center overflow-hidden">
            <div className="hidden md:block md:w-full">
              <MainNav />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <Button variant="outline" size="sm" className="mr-2">
                今日
              </Button>
            </div>
            <UserNav />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
