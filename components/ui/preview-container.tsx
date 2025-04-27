import type React from "react"
import { cn } from "@/lib/utils"

// PreviewContainer props
interface PreviewContainerProps {
  title: string
  children: React.ReactNode
  className?: string
}

// PreviewSection props
interface PreviewSectionProps {
  children: React.ReactNode
  className?: string
}

// PreviewHeader props
interface PreviewHeaderProps {
  title: string
  value: string
  colSpan?: number
  className?: string
}

// PreviewTable props
interface PreviewTableProps {
  headers: string[]
  children: React.ReactNode
  className?: string
}

// PreviewContainer component
export function PreviewContainer({ title, children, className }: PreviewContainerProps) {
  return (
    <div className={cn("border rounded-md", className)}>
      <div className="border-b p-4 bg-gray-50">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// PreviewSection component
export function PreviewSection({ children, className }: PreviewSectionProps) {
  return <div className={cn("", className)}>{children}</div>
}

// PreviewHeader component
export function PreviewHeader({ title, value, colSpan = 1, className }: PreviewHeaderProps) {
  return (
    <div className={cn("p-2", className)} style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
      <div className="font-bold">{title}</div>
      <div>{value}</div>
    </div>
  )
}

// PreviewTable component
export function PreviewTable({ headers, children, className }: PreviewTableProps) {
  return (
    <table className={cn("w-full border-collapse", className)}>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="border-r border-b border-gray-300 p-2 text-left font-medium">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}
