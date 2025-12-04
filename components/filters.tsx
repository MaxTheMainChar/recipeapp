"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FiltersProps {
  vegetarianOnly: boolean
  veganOnly: boolean
  maxTime: number | null
  onVegetarianChange: (checked: boolean) => void
  onVeganChange: (checked: boolean) => void
  onMaxTimeChange: (time: number | null) => void
}

export default function Filters({
  vegetarianOnly,
  veganOnly,
  maxTime,
  onVegetarianChange,
  onVeganChange,
  onMaxTimeChange,
}: FiltersProps) {
  const handleVegetarianChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      onVegetarianChange(checked)
    }
  }

  const handleVeganChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      onVeganChange(checked)
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Checkboxes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="vegetarian" checked={vegetarianOnly} onCheckedChange={handleVegetarianChange} />
            <Label htmlFor="vegetarian" className="text-sm font-medium text-foreground cursor-pointer">
              Vegetarian only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="vegan" checked={veganOnly} onCheckedChange={handleVeganChange} />
            <Label htmlFor="vegan" className="text-sm font-medium text-foreground cursor-pointer">
              Vegan only
            </Label>
          </div>
        </div>

        {/* Max Time Dropdown */}
        <div className="flex-1 max-w-xs">
          <Label htmlFor="maxTime" className="text-sm font-medium text-foreground mb-2 block">
            Max cooking time
          </Label>
          <Select
            value={maxTime?.toString() || "any"}
            onValueChange={(value) => onMaxTimeChange(value === "any" ? null : Number.parseInt(value))}
          >
            <SelectTrigger id="maxTime" className="w-full">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
