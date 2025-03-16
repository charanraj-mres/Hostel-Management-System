"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Button,
  Card,
  CardBody,
  Checkbox,
  Link,
  Divider,
} from "@nextui-org/react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { login } from "lib/auth";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Logged in successfully!");
      router.push("/dashboard"); // Redirect to dashboard
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    // Google sign-in implementation would go here
    // This is a placeholder for now
    toast.error("Google sign-in not implemented yet");
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardBody className="px-6 py-8">
        <Button
          startContent={<FcGoogle className="w-5 h-5" />}
          className="w-full mb-6 bg-gray-100 text-gray-800 font-medium"
          onClick={handleGoogleSignIn}
          size="lg"
        >
          Sign in with Google
        </Button>

        <div className="flex items-center gap-2 my-4">
          <Divider className="flex-1" />
          <span className="text-gray-500 text-sm">or</span>
          <Divider className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<EnvelopeIcon className="w-4 h-4 text-gray-400" />}
            placeholder="mail@example.com"
            isRequired
            classNames={{
              inputWrapper: "bg-white",
            }}
          />

          <Input
            label="Password"
            type={isVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<LockClosedIcon className="w-4 h-4 text-gray-400" />}
            endContent={
              <button
                type="button"
                onClick={toggleVisibility}
                className="focus:outline-none"
              >
                {isVisible ? (
                  <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <EyeIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
            }
            placeholder="Min. 8 characters"
            isRequired
            classNames={{
              inputWrapper: "bg-white",
            }}
          />

          <div className="flex justify-between items-center">
            <Checkbox
              size="sm"
              isSelected={rememberMe}
              onValueChange={setRememberMe}
            >
              <span className="text-sm">Keep me logged in</span>
            </Checkbox>

            <Link href="/auth/forgot-password" className="text-sm text-primary">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isLoading}
            size="lg"
            radius="md"
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Not registered yet?{" "}
            <Link href="/auth/sign-up" className="text-primary font-medium">
              Create an Account
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
