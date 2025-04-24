"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormFieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  children?: React.ReactNode
}

export function FormField({ id, label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  type?: string
  className?: string
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  type = "text",
  className,
}: TextFieldProps) {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${error ? "border-red-500" : ""} ${className || ""}`}
      />
    </FormField>
  )
}

type SelectFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  error?: string
  icon?: React.ReactNode
  className?: string
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  icon,
  className,
}: SelectFieldProps) {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className={`${error ? "border-red-500" : ""} ${className || ""} ${icon ? "flex items-center" : ""}`}
        >
          {icon}
          <SelectValue placeholder={placeholder} className={icon ? "ml-2" : ""} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
