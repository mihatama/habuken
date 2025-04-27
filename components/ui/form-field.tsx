"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// TextField component props
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  required?: boolean
}

// SelectField component props
interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
  required?: boolean
  icon?: React.ReactNode
  className?: string
}

// TextField component
export function TextField({ id, label, error, required, className, ...props }: TextFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        className={cn(error && "border-red-500 focus-visible:ring-red-500")}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

// SelectField component
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  icon,
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className={cn(error && "border-red-500 focus-visible:ring-red-500", icon && "pl-8")}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          {icon && <span className="absolute left-2.5">{icon}</span>}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
