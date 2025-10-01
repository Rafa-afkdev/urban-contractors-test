"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateSelectProps {
  id?: string
  name?: string
  defaultDate?: Date
  placeholder?: string
  className?: string
  onChange?: (date: Date | undefined) => void
}

export function DateSelect({
  id = "fecha",
  name = "fecha",
  defaultDate,
  placeholder = "Select date",
  className,
  onChange,
}: DateSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(defaultDate)

  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id={id} className="w-full justify-between font-normal">
            {date ? date.toLocaleDateString() : placeholder}
            <ChevronDownIcon className="ml-2 size-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <UiCalendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(d) => {
              setDate(d)
              onChange?.(d)
              if (d) setOpen(false)
            }}
            disabled={{ before: today }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Hidden input to carry the value when submitting the form */}
      <input type="hidden" id={id} name={name} value={date ? date.toISOString() : ""} readOnly />
    </div>
  )
}
