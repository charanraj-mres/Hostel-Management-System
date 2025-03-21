"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "context/AuthContext";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  VStack,
} from "@chakra-ui/react";
// Custom components
import DefaultAuthLayout from "layouts/auth/Default";
import { MdLock, MdHome } from "react-icons/md";

export default function Unauthorized() {
  const { userType } = useAuth();
  const router = useRouter();

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const primaryButtonBg = useColorModeValue("brand.500", "brand.400");

  const handleGoHome = () => {
    router.push("/admin/default");
  };

  return (
    <DefaultAuthLayout illustrationBackground={"/img/auth/auth.png"}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="100%"
        alignItems="center"
        justifyContent="center"
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection="column"
      >
        <Box textAlign="center" mb={10}>
          <Icon as={MdLock} w={20} h={20} color="red.500" mb={4} />
          <Heading color={textColor} fontSize="36px" mb="10px">
            Access Denied
          </Heading>
          <Text
            mb="36px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            You don't have permission to access this page.
            {userType && (
              <Text fontWeight="500" mt={2}>
                Your current role: {userType}
              </Text>
            )}
          </Text>

          <VStack spacing={4} align="center">
            <Button
              onClick={handleGoHome}
              leftIcon={<MdHome />}
              bg={primaryButtonBg}
              color="white"
              fontSize="sm"
              fontWeight="500"
              w="200px"
              h="50"
              _hover={{ bg: "brand.600" }}
            >
              Go to Dashboard
            </Button>
          </VStack>
        </Box>
      </Flex>
    </DefaultAuthLayout>
  );
}
