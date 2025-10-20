"use client";

import { usePathname } from "next/navigation";
import { ProfileDropdown } from "@/components/profile-dropdown";

export function ConditionalProfileDropdown() {
  const pathname = usePathname();
  
  // Mostrar el ProfileDropdown solo si la ruta incluye "/dashboard"
  const isInDashboard = pathname?.includes("/dashboard/home");
  
  if (!isInDashboard) {
    return null;
  }
  
  return <ProfileDropdown />;
}
