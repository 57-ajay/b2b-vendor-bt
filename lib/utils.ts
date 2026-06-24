import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui class-name helper: merge conditional class names and resolve
 * Tailwind conflicts. Kept available for any shadcn primitives added later.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
