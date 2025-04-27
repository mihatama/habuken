"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

// DataTable props
interface DataTableProps<T> {
  data: T[]
  columns: {
    header: string
    accessor: (item: T, index: number) => React.ReactNode
    className?: string
  }[]
  onAdd: () => void
  onDelete: (id: any) => void
  getRowId: (item: T) => any
  addButtonLabel?: string
  isDeleteDisabled?: (item: T) => boolean
  className?: string
}

// DataTable component
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
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={getRowId(item)}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {column.accessor(item, rowIndex)}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(getRowId(item))}
                    disabled={isDeleteDisabled ? isDeleteDisabled(item) : false}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button variant="outline" size="sm" onClick={onAdd} className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        {addButtonLabel}
      </Button>
    </div>
  )
}
