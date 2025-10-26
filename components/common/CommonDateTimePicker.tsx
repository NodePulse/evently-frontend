"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addMinutes, setHours, setMinutes } from "date-fns";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CommonDateTimePickerProps {
  label?: string;
  name: string;
  placeholder?: string;
  onChange: (dates: [Date | null, Date | null]) => void;
  onBlur?: () => void;
  value: [Date | null, Date | null];
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  className?: string;
  onValidationError?: (error: string | undefined) => void;
}

const CommonDateTimePicker: React.FC<CommonDateTimePickerProps> = ({
  label,
  name,
  onChange,
  onBlur,
  value,
  error: propError,
  touched: propTouched,
  disabled,
  className,
  onValidationError,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(value[0]);
  const [endDate, setEndDate] = useState<Date | null>(value[1]);
  const [internalError, setInternalError] = useState<string | undefined>();

  useEffect(() => {
    setStartDate(value[0]);
    setEndDate(value[1]);
    let one = new Date(startDate?.toISOString())
    let two = new Date(endDate?.toISOString())
    console.log('__++==startDate', one);
    console.log('__++==endDate', two);
  }, [value]);

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    onChange(dates);
    

    if (start && end && end < start) {
      const err = "End date/time must be after start date/time";
      setInternalError(err);
      onValidationError?.(err);
    } else {
      setInternalError(undefined);
      onValidationError?.(undefined);
    }
  };

  const displayError = propTouched && (propError || internalError);

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <Label
          htmlFor={`${name}-start`}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </Label>
      )}

      <div
        className={cn(
          "flex flex-col gap-3 w-full",
          "transition-all duration-200"
        )}
      >
        {/* Start Date Picker */}
        <div className="flex-1">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => handleChange([date, endDate])}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMM d, yyyy h:mm aa"
            placeholderText="Start Date & Time"
            disabled={disabled}
            className={cn(
              "w-full h-11 rounded-lg border bg-background px-3 py-2 text-sm",
              "text-foreground placeholder:text-muted-foreground border-input",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
              "hover:border-ring transition-colors duration-150",
              disabled && "cursor-not-allowed opacity-60"
            )}
            id={`${name}-start`}
            onBlur={() => onBlur?.()}
          />
        </div>

        {/* Connector */}
        {/* <span className="hidden sm:inline-block text-muted-foreground font-medium">
          to
        </span> */}

        {/* End Date Picker */}
        <div className="flex-1">
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => handleChange([startDate, date])}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMM d, yyyy h:mm aa"
            placeholderText="End Date & Time"
            disabled={disabled || !startDate}
            minTime={
              startDate &&
              endDate &&
              startDate.toDateString() === endDate.toDateString()
                ? addMinutes(startDate, 15)
                : setHours(setMinutes(new Date(), 0), 0) // 00:00
            }
            maxTime={
              startDate &&
              endDate &&
              startDate.toDateString() === endDate.toDateString()
                ? setHours(setMinutes(new Date(), 59), 23) // 23:59
                : setHours(setMinutes(new Date(), 59), 23) // 23:59
            }
            className={cn(
              "w-full h-11 rounded-lg border bg-background px-3 py-2 text-sm",
              "text-foreground placeholder:text-muted-foreground border-input",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
              "hover:border-ring transition-colors duration-150",
              disabled && "cursor-not-allowed opacity-60"
            )}
            id={`${name}-end`}
            onBlur={() => onBlur?.()}
          />
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <p className="text-xs text-destructive mt-1">
          {propError || internalError}
        </p>
      )}
    </div>
  );
};

export default CommonDateTimePicker;
