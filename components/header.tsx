import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

const items = [
  {
    title: "タスク",
    href: "/tasks",
  },
  {
    title: "プロジェクト",
    href: "/projects",
  },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Image src="/habuken-logo.png" alt="羽布建設ロゴ" width={40} height={40} />
          <MainNav items={items} />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}
