/* eslint-disable */

// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import { IRoute } from "types/navigation";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { AuthProvider } from "context/AuthContext";
interface SidebarLinksProps {
  routes: IRoute[];
}

export function SidebarLinks(props: SidebarLinksProps) {
  const { routes } = props;
  const [userType, setUserType] = useState<string>("");
  const [filteredRoutes, setFilteredRoutes] = useState<IRoute[]>([]);
  const user = AuthProvider;
  console.log(user.name);
  // Chakra color mode
  const pathname = usePathname();

  let activeColor = useColorModeValue("gray.700", "white");
  let inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600"
  );
  let activeIcon = useColorModeValue("brand.500", "white");
  let textColor = useColorModeValue("secondaryGray.500", "white");
  let brandColor = useColorModeValue("brand.500", "brand.400");

  // Fetch user type from Firestore
  useEffect(() => {
    const getUserType = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          // First try direct lookup by UID
          const userDocRef = doc(db, "users", currentUser.uid);
          let userDoc = await getDoc(userDocRef);

          // If not found, query by email
          if (!userDoc.exists()) {
            const q = query(
              collection(db, "users"),
              where("email", "==", currentUser.email),
              where("status", "==", "active")
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              userDoc = querySnapshot.docs[0];
            }
          }

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserType(userData.userType || "");
          }
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };

    getUserType();
  }, []);
  console.log(filteredRoutes);

  // Filter routes based on user type
  useEffect(() => {
    if (!userType) {
      setFilteredRoutes(routes.filter((route) => !route.userType)); // Only routes with no userType specified
      return;
    }

    const filtered = routes.filter((route) => {
      // If no userType is specified, show to all users
      if (!route.userType) return true;

      // Check if user type is in the comma-separated list
      const allowedTypes = (
        typeof route.userType === "string"
          ? route.userType
          : route.userType.join(",")
      )
        .split(",")
        .map((type: string) => type.trim());
      return allowedTypes.includes(userType);
    });

    setFilteredRoutes(filtered);
  }, [routes, userType]);

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname]
  );

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, index: number) => {
      if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        return (
          <Link key={index} href={route.layout + route.path}>
            {route.icon ? (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="5px"
                  ps="10px"
                >
                  <Flex w="100%" alignItems="center" justifyContent="center">
                    <Box
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeIcon
                          : textColor
                      }
                      me="18px"
                    >
                      {route.icon}
                    </Box>
                    <Text
                      me="auto"
                      color={
                        activeRoute(route.path.toLowerCase())
                          ? activeColor
                          : textColor
                      }
                      fontWeight={
                        activeRoute(route.path.toLowerCase())
                          ? "bold"
                          : "normal"
                      }
                    >
                      {route.name}
                    </Text>
                  </Flex>
                  <Box
                    h="36px"
                    w="4px"
                    bg={
                      activeRoute(route.path.toLowerCase())
                        ? brandColor
                        : "transparent"
                    }
                    borderRadius="5px"
                  />
                </HStack>
              </Box>
            ) : (
              <Box>
                <HStack
                  spacing={
                    activeRoute(route.path.toLowerCase()) ? "22px" : "26px"
                  }
                  py="5px"
                  ps="10px"
                >
                  <Text
                    me="auto"
                    color={
                      activeRoute(route.path.toLowerCase())
                        ? activeColor
                        : inactiveColor
                    }
                    fontWeight={
                      activeRoute(route.path.toLowerCase()) ? "bold" : "normal"
                    }
                  >
                    {route.name}
                  </Text>
                  <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                </HStack>
              </Box>
            )}
          </Link>
        );
      }
    });
  };
  //  BRAND
  return <>{createLinks(filteredRoutes)}</>;
}

export default SidebarLinks;
