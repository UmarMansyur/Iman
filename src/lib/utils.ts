import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateIndonesia = (date: Date | undefined) => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  if (!date) return "";

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatProduction = (amount: number) => {
  const balAmount = Math.floor(amount / 200);
  const packAmount = amount % 200;
  
  if (balAmount < 1) {
    return {
      pack: amount,
      bal: 0
    };
  }
  
  return {
    pack: packAmount,
    bal: balAmount
  };
};