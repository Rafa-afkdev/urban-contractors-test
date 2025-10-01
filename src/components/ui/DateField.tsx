"use client"

import * as React from "react"
import { Calendar as UiCalendar } from "@/components/ui/calendar"

interface DateFieldProps {
  id?: string
  name?: string
  defaultDate?: Date
}

export function DateField({ id = "fecha", name = "fecha", defaultDate }: DateFieldProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultDate)

  // Disable all dates before today (today is allowed)
  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <UiCalendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={{ before: today }}
        initialFocus
      />
      {/* Hidden input to carry the value if the form is submitted traditionally */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={date ? date.toISOString() : ""}
        readOnly
      />
    </div>
  )
}
