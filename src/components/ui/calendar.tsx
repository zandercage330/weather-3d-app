"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "./button"

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  className,
}: CalendarProps & React.HTMLAttributes<HTMLDivElement>) {
  const [month, setMonth] = React.useState<Date>(selected || new Date())
  
  const handlePreviousMonth = () => {
    setMonth(prev => {
      const date = new Date(prev)
      date.setMonth(date.getMonth() - 1)
      return date
    })
  }
  
  const handleNextMonth = () => {
    setMonth(prev => {
      const date = new Date(prev)
      date.setMonth(date.getMonth() + 1)
      return date
    })
  }
  
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  
  const days = []
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 p-0" />)
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const isSelected = selected && date.toDateString() === selected.toDateString()
    const isDisabled = disabled ? disabled(date) : false
    
    days.push(
      <Button
        key={`day-${day}`}
        variant="ghost"
        className={cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          isSelected && "bg-primary text-primary-foreground",
          isDisabled && "text-muted-foreground opacity-50"
        )}
        disabled={isDisabled}
        onClick={() => !isDisabled && onSelect?.(date)}
      >
        {day}
      </Button>
    )
  }
  
  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between mb-2">
        <Button
          variant="outline"
          className="h-7 w-7 p-0"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(month, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          className="h-7 w-7 p-0"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {dayNames.map(day => (
          <div key={day} className="h-9 p-2 text-muted-foreground">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  )
} 