import type React from "react"
import { Calendar, Briefcase, Users, Truck, Car, Wrench, ClipboardList, FileCheck, Settings } from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  matchPath?: (pathname: string) => boolean
}

export const getNavItems = (): NavItem[] => [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: <Calendar className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/dashboard",
  },
  {
    href: "/master/project",
    label: "案件",
    icon: <Briefcase className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/master/project",
  },
  {
    href: "/master/staff",
    label: "スタッフ",
    icon: <Users className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/master/staff",
  },
  {
    href: "/master/heavy",
    label: "重機",
    icon: <Truck className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/master/heavy",
  },
  {
    href: "/master/vehicle",
    label: "車両",
    icon: <Car className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/master/vehicle",
  },
  {
    href: "/tools",
    label: "備品",
    icon: <Wrench className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/tools",
  },
  {
    href: "/leave",
    label: "休暇",
    icon: <ClipboardList className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/leave",
  },
  {
    href: "/reports",
    label: "報告",
    icon: <FileCheck className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname.startsWith("/reports"),
  },
  {
    href: "/settings",
    label: "設定",
    icon: <Settings className="h-5 w-5 mb-1" />,
    matchPath: (pathname) => pathname === "/settings",
  },
]
