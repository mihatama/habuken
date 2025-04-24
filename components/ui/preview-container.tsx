import type React from "react"

type PreviewContainerProps = {
  title: string
  children: React.ReactNode
  className?: string
}

export function PreviewContainer({ title, children, className }: PreviewContainerProps) {
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-medium mb-4">プレビュー</h3>
      <div className={`border rounded-md p-4 bg-white ${className || ""}`}>
        <div className="text-center text-2xl font-bold mb-4">{title}</div>
        {children}
      </div>
    </div>
  )
}

type PreviewSectionProps = {
  children: React.ReactNode
  className?: string
}

export function PreviewSection({ children, className }: PreviewSectionProps) {
  return <div className={`border border-gray-300 ${className || ""}`}>{children}</div>
}

type PreviewHeaderProps = {
  title: string
  value: React.ReactNode
  colSpan?: number
  className?: string
}

export function PreviewHeader({ title, value, colSpan = 1, className }: PreviewHeaderProps) {
  return (
    <div className={`col-span-${colSpan} p-2 ${className || ""}`}>
      <div className="font-bold">{title}</div>
      <div>{value}</div>
    </div>
  )
}

type PreviewTableProps = {
  headers: string[]
  children: React.ReactNode
  className?: string
}

export function PreviewTable({ headers, children, className }: PreviewTableProps) {
  return (
    <div className={`border-b border-gray-300 ${className || ""}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border-r border-b border-gray-300 p-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
