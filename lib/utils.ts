import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/clsxConverter.ts

/**
 * Converts a tailwind-style class string like
 * "sm:flex sm:flex-col md:grid md:gap-4"
 * into an object-based structure like:
 * { sm: "flex flex-col", md: "grid gap-4" }
 */
export function convertClsxStringToObject(classString: string) {
  const parts = classString.trim().split(/\s+/); // split by whitespace
  const result: Record<string, string[]> = {};

  for (const part of parts) {
    const [prefix, className] = part.split(":");

    if (!className) continue; // skip invalid
    if (!result[prefix]) result[prefix] = [];
    result[prefix].push(className);
  }

  // Join grouped classes into single strings
  const formatted: Record<string, string> = {};
  for (const [key, value] of Object.entries(result)) {
    formatted[key] = value.join(" ");
  }

  return formatted;
}
