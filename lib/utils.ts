import { Profile } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GetProfileFullName = (profile?: Profile | null) => {
  return `${profile?.first_name ?? ''} ${profile?.middle_name ? profile.middle_name + "." : ""} ${profile?.last_name ?? ''}`
}