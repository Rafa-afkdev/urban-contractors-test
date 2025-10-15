"use client";

import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard/home" }: RoleGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (!user.rol || !allowedRoles.includes(user.rol)) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Check if user has permission
  if (!user || !user.rol || !allowedRoles.includes(user.rol)) {
    return null;
  }

  return <>{children}</>;
}
