"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboBoxProps {
  options: { label: string, value: string, subCategories?: any[] }[]
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
  disabled?: boolean
  name?: string
  placeholder?: string
}

export const ComboBox = React.forwardRef<HTMLButtonElement, ComboBoxProps>(
  ({ options, value, onChange, onBlur, className, disabled, name, placeholder = "Select option..." }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const selectedOption = options.find((option) => option.value === value)

    return (
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between h-12 px-4 py-3",
                "bg-gradient-to-r from-slate-50 to-blue-50/30",
                "border-2 border-slate-200/60",
                "hover:border-blue-300/60 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30",
                "focus:border-blue-500/60 focus:ring-4 focus:ring-blue-100/50",
                "transition-all duration-300 ease-in-out",
                "shadow-sm hover:shadow-md",
                "text-slate-700 font-medium",
                "rounded-xl",
                disabled && "opacity-50 cursor-not-allowed bg-slate-100",
                className
              )}
              disabled={disabled}
              name={name}
              onBlur={onBlur}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {selectedOption ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0" />
                    <span className="truncate text-slate-800 font-medium">
                      {selectedOption.label}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                    <span className="text-slate-500 font-normal">
                      {placeholder}
                    </span>
                  </>
                )}
              </div>
              <ChevronsUpDown className={cn(
                "h-5 w-5 text-slate-400 transition-transform duration-200 flex-shrink-0",
                open && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn(
              "w-full p-0 border-2 border-slate-200/60 shadow-xl",
              "bg-white/95 backdrop-blur-sm",
              "rounded-xl overflow-hidden",
              "animate-in fade-in-0 zoom-in-95 duration-200"
            )}
            align="start"
            sideOffset={4}
          >
            <Command className="rounded-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <CommandInput 
                  placeholder="Search options..." 
                  className={cn(
                    "pl-10 pr-4 py-3 border-0 border-b border-slate-100",
                    "bg-gradient-to-r from-slate-50/50 to-blue-50/30",
                    "focus:bg-gradient-to-r focus:from-blue-50/60 focus:to-indigo-50/40",
                    "text-slate-700 placeholder:text-slate-400",
                    "transition-all duration-200"
                  )}
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
              </div>
              <CommandEmpty className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 flex items-center justify-center">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No options found</p>
                  <p className="text-slate-400 text-sm">Try adjusting your search</p>
                </div>
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {options.map((option, index) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer",
                      "hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/40",
                      "transition-all duration-200 ease-in-out",
                      "border-l-4 border-transparent hover:border-blue-400/60",
                      value === option.value && "bg-gradient-to-r from-blue-100/60 to-indigo-100/40 border-blue-500"
                    )}
                    onSelect={() => {
                      onChange(option.value === value ? "" : option.value)
                      setOpen(false)
                      setSearchValue("")
                    }}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                      value === option.value 
                        ? "border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500" 
                        : "border-slate-300 hover:border-blue-400"
                    )}>
                      <Check
                        className={cn(
                          "h-3 w-3 text-white transition-all duration-200",
                          value === option.value ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "font-medium transition-colors duration-200",
                        value === option.value ? "text-blue-700" : "text-slate-700 hover:text-slate-900"
                      )}>
                        {option.label}
                      </span>
                    </div>
                    {option.subCategories && option.subCategories.length > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="text-xs text-slate-400 font-medium">
                          {option.subCategories.length}
                        </span>
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

ComboBox.displayName = "ComboBox"
