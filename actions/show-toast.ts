// @ts-nocheck
"use client"

import { toast } from "../src/hooks/use-toast"

type Variant = "default" | "destructive"

interface ShowToastOptions {
  title?: string
  variant?: Variant
}

export function showToast(message: string, options: ShowToastOptions = {}) {
  const { title, variant = "default" } = options
  toast({ title, description: message, variant })
}
