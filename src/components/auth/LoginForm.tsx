"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { login } from "@/lib/auth";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  return (
    <Card className="w-full max-w-md">
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<EnvelopeIcon className="w-4 h-4" />}
            isRequired
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<LockClosedIcon className="w-4 h-4" />}
            isRequired
          />
          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
