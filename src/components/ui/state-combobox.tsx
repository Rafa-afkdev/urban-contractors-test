"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import usStatesData from "../../../data/us-states.json"

interface StateComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: string
}

export function StateCombobox({
  value,
  onValueChange,
  placeholder = "Select state...",
  className,
  error
}: StateComboboxProps) {
  const [open, setOpen] = React.useState(false)
  
  const states = usStatesData.states

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600",
              !value && "text-gray-400 dark:text-gray-500",
              error && "border-red-500 dark:border-red-400",
              className
            )}
          >
            {value
              ? states.find((state) => state.name === value)?.name
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Command>
            <CommandInput 
              placeholder="Search state..." 
              className="border-0 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <CommandList>
              <CommandEmpty className="text-gray-500 dark:text-gray-400 py-6 text-center text-sm">
                No state found.
              </CommandEmpty>
              <CommandGroup>
                {states.map((state) => (
                  <CommandItem
                    key={state.code}
                    value={state.name}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === state.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {state.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
