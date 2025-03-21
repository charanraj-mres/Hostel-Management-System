"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "context/AuthContext";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedUserTypes?: string | string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedUserTypes = [],
}) => {
  const { user, loading, userType, isEmailVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not logged in, redirect to login
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      // If email not verified, redirect to verification page
      if (user && !isEmailVerified) {
        router.push("/auth/verify-email");
        return;
      }

      // Check if there are user type restrictions
      if (allowedUserTypes && allowedUserTypes.length > 0) {
        // Convert allowedUserTypes to array if it's a string
        const allowedTypes =
          typeof allowedUserTypes === "string"
            ? [allowedUserTypes]
            : allowedUserTypes;

        // Handle comma-separated string format (from routes.js)
        const normalizedAllowedTypes = allowedTypes.flatMap((type) =>
          typeof type === "string" && type.includes(",")
            ? type.split(",").map((t) => t.trim())
            : type
        );

        // Check if current user type is allowed
        if (userType && !normalizedAllowedTypes.includes(userType)) {
          // Redirect to appropriate dashboard based on user type
          router.push("/admin/default");
          return;
        }
      }
    }
  }, [loading, user, userType, isEmailVerified, router, allowedUserTypes]);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <Flex
        height="100vh"
        width="100%"
        justifyContent="center"
        alignItems="center"
        direction="column"
        gap={4}
      >
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text>Loading...</Text>
      </Flex>
    );
  }

  // Don't render anything if not authorized
  if (!user || !isEmailVerified) {
    return null;
  }

  // Check user type restrictions
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    // Convert to array if string
    const allowedTypes =
      typeof allowedUserTypes === "string"
        ? [allowedUserTypes]
        : allowedUserTypes;

    // Handle comma-separated string format (from routes.js)
    const normalizedAllowedTypes = allowedTypes.flatMap((type) =>
      typeof type === "string" && type.includes(",")
        ? type.split(",").map((t) => t.trim())
        : type
    );

    if (userType && !normalizedAllowedTypes.includes(userType)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
