import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, monthFormat: 'long' | 'short' = 'long') {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: monthFormat,
    day: 'numeric'
  });
}

export const formatShortDate = (date: string | Date) => formatDate(date, 'short');
