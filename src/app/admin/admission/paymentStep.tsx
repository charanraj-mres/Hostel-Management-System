import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  useToast,
  Spinner,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from "@chakra-ui/react";

// Inline useScript hook
const useScript = (src: string): string => {
  const [status, setStatus] = useState<string>(src ? "loading" : "idle");

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }

    // Check if the script is already in the document
    let script = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement;

    if (!script) {
      // Create script element if it doesn't exist
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      // Store status in attribute on script
      const setAttributeFromEvent = (event: Event) => {
        script.setAttribute(
          "data-status",
          event.type === "load" ? "ready" : "error"
        );
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      // Grab existing script status from attribute and set to state
      setStatus(script.getAttribute("data-status") || "");
    }

    // Script event handler to update status in state
    const setStateFromEvent = (event: Event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    // Add event listeners
    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);

    // Remove event listeners on cleanup
    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);
      }
    };
  }, [src]);

  return status;
};

// Types
interface PaymentStepProps {
  formData: {
    studentId: string;
    studentName: string;
    email: string;
    contactNumber: string;
    hostelName: string;
    academicYear: string;
    feeAmount: number;
    securityDeposit: number;
    totalAmount: number;
    paymentId: string;
  };
  onPaymentSuccess: (paymentId: string, orderId: string) => void;
  errors: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
}

interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  onPaymentSuccess,
  errors,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const toast = useToast();

  // Load Razorpay script
  const razorpayStatus = useScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );

  useEffect(() => {
    if (paymentResult && paymentResult.success) {
      onPaymentSuccess(paymentResult.paymentId, paymentResult.orderId);
      toast({
        title: "Payment successful",
        description: `Payment ID: ${paymentResult.paymentId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setPaymentResult(null); // Reset paymentResult to avoid infinite toast
    }
  }, [paymentResult, onPaymentSuccess, toast]);

  const createOrder = async (): Promise<OrderResponse> => {
    try {
      setIsLoading(true);
      // Generate a shorter receipt ID
      const shortTimestamp = Date.now().toString().slice(-8); // Use only last 8 digits of timestamp
      const shortStudentId = formData.studentId.slice(0, 20); // Limit student ID length
      const receipt = `rcpt_${shortStudentId}_${shortTimestamp}`;

      const response = await fetch("http://localhost:5000/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: formData.totalAmount * 100, // Convert to paisa
          currency: "INR",
          receipt: receipt,
          notes: {
            studentName: formData.studentName,
            hostelName: formData.hostelName,
            admissionPeriod: formData.academicYear,
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData: OrderResponse = await response.json();
      return orderData;
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create payment order. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (razorpayStatus !== "ready") {
      toast({
        title: "Payment gateway not loaded",
        description:
          "Please wait for the payment gateway to load or refresh the page.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setPaymentProcessing(true);
      const orderData = await createOrder();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "University Hostel",
        description: "Hostel Admission Fee",
        order_id: orderData.id,
        handler: function (response: any) {
          verifyPayment(response, orderData);
        },
        prefill: {
          name: formData.studentName,
          email: formData.email,
          contact: formData.contactNumber,
        },
        notes: {
          address: "University Hostel Office",
        },
        theme: {
          color: "#319795",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description:
          "There was an error processing your payment. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const verifyPayment = async (
    paymentResponse: any,
    orderData: OrderResponse
  ): Promise<void> => {
    try {
      setPaymentProcessing(true);
      const response = await fetch("http://localhost:5000/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentResult({
          success: true,
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
        });
      } else {
        toast({
          title: "Payment Verification Failed",
          description:
            "Your payment could not be verified. Please contact support.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description:
          "There was an error verifying your payment. Please contact support.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Complete Payment
      </Heading>
      <Card p={4} mb={6}>
        <VStack spacing={4} align="stretch">
          <Text>
            Please complete the payment to finalize your hostel admission
            process.
          </Text>
          <Divider />
          <StatGroup>
            <Stat>
              <StatLabel>Hostel Fee</StatLabel>
              <StatNumber>₹{formData.feeAmount.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Security Deposit</StatLabel>
              <StatNumber>
                ₹{formData.securityDeposit.toLocaleString()}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Amount</StatLabel>
              <StatNumber>₹{formData.totalAmount.toLocaleString()}</StatNumber>
            </Stat>
          </StatGroup>
          <Divider />
          <FormControl isInvalid={!!errors.paymentId}>
            <FormLabel>Payment Status</FormLabel>
            {formData.paymentId ? (
              <HStack>
                <Text color="green.500">Payment Completed</Text>
                <Text>Payment ID: {formData.paymentId}</Text>
              </HStack>
            ) : (
              <Text color="orange.500">Payment Pending</Text>
            )}
            {errors.paymentId && (
              <FormErrorMessage>{errors.paymentId}</FormErrorMessage>
            )}
          </FormControl>
          {razorpayStatus !== "ready" && (
            <HStack>
              <Spinner size="sm" />
              <Text>Loading payment gateway...</Text>
            </HStack>
          )}
          {!formData.paymentId && (
            <Button
              colorScheme="teal"
              onClick={handlePayment}
              isLoading={isLoading || paymentProcessing}
              isDisabled={razorpayStatus !== "ready" || paymentProcessing}
              loadingText="Processing"
              size="lg"
              width="full"
            >
              Pay ₹{formData.totalAmount.toLocaleString()}
            </Button>
          )}
        </VStack>
      </Card>
    </Box>
  );
};

export default PaymentStep;
