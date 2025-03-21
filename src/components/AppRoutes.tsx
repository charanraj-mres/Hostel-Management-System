"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "context/AuthContext";
import ProtectedRoute from "components/ProtectedRoute";
import routes from "routes";

// Main layout wrapper that handles route protection
export default function AppRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Skip protection for auth pages
  const isAuthPage = pathname.startsWith("/auth/");
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Find the current route configuration
  const currentRoute = routes.find((route) => {
    const fullPath = `${route.layout}${route.path}`;
    return pathname === fullPath;
  });

  // If no specific route found, apply default protection (require authentication)
  if (!currentRoute) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  // Get allowed user types for this route
  const allowedUserTypes = currentRoute.userType;

  return (
    <ProtectedRoute allowedUserTypes={allowedUserTypes}>
      {children}
    </ProtectedRoute>
  );
}
