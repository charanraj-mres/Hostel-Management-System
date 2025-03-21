"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
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
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { db } from "config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "context/AuthContext";

interface Complaint {
  id: string;
  title: string;
  type: string;
  studentName: string;
  studentId: string;
  details: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  comments?: {
    userId: string;
    userName: string;
    text: string;
    timestamp: Date;
  }[];
}

export default function WardenComplaintManagement() {
  const toast = useToast();
  const { user, userData, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(
    null
  );
  const [statusUpdate, setStatusUpdate] =
    useState<Complaint["status"]>("pending");
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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
    if (user && userType === "warden") {
      fetchAllComplaints();
    } else {
      setIsLoading(false);
    }
  }, [user, selectedTab]);

  const fetchAllComplaints = async () => {
    try {
      setIsLoading(true);
      let complaintsQuery;

      // Filter by status based on selected tab
      const statusFilters = ["pending", "in_progress", "resolved", "rejected"];
      const currentStatus = statusFilters[selectedTab];

      if (currentStatus) {
        complaintsQuery = query(
          collection(db, "complaints"),
          where("status", "==", currentStatus),
          orderBy("createdAt", "desc")
        );
      } else {
        complaintsQuery = query(
          collection(db, "complaints"),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(complaintsQuery);
      const complaintsData: Complaint[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        type: doc.data().type,
        studentName: doc.data().studentName,
        studentId: doc.data().studentId,
        details: doc.data().details,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        comments: doc.data().comments || [],
      }));

      // Filter by type if not "all"
      const filteredComplaints =
        filterType === "all"
          ? complaintsData
          : complaintsData.filter((complaint) => complaint.type === filterType);

      setComplaints(filteredComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast({
        title: "Error",
        description: "Failed to load complaints.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setCurrentComplaint(complaint);
    setStatusUpdate(complaint.status);
    setComment("");
    onOpen();
  };

  const handleUpdateComplaint = async () => {
    if (!currentComplaint) return;
    try {
      setIsUpdating(true);
      const complaintRef = doc(db, "complaints", currentComplaint.id);

      // Update the complaint
      await updateDoc(complaintRef, {
        status: statusUpdate,
        updatedAt: serverTimestamp(),
        ...(comment.trim()
          ? {
              comments: arrayUnion({
                userId: user?.uid,
                userName: userData?.name || "Warden",
                text: comment,
                timestamp: new Date(),
              }),
            }
          : {}),
      });

      // Create notification for student
      if (statusUpdate !== currentComplaint.status || comment.trim()) {
        await addDoc(collection(db, "notifications"), {
          userId: currentComplaint.studentId,
          type: "complaint_update",
          message: `Your complaint "${
            currentComplaint.title
          }" has been updated to "${statusUpdate}"${
            comment.trim() ? " with a new comment" : ""
          }`,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }

      toast({
        title: "Complaint updated",
        description: "The complaint has been successfully updated.",
        status: "success",
        duration: 5000,
      });

      fetchAllComplaints();
      onClose();
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast({
        title: "Error",
        description: "Failed to update complaint.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (userType !== "warden") {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center>
          <Text fontSize="xl">This page is only available for wardens.</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Stack spacing={6}>
        <Heading size="lg">Complaint Management</Heading>

        <HStack spacing={4}>
          <FormControl maxW="250px">
            <FormLabel>Filter by type</FormLabel>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setTimeout(() => fetchAllComplaints(), 0);
              }}
            >
              <option value="all">All Types</option>
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
          <Button
            colorScheme="blue"
            onClick={fetchAllComplaints}
            size="md"
            alignSelf="flex-end"
          >
            Refresh
          </Button>
        </HStack>

        <Tabs
          index={selectedTab}
          onChange={(index) => {
            setSelectedTab(index);
          }}
        >
          <TabList>
            <Tab>Pending</Tab>
            <Tab>In Progress</Tab>
            <Tab>Resolved</Tab>
            <Tab>Rejected</Tab>
          </TabList>

          <TabPanels>
            {["pending", "in_progress", "resolved", "rejected"].map(
              (status, index) => (
                <TabPanel key={status} p={0} pt={4}>
                  {isLoading ? (
                    <Center p={8}>
                      <Spinner size="xl" />
                    </Center>
                  ) : complaints.length === 0 ? (
                    <Box
                      textAlign="center"
                      p={8}
                      bg={cardBg}
                      rounded="md"
                      shadow="md"
                    >
                      <Text fontSize="lg">
                        No {status.replace("_", " ")} complaints found.
                      </Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {complaints.map((complaint) => (
                        <Card
                          key={complaint.id}
                          bg={cardBg}
                          shadow="md"
                          cursor="pointer"
                          onClick={() => handleViewComplaint(complaint)}
                        >
                          <CardHeader bg={headerBg} py={3} px={6}>
                            <HStack justifyContent="space-between">
                              <Heading
                                size="sm"
                                noOfLines={1}
                                title={complaint.title}
                              >
                                {complaint.title}
                              </Heading>
                              <Badge
                                colorScheme={getBadgeColor(complaint.status)}
                              >
                                {complaint.status === "in_progress"
                                  ? "In Progress"
                                  : complaint.status.charAt(0).toUpperCase() +
                                    complaint.status.slice(1)}
                              </Badge>
                            </HStack>
                          </CardHeader>

                          <CardBody px={6} py={4}>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              From: {complaint.studentName || "Unknown Student"}
                            </Text>
                            <Text fontSize="sm" color="gray.500" mb={2}>
                              Type:{" "}
                              {complaint.type.charAt(0).toUpperCase() +
                                complaint.type.slice(1)}
                            </Text>
                            <Text noOfLines={3}>{complaint.details}</Text>
                          </CardBody>

                          <Divider />

                          <CardFooter
                            px={6}
                            py={3}
                            justifyContent="space-between"
                          >
                            <Text fontSize="xs" color="gray.500">
                              Submitted: {formatDate(complaint.createdAt)}
                            </Text>

                            {complaint.comments &&
                              complaint.comments.length > 0 && (
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
                </TabPanel>
              )
            )}
          </TabPanels>
        </Tabs>
      </Stack>

      {/* Complaint Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Complaint Details
            <Badge
              ml={2}
              colorScheme={getBadgeColor(currentComplaint?.status || "pending")}
            >
              {currentComplaint?.status === "in_progress"
                ? "In Progress"
                : currentComplaint?.status?.charAt(0).toUpperCase() +
                  (currentComplaint?.status?.slice(1) || "")}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={4}>
              <Box>
                <Heading size="sm" mb={1}>
                  Title
                </Heading>
                <Text>{currentComplaint?.title}</Text>
              </Box>

              <Box>
                <Heading size="sm" mb={1}>
                  Student
                </Heading>
                <Text>{currentComplaint?.studentName}</Text>
              </Box>

              <Box>
                <Heading size="sm" mb={1}>
                  Type
                </Heading>
                <Text>
                  {currentComplaint?.type.charAt(0).toUpperCase() +
                    (currentComplaint?.type.slice(1) || "")}
                </Text>
              </Box>

              <Box>
                <Heading size="sm" mb={1}>
                  Details
                </Heading>
                <Text>{currentComplaint?.details}</Text>
              </Box>

              <Box>
                <Heading size="sm" mb={1}>
                  Submitted
                </Heading>
                <Text>
                  {currentComplaint?.createdAt
                    ? formatDate(currentComplaint.createdAt)
                    : ""}
                </Text>
              </Box>

              {currentComplaint?.comments &&
                currentComplaint.comments.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>
                      Comments
                    </Heading>
                    <Stack spacing={3}>
                      {currentComplaint.comments.map((comment, index) => (
                        <Box key={index} p={3} bg={headerBg} borderRadius="md">
                          <HStack mb={1}>
                            <Text fontWeight="bold">{comment.userName}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {comment.timestamp
                                ? formatDate(new Date(comment.timestamp))
                                : ""}
                            </Text>
                          </HStack>
                          <Text>{comment.text}</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

              <Divider />

              <FormControl>
                <FormLabel>Update Status</FormLabel>
                <Select
                  value={statusUpdate}
                  onChange={(e) =>
                    setStatusUpdate(e.target.value as Complaint["status"])
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Add Comment</FormLabel>
                <Textarea
                  placeholder="Add a comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdateComplaint}
              isLoading={isUpdating}
              loadingText="Updating"
            >
              Update Complaint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
