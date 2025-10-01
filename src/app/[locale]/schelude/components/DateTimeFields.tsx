"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DateSelect } from "@/components/ui/DateSelect"
import { UseFormRegister, FieldErrors } from "react-hook-form"

interface DateTimeFieldsProps {
  dateLabel: string
  datePlaceholder: string
  timeLabel: string
  timePlaceholder: string
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export function DateTimeFields({
  dateLabel,
  datePlaceholder,
  timeLabel,
  timePlaceholder,
  register,
  errors,
}: DateTimeFieldsProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)

  const isToday = React.useMemo(() => {
    if (!selectedDate) return false
    const now = new Date()
    return (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()
    )
  }, [selectedDate])

  const minTime = React.useMemo(() => {
    if (!isToday) return undefined
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }, [isToday])

  return (
    <>
      <div className="grid gap-2">
        <Label className="text-gray-700 dark:text-gray-300 font-medium">{dateLabel}</Label>
        <Input
          id="fecha"
          type="date"
          placeholder={datePlaceholder}
          className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
          required
          {...register('fecha')}
        />
        <p className="text-red-500 text-xs mt-1">{errors.fecha?.message as string}</p>
      </div>

      <div className="grid gap-2">
        <Label className="text-gray-700 dark:text-gray-300 font-medium">{timeLabel}</Label>
        <Input
          id="hora"
          type="time"
          placeholder={timePlaceholder}
          min={minTime}
          className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-400"
          required
          {...register('hora')}
        />
        <p className="text-red-500 text-xs mt-1">{errors.hora?.message as string}</p>
      </div>
    </>
  )
}
