"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "context/AuthContext";
import { resendVerificationEmail, logout } from "lib/auth";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from "@chakra-ui/react";
// Custom components
import DefaultAuthLayout from "layouts/auth/Default";
// Assets
import Link from "next/link";
import { MdEmail, MdRefresh, MdLogout } from "react-icons/md";

export default function VerifyEmail() {
  const { user, isEmailVerified } = useAuth();
  const router = useRouter();

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "info" | "success" | "error" | "warning"
  >("info");
  const [resendCountdown, setResendCountdown] = useState(0);

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorBrand = useColorModeValue("brand.500", "white");

  // Check if user is authenticated and redirect if already verified
  useEffect(() => {
    if (!user) {
      router.push("/auth/sign-in");
    } else if (isEmailVerified) {
      router.push("/admin/default");
    }
  }, [user, isEmailVerified, router]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendVerification = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    const result = await resendVerificationEmail();

    if (result.success) {
      setMessage(
        "Verification email sent! Please check your inbox and spam folder."
      );
      setMessageType("success");
      setResendCountdown(60); // 60 second cooldown
    } else {
      setMessage(result.error || "Failed to send verification email");
      setMessageType("error");
    }

    setIsResending(false);
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/sign-in");
  };

  const handleRefreshStatus = () => {
    // Force refresh of the page to check email verification status
    window.location.reload();
  };

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <DefaultAuthLayout illustrationBackground={"/img/auth/auth.png"}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection="column"
      >
        <Box me="auto" width="100%" maxW="420px">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Verify Your Email
          </Heading>
          <Text
            mb="20px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Please verify your email address to continue
          </Text>

          <VStack spacing={6} align="stretch" mb={8}>
            <Alert
              status="info"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              py={6}
            >
              <Icon as={MdEmail} boxSize="40px" mb={4} color="blue.400" />
              <AlertTitle mt={0} mb={3} fontSize="lg">
                Verification Email Sent
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                We've sent a verification email to{" "}
                <Text as="span" fontWeight="bold">
                  {user.email}
                </Text>
                . Click the link in the email to verify your account.
              </AlertDescription>
            </Alert>

            {message && (
              <Alert status={messageType} borderRadius="md">
                <AlertIcon />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <VStack spacing={4}>
              <Button
                onClick={handleResendVerification}
                isLoading={isResending}
                isDisabled={resendCountdown > 0}
                leftIcon={<MdEmail />}
                colorScheme="blue"
                width="100%"
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : "Resend Verification Email"}
              </Button>

              <Button
                onClick={handleRefreshStatus}
                leftIcon={<MdRefresh />}
                colorScheme="green"
                variant="outline"
                width="100%"
              >
                I've Verified My Email
              </Button>

              <Button
                onClick={handleSignOut}
                leftIcon={<MdLogout />}
                variant="ghost"
                width="100%"
              >
                Sign Out
              </Button>
            </VStack>
          </VStack>

          <HStack justifyContent="center" spacing={2}>
            <Text color={textColorSecondary} fontSize="sm">
              Need help?
            </Text>
            <Link href="/contact-support">
              <Text color={textColorBrand} fontSize="sm" fontWeight="medium">
                Contact Support
              </Text>
            </Link>
          </HStack>
        </Box>
      </Flex>
    </DefaultAuthLayout>
  );
}
