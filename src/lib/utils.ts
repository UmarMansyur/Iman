import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorStatus(status: string) {
  if (status === "Aktif") return "bg-green-500"
  if (status === "Tidak Aktif") return "bg-red-500"
}
