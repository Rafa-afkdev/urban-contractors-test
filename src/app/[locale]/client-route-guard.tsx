"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "../../../hooks/use-user";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ClientRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathName = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Memoize route calculations to avoid recalculating on every render
  const { routeWithoutLocale, isInAuthRoute, isProtectedRoute } = useMemo(() => {
    const parts = pathName.split("/").filter(Boolean);
    const routeWithoutLocale = parts.length > 1 ? `/${parts.slice(1).join("/")}` : "/";
    const authRoutes = ["/", "/auth", "/forgot-password"];
    const isInAuthRoute = authRoutes.includes(routeWithoutLocale);
    const isProtectedRoute = routeWithoutLocale.startsWith("/dashboard");
    
    return { routeWithoutLocale, isInAuthRoute, isProtectedRoute };
  }, [pathName]);

  // Handle redirects in useEffect to avoid hooks rule violations
  useEffect(() => {
    if (!loading) {
      // If user is authenticated and on auth routes, redirect to dashboard
      if (user && isInAuthRoute) {
        setIsRedirecting(true);
        router.push("/dashboard");
        return;
      }
      // If user is NOT authenticated and on protected routes, redirect to auth
      if (!user && isProtectedRoute) {
        setIsRedirecting(true);
        router.push("/auth");
        return;
      }
      // If no redirect is needed, stop showing loading
      setIsRedirecting(false);
    }
  }, [user, loading, isInAuthRoute, isProtectedRoute, router]);

  // Reduce spinner time by showing content faster when possible
  const shouldShowSpinner = loading || (isRedirecting && (user ? isInAuthRoute : isProtectedRoute));

  if (shouldShowSpinner) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
}
