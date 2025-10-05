"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(date.getTime());
    newDate.setHours(parseInt(e.target.value));
    setDate(newDate);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(date.getTime());
    newDate.setMinutes(parseInt(e.target.value));
    setDate(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          id="hours"
          type="number"
          min={0}
          max={23}
          value={date.getHours()}
          onChange={handleHourChange}
          className="w-16"
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          id="minutes"
          type="number"
          min={0}
          max={59}
          value={date.getMinutes()}
          onChange={handleMinuteChange}
          className="w-16"
        />
      </div>
    </div>
  );
}
