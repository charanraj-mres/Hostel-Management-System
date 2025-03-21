"use client";
/* eslint-disable */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { login, resendVerificationEmail } from "lib/auth";
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Badge,
} from "@chakra-ui/react";
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuthLayout from "layouts/auth/Default";
// Assets
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

export default function SignIn() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "gray.200" },
    { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
  );

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [showAlert, setShowAlert] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userTypeParam = searchParams?.get("userType");
    if (userTypeParam) {
      setUserType(userTypeParam);
    }
  }, [searchParams]);

  const handleClick = () => setShow(!show);

  const getUserTypeDisplay = () => {
    switch (userType) {
      case "warden":
        return "Warden";
      case "parent":
        return "Parent";
      case "staff":
        return "Staff";
      case "student":
        return "Student";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false);

    const result = await login(email, password);

    if (result.error) {
      if (result.needsVerification) {
        setVerificationNeeded(true);
        setAlertStatus("warning");
        setAlertMessage(
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
        setShowAlert(true);
      } else {
        toast.error(result.error);
        setAlertStatus("error");
        setAlertMessage(result.error);
        setShowAlert(true);
      }
    } else {
      toast.success("Logged in successfully!");
      router.push("/admin/default");
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    const result = await resendVerificationEmail();
    if (result.success) {
      toast.success("Verification email sent successfully!");
      setAlertStatus("success");
      setAlertMessage(
        "Verification email sent! Please check your inbox and spam folder."
      );
      setShowAlert(true);
    } else {
      toast.error(result.error || "Failed to send verification email");
      setAlertStatus("error");
      setAlertMessage(result.error || "Failed to send verification email");
      setShowAlert(true);
    }
    setResendingEmail(false);
  };

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
        <Box me="auto">
          <Flex alignItems="center" mb="10px">
            <Heading color={textColor} fontSize="36px">
              Sign In
            </Heading>
            {userType && (
              <Badge colorScheme="blue" ml={3} fontSize="md" p={2}>
                {getUserTypeDisplay()}
              </Badge>
            )}
          </Flex>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            {userType
              ? `Enter your email and password to sign in as ${getUserTypeDisplay()}!`
              : "Enter your email and password to sign in!"}
          </Text>
        </Box>

        {showAlert && (
          <Alert status={alertStatus} mb="4" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>
                {alertStatus === "error"
                  ? "Error"
                  : alertStatus === "warning"
                  ? "Warning"
                  : "Success"}
              </AlertTitle>
              <AlertDescription display="block">
                {alertMessage}
                {verificationNeeded && (
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={handleResendVerification}
                    isLoading={resendingEmail}
                    ml="2"
                    mt="1"
                  >
                    Resend verification email
                  </Button>
                )}
              </AlertDescription>
            </Box>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setShowAlert(false)}
            />
          </Alert>
        )}

        <Flex
          as="form"
          onSubmit={handleSubmit}
          zIndex="2"
          direction="column"
          w={{ base: "100%", md: "420px" }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: "auto", lg: "unset" }}
          me="auto"
          mb={{ base: "20px", md: "auto" }}
        >
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.com"
              required
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
              />
              <InputRightElement>
                <Icon
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                  cursor="pointer"
                />
              </InputRightElement>
            </InputGroup>
            <Flex justifyContent="space-between" align="center" mb="24px">
              <FormControl display="flex" alignItems="center">
                <Checkbox
                  id="remember-login"
                  colorScheme="brandScheme"
                  me="10px"
                />
                <FormLabel
                  htmlFor="remember-login"
                  mb="0"
                  fontWeight="normal"
                  color={textColor}
                  fontSize="sm"
                >
                  Keep me logged in
                </FormLabel>
              </FormControl>
              <Link href="/auth/forgot-password">
                <Text
                  color={textColorBrand}
                  fontSize="sm"
                  w="124px"
                  fontWeight="500"
                >
                  Forgot password?
                </Text>
              </Link>
            </Flex>
            <Button
              type="submit"
              isLoading={isLoading}
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
            >
              {userType ? `Sign In as ${getUserTypeDisplay()}` : "Sign In"}
            </Button>
          </FormControl>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Link href="/auth/sign-up">
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Not registered yet?
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500"
                >
                  Create an Account
                </Text>
              </Text>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuthLayout>
  );
}
