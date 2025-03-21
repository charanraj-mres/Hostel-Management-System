"use client";
// Chakra Imports
import {
  Box,
  Button,
  Center,
  Flex,
  Icon,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
// Custom Components
import { ItemContent } from "components/menu/ItemContent";
import { SearchBar } from "components/navbar/searchBar/SearchBar";
import { SidebarResponsive } from "components/sidebar/Sidebar";
// Assets
import { FaEthereum } from "react-icons/fa";
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import { MdInfoOutline, MdNotificationsNone, MdVerified } from "react-icons/md";
import routes from "routes";
// Auth Imports
import { useAuth } from "context/AuthContext";
import { logout } from "lib/auth";

export default function HeaderLinks(props: {
  secondary: boolean;
  onOpen: boolean | any;
  fixed: boolean | any;
}) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, userData, userType, isEmailVerified } = useAuth();

  // Chakra Color Mode
  const navbarIcon = useColorModeValue("gray.400", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.700", "brand.400");
  const ethColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const ethBox = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  const borderButton = useColorModeValue("secondaryGray.500", "whiteAlpha.200");

  const filteredRoutes = routes.filter((route) => {
    // If the route has no userType restriction
    if (!route.userType) {
      return true; // Show to all users
    }

    // If userType is an array (multiple types allowed)
    if (userType && Array.isArray(route.userType)) {
      return route.userType.includes(userType);
    }

    // If userType is a string (single type)
    if (userType && typeof route.userType === "string") {
      return route.userType === userType;
    }

    return false;
  });

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        // Redirect to login page after logout
        window.location.href = "/auth/sign-in";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const userInitials = userData?.name
    ? userData.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Flex
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SearchBar
        mb={() => {
          if (secondary) {
            return { base: "10px", md: "unset" };
          }
          return "unset";
        }}
        me="10px"
        borderRadius="30px"
      />

      {userType === "warden" && (
        <Flex
          bg={ethBg}
          display={secondary ? "flex" : "none"}
          borderRadius="30px"
          ms="auto"
          p="6px"
          align="center"
          me="6px"
        >
          <Text
            w="max-content"
            color={ethColor}
            fontSize="sm"
            fontWeight="700"
            me="6px"
          >
            Admin Dashboard
          </Text>
        </Flex>
      )}

      <SidebarResponsive routes={filteredRoutes} />

      <Button
        variant="no-hover"
        bg="transparent"
        p="0px"
        minW="unset"
        minH="unset"
        h="18px"
        w="max-content"
        onClick={toggleColorMode}
      >
        <Icon
          me="10px"
          h="18px"
          w="18px"
          color={navbarIcon}
          as={colorMode === "light" ? IoMdMoon : IoMdSunny}
        />
      </Button>

      <Menu>
        <MenuButton p="0px" style={{ position: "relative" }}>
          <Box
            _hover={{ cursor: "pointer" }}
            color="white"
            bg="#11047A"
            w="40px"
            h="40px"
            borderRadius={"50%"}
          />
          <Center top={0} left={0} position={"absolute"} w={"100%"} h={"100%"}>
            <Text fontSize={"xs"} fontWeight="bold" color={"white"}>
              {userInitials}
            </Text>
          </Center>
          {!isEmailVerified && user && (
            <Badge
              position="absolute"
              top="-5px"
              right="-5px"
              colorScheme="red"
              borderRadius="full"
            >
              !
            </Badge>
          )}
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋&nbsp; Hey, {userData?.name || "User"}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            {!isEmailVerified && user && (
              <MenuItem
                _hover={{ bg: "none" }}
                _focus={{ bg: "none" }}
                borderRadius="8px"
                px="14px"
                color="orange.500"
              >
                <Flex align="center">
                  <Icon as={MdInfoOutline} mr="5px" />
                  <Text fontSize="sm">Verify Email</Text>
                </Flex>
              </MenuItem>
            )}

            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>

            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              color="red.400"
              borderRadius="8px"
              px="14px"
              onClick={handleLogout}
            >
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
