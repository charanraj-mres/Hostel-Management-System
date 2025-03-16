"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signup } from "lib/auth";
import {
  Box,
  Button,
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
  Checkbox,
} from "@chakra-ui/react";
import DefaultAuthLayout from "layouts/auth/Default";
import Link from "next/link";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

export default function SignUp() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorBrand = useColorModeValue("brand.500", "white");
  const textColorDetails = useColorModeValue("gray.600", "gray.400");

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [Gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => setShow(!show);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signup(name, email, Gender, password);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Account created successfully!");
      router.push("/auth/sign-in"); // Redirect to login
    }
    setIsLoading(false);
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
          <Heading color={textColor} fontSize="36px" mb="10px">
            Sign Up
          </Heading>
          <Text mb="36px" ms="4px" color={textColorSecondary} fontSize="md">
            Create your account by entering email and password!
          </Text>
        </Box>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "420px",
            background: "transparent",
            borderRadius: "15px",
            margin: "auto",
            marginBottom: "20px",
          }}
        >
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doee"
              required
            />
          </FormControl>
          <FormControl mt={4}>
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
            <FormLabel>Gender</FormLabel>
            <Checkbox value="male" onChange={(e) => setGender(e.target.value)}>
              Male
            </Checkbox>
            <Checkbox
              value="female"
              onChange={(e) => setGender(e.target.value)}
            >
              Female
            </Checkbox>
            <Checkbox value="other" onChange={(e) => setGender(e.target.value)}>
              Other
            </Checkbox>
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
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Flex justifyContent="space-between" align="center" mb="24px">
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
            Sign Up
          </Button>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Link href="/auth/sign-in">
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Already have an account?
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500"
                >
                  Login
                </Text>
              </Text>
            </Link>
          </Flex>
        </form>
      </Flex>
    </DefaultAuthLayout>
  );
}
