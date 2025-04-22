"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

type DataTableProps<T> = {
  data: T[]
  columns: {
    header: string
    accessor: keyof T | ((item: T) => React.ReactNode)
    className?: string
  }[]
  onAdd?: () => void
  onDelete?: (id: string | number) => void
  getRowId: (item: T) => string | number
  addButtonLabel?: string
  isDeleteDisabled?: (item: T) => boolean
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  onAdd,
  onDelete,
  getRowId,
  addButtonLabel = "追加",
  isDeleteDisabled,
  className,
}: DataTableProps<T>) {
  return (
    <div className={`border rounded-md p-4 ${className || ""}`}>
      {onAdd && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">データ一覧</h3>
          <Button onClick={onAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {addButtonLabel}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {onDelete && <TableHead className="w-20">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={getRowId(item)}>
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {typeof column.accessor === "function"
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </TableCell>
                ))}
                {onDelete && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(getRowId(item))}
                      disabled={isDeleteDisabled ? isDeleteDisabled(item) : false}
                      aria-label="削除"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
