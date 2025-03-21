"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Textarea,
  useToast,
  Text,
  Stack,
  Badge,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  HStack,
  Spinner,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import { db } from "config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "context/AuthContext";

export default function ComplaintPage() {
  const toast = useToast();
  const { user, userData, userType } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  interface Complaint {
    id: string;
    title: string;
    details: string;
    status: string;
    type: string;
    createdAt: Date;
    comments: any[];
  }

  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Form states
  const [complaintType, setComplaintType] = useState("mess");
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDetails, setComplaintDetails] = useState("");

  // UI colors
  const cardBg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("gray.50", "gray.800");

  // Status badge colors
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "in_progress":
        return "blue";
      case "resolved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  useEffect(() => {
    if (user && user.uid && userType === "student") {
      fetchStudentComplaints();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStudentComplaints = async () => {
    try {
      setIsLoading(true);
      const complaintsQuery = query(
        collection(db, "complaints"),
        where("studentId", "==", user?.uid || ""),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(complaintsQuery);
      const complaintsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        details: doc.data().details,
        status: doc.data().status,
        type: doc.data().type,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        comments: doc.data().comments || [],
      }));

      setComplaints(complaintsData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast({
        title: "Error",
        description: "Failed to load your complaints. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!complaintTitle.trim() || !complaintDetails.trim()) {
      toast({
        title: "Missing information",
        description:
          "Please provide both a title and details for your complaint.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Add complaint to Firestore - simplified without hostel block and warden details
      const complaintData = {
        type: complaintType,
        title: complaintTitle,
        details: complaintDetails,
        status: "pending",
        studentId: user?.uid || "",
        studentName: userData?.name || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        comments: [],
      };

      await addDoc(collection(db, "complaints"), complaintData);

      // Create general notification for all wardens
      await addDoc(collection(db, "notifications"), {
        userType: "warden", // Target all wardens instead of specific warden
        type: "complaint",
        message: `New complaint from ${
          userData?.name || "Unknown User"
        }: ${complaintTitle}`,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Complaint submitted",
        description: "Your complaint has been successfully submitted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setComplaintType("mess");
      setComplaintTitle("");
      setComplaintDetails("");

      // Refresh complaints list
      fetchStudentComplaints();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: "Failed to submit your complaint. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userType !== "student") {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center>
          <Text fontSize="xl">This page is only available for students.</Text>
        </Center>
      </Box>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={4}>
            Submit a Complaint
          </Heading>
          <Box
            as="form"
            onSubmit={handleSubmit}
            bg={cardBg}
            rounded="md"
            shadow="md"
            p={6}
          >
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Complaint Type</FormLabel>
                <Select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                >
                  <option value="mess">Mess Food</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="wifi">Wi-Fi Issues</option>
                  <option value="water">Water Supply</option>
                  <option value="electricity">Electricity Issues</option>
                  <option value="security">Security Concerns</option>
                  <option value="noise">Noise Complaints</option>
                  <option value="roommate">Roommate Issues</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Brief title for your complaint"
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Details</FormLabel>
                <Textarea
                  placeholder="Please provide detailed information about your complaint"
                  rows={5}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Submit Complaint
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>
            My Complaints
          </Heading>

          {isLoading ? (
            <Center p={8}>
              <Spinner size="xl" />
            </Center>
          ) : complaints.length === 0 ? (
            <Box textAlign="center" p={8} bg={cardBg} rounded="md" shadow="md">
              <Text fontSize="lg">
                You haven't submitted any complaints yet.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {complaints.map((complaint) => (
                <Card key={complaint.id} bg={cardBg} shadow="md">
                  <CardHeader bg={headerBg} py={3} px={6}>
                    <HStack justifyContent="space-between">
                      <Heading size="sm" noOfLines={1} title={complaint.title}>
                        {complaint.title}
                      </Heading>
                      <Badge colorScheme={getBadgeColor(complaint.status)}>
                        {complaint.status === "in_progress"
                          ? "In Progress"
                          : complaint.status.charAt(0).toUpperCase() +
                            complaint.status.slice(1)}
                      </Badge>
                    </HStack>
                  </CardHeader>

                  <CardBody px={6} py={4}>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      {complaint.type.charAt(0).toUpperCase() +
                        complaint.type.slice(1)}{" "}
                      Issue
                    </Text>
                    <Text noOfLines={3}>{complaint.details}</Text>
                  </CardBody>

                  <Divider />

                  <CardFooter px={6} py={3} justifyContent="space-between">
                    <Text fontSize="xs" color="gray.500">
                      Submitted: {formatDate(complaint.createdAt)}
                    </Text>

                    {complaint.comments && complaint.comments.length > 0 && (
                      <Badge colorScheme="purple">
                        {complaint.comments.length}{" "}
                        {complaint.comments.length === 1
                          ? "comment"
                          : "comments"}
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
