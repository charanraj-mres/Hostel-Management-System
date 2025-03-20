"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Grid,
  GridItem,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  Tooltip,
  Heading,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Checkbox,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  SearchIcon,
} from "@chakra-ui/icons";

// Define interfaces
interface User {
  id: string;
  name: string;
  email: string;
  userType: string; // Changed from 'role'
  gender: string; // Added
  status: string; // Added
  uniqueId: string; // Added
}

interface Log {
  id: string;
  userId: string;
  timestamp: { seconds: number; nanoseconds: number };
  status: string;
  regularized: boolean;
  isLate: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  serverTime: { seconds: number; nanoseconds: number };
}

interface RegularizationRequest {
  id: string;
  userId: string;
  date: { seconds: number; nanoseconds: number };
  reason: string;
  inTime: string;
  outTime: string;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
  userName?: string;
}

export default function AdminAttendance() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [attendanceLogs, setAttendanceLogs] = useState<Log[]>([]);
  const [regularizationRequests, setRegularizationRequests] = useState<
    RegularizationRequest[]
  >([]);
  const [pendingRequests, setPendingRequests] = useState<
    RegularizationRequest[]
  >([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayLogs, setDayLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [calendarView, setCalendarView] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] =
    useState<RegularizationRequest | null>(null);

  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();
  const {
    isOpen: isRequestOpen,
    onOpen: onRequestOpen,
    onClose: onRequestClose,
  } = useDisclosure();

  const toast = useToast();
  const db = getFirestore();

  // Fetch users and departments
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userType", "==", "student")); // Changed from 'role'
        const querySnapshot = await getDocs(q);

        const usersData: User[] = [];

        querySnapshot.forEach((doc) => {
          const userData = { id: doc.id, ...doc.data() } as User;
          usersData.push(userData);
        });

        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    fetchUsers();
    fetchRegularizationRequests();
  }, []);

  // Fetch regularization requests
  const fetchRegularizationRequests = async () => {
    try {
      const regularizationRef = collection(db, "regularization");
      const q = query(regularizationRef, orderBy("createdAt", "desc"));

      onSnapshot(q, async (querySnapshot) => {
        const requests: RegularizationRequest[] = [];

        for (const docSnap of querySnapshot.docs) {
          const requestData = docSnap.data() as RegularizationRequest;
          requestData.id = docSnap.id;

          // Fetch user details
          try {
            const userDoc = await getDoc(doc(db, "users", requestData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              requestData.userName = userData.name;
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
          requests.push(requestData);
        }

        setRegularizationRequests(requests);
        setPendingRequests(requests.filter((req) => req.status === "Pending"));
      });
    } catch (error) {
      console.error("Error fetching regularization requests:", error);
    }
  };

  // Fetch attendance logs for a specific user
  const fetchUserAttendance = async (userId: string) => {
    try {
      setLoading(true);

      // Get user name
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setSelectedUserName(userData.name);
      }

      // Fetch attendance logs
      const attendanceRef = collection(db, "attendance");
      const q = query(
        attendanceRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const logs: Log[] = [];

      querySnapshot.forEach((doc) => {
        const logData = doc.data() as Log;
        logs.push({
          ...logData,
        });
      });

      setAttendanceLogs(logs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user attendance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    if (userId) {
      fetchUserAttendance(userId);
    } else {
      setAttendanceLogs([]);
    }
  };

  // Handle month change in calendar
  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentYear, currentMonth + increment);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  // Handle day click on calendar
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    // Get logs for the selected date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const filteredLogs = attendanceLogs.filter((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    setDayLogs(filteredLogs);
    onDetailsOpen();
  };

  // Handle regularization request approval/rejection
  const handleRegularizationAction = async (
    id: string,
    action: "Approved" | "Rejected"
  ) => {
    try {
      setLoading(true);

      // Update regularization request status
      const requestRef = doc(db, "regularization", id);
      await updateDoc(requestRef, {
        status: action,
        processedAt: Timestamp.now(),
      });

      // If approved, add regularized attendance records
      if (action === "Approved") {
        const requestDoc = await getDoc(requestRef);
        if (requestDoc.exists()) {
          const requestData = requestDoc.data() as RegularizationRequest;

          // Add punch in record if provided
          if (requestData.inTime) {
            const inDate = new Date(
              new Date(requestData.date.seconds * 1000).toDateString()
            );
            const [inHours, inMinutes] = requestData.inTime
              .split(":")
              .map(Number);
            inDate.setHours(inHours, inMinutes, 0, 0);

            // Add to attendance collection
            const attendanceRef = collection(db, "attendance");
            await updateDoc(doc(attendanceRef, generateRandomId()), {
              userId: requestData.userId,
              timestamp: Timestamp.fromDate(inDate),
              status: "Punched In",
              regularized: true,
              reason: requestData.reason,
              serverTime: Timestamp.now(),
            });
          }

          // Add punch out record if provided
          if (requestData.outTime) {
            const outDate = new Date(
              new Date(requestData.date.seconds * 1000).toDateString()
            );
            const [outHours, outMinutes] = requestData.outTime
              .split(":")
              .map(Number);
            outDate.setHours(outHours, outMinutes, 0, 0);

            // Add to attendance collection
            const attendanceRef = collection(db, "attendance");
            await updateDoc(doc(attendanceRef, generateRandomId()), {
              userId: requestData.userId,
              timestamp: Timestamp.fromDate(outDate),
              status: "Punched Out",
              regularized: true,
              reason: requestData.reason,
              serverTime: Timestamp.now(),
            });
          }
        }
      }

      toast({
        title: `Request ${action}`,
        description: `The regularization request has been ${action.toLowerCase()}`,
        status: action === "Approved" ? "success" : "info",
        duration: 5000,
        isClosable: true,
      });

      // Refresh requests
      fetchRegularizationRequests();

      // Refresh user attendance if the user is selected
      if (selectedUser) {
        fetchUserAttendance(selectedUser);
      }

      if (selectedRequest?.id === id) {
        onRequestClose();
      }

      setLoading(false);
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} the request`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Generate random ID for new attendance records
  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Filter users based on search and department filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  // View regularization request details
  const viewRequestDetails = (request: RegularizationRequest) => {
    setSelectedRequest(request);
    onRequestOpen();
  };

  // Format date for display
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calendar component
  const AttendanceCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create calendar grid
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Get status for each day
    const getStatusForDay = (day: number) => {
      if (!selectedUser) return "";

      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const dayLogs = attendanceLogs.filter((log) => {
        const logDate = new Date(log.timestamp.seconds * 1000);
        return logDate.toISOString().split("T")[0] === dateStr;
      });

      if (dayLogs.length === 0) {
        const currentDate = new Date(currentYear, currentMonth, day);
        const today = new Date();
        return currentDate > today ? "" : "absent";
      }

      // Check if day has both punch in and punch out
      const hasPunchIn = dayLogs.some((log) => log.status === "Punched In");
      const hasPunchOut = dayLogs.some((log) => log.status === "Punched Out");
      const isLate = dayLogs.some((log) => log.isLate);
      const isRegularized = dayLogs.some((log) => log.regularized);

      if (isRegularized) return "regularized";
      if (hasPunchIn && hasPunchOut) {
        return isLate ? "late" : "present";
      } else if (hasPunchIn) {
        return "missing-out";
      } else {
        return "absent";
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "present":
          return "green.500";
        case "absent":
          return "red.500";
        case "missing-out":
          return "orange.500";
        case "regularized":
          return "blue.500";
        case "late":
          return "yellow.500";
        default:
          return "gray.200";
      }
    };

    return (
      <Box w="100%" bg="white" p={4} borderRadius="md" shadow="md">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </Heading>
          <Flex>
            <Button size="sm" onClick={() => handleMonthChange(-1)} mr={2}>
              Previous
            </Button>
            <Button size="sm" onClick={() => handleMonthChange(1)}>
              Next
            </Button>
          </Flex>
        </Flex>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} textAlign="center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <GridItem key={day} fontWeight="bold" p={2}>
              {day}
            </GridItem>
          ))}

          {days.map((day, index) => {
            if (day === null) {
              return <GridItem key={`empty-${index}`} p={2}></GridItem>;
            }

            const status = getStatusForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentMonth &&
              new Date().getFullYear() === currentYear;

            return (
              <GridItem
                key={`day-${day}`}
                p={2}
                bg={getStatusColor(status)}
                color={status ? "white" : "black"}
                borderRadius="md"
                cursor={selectedUser ? "pointer" : "default"}
                onClick={() => {
                  if (selectedUser) {
                    handleDayClick(new Date(currentYear, currentMonth, day));
                  }
                }}
                _hover={{ opacity: selectedUser ? 0.8 : 1 }}
                border={isToday ? "2px solid black" : "none"}
                position="relative"
              >
                {day}
                {status === "regularized" && (
                  <Box
                    position="absolute"
                    bottom="2px"
                    right="2px"
                    w="3px"
                    h="3px"
                    borderRadius="full"
                    bg="white"
                  />
                )}
              </GridItem>
            );
          })}
        </Grid>

        <Flex mt={4} justifyContent="center" gap={4} flexWrap="wrap">
          <Badge colorScheme="green">Present</Badge>
          <Badge colorScheme="red">Absent</Badge>
          <Badge colorScheme="orange">Missing Punch Out</Badge>
          <Badge colorScheme="blue">Regularized</Badge>
          <Badge colorScheme="yellow">Late</Badge>
        </Flex>
      </Box>
    );
  };

  // Attendance Table
  const AttendanceTable = () => {
    // Group logs by date
    const groupedLogs = attendanceLogs.reduce((acc, log) => {
      const date = new Date(log.timestamp.seconds * 1000);
      const dateKey = date.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(log);
      return acc;
    }, {} as Record<string, Log[]>);

    // Sort dates in descending order
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
      <Box w="100%" bg="white" p={4} borderRadius="md" shadow="md">
        <Heading size="md" mb={4}>
          Attendance Records
        </Heading>
        {sortedDates.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No attendance records found.
          </Alert>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Punch In</Th>
                <Th>Punch Out</Th>
                <Th>Status</Th>
                <Th>Location</Th>
                <Th>Working Hours</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedDates.map((dateKey) => {
                const logs = groupedLogs[dateKey];
                const punchInLog = logs.find(
                  (log) => log.status === "Punched In"
                );
                const punchOutLog = logs.find(
                  (log) => log.status === "Punched Out"
                );

                const punchInTime = punchInLog
                  ? new Date(punchInLog.timestamp.seconds * 1000)
                  : null;

                const punchOutTime = punchOutLog
                  ? new Date(punchOutLog.timestamp.seconds * 1000)
                  : null;

                let workingHours = "";
                if (punchInTime && punchOutTime) {
                  const diffMs = punchOutTime.getTime() - punchInTime.getTime();
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  workingHours = `${hours}h ${minutes}m`;
                }

                const isLate = punchInLog?.isLate;
                const isRegularized = logs.some((log) => log.regularized);

                let status;
                if (punchInTime && punchOutTime) {
                  status = isLate ? "Late" : "Present";
                } else if (punchInTime) {
                  status = "Missing Punch Out";
                } else {
                  status = "Absent";
                }

                if (isRegularized) {
                  status = "Regularized";
                }

                return (
                  <Tr key={dateKey}>
                    <Td>{new Date(dateKey).toLocaleDateString()}</Td>
                    <Td>
                      {punchInTime ? (
                        <HStack>
                          <Text>
                            {punchInTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                          {isLate && (
                            <Badge colorScheme="red" size="sm">
                              Late
                            </Badge>
                          )}
                          {punchInLog?.regularized && (
                            <Badge colorScheme="blue" size="sm">
                              Regularized
                            </Badge>
                          )}
                        </HStack>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      {punchOutTime ? (
                        <HStack>
                          <Text>
                            {punchOutTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                          {punchOutLog?.regularized && (
                            <Badge colorScheme="blue" size="sm">
                              Regularized
                            </Badge>
                          )}
                        </HStack>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          status === "Present"
                            ? "green"
                            : status === "Late"
                            ? "yellow"
                            : status === "Missing Punch Out"
                            ? "orange"
                            : status === "Regularized"
                            ? "blue"
                            : "red"
                        }
                      >
                        {status}
                      </Badge>
                    </Td>
                    <Td>
                      {punchInLog?.location ? (
                        <Tooltip
                          label={`Lat: ${punchInLog.location.latitude}, Long: ${punchInLog.location.longitude}`}
                        >
                          <Button size="xs" colorScheme="blue">
                            View Map
                          </Button>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>{workingHours || "—"}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Box>
    );
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Heading mb={6}>Admin Attendance Management</Heading>

      <Tabs isLazy>
        <TabList>
          <Tab>Student Attendance</Tab>
          <Tab>
            Regularization Requests
            {pendingRequests.length > 0 && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {pendingRequests.length}
              </Badge>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          {/* Student Attendance Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap={6}>
              {/* Left Sidebar */}
              <GridItem>
                <VStack spacing={4} align="stretch">
                  <Box bg="white" p={4} borderRadius="md" shadow="md">
                    <Heading size="md" mb={4}>
                      Filter Students
                    </Heading>

                    <FormControl mb={4}>
                      <FormLabel>Search</FormLabel>
                      <Flex>
                        <Input
                          placeholder="Search by name, email or ID"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button ml={2}>
                          <SearchIcon />
                        </Button>
                      </Flex>
                    </FormControl>
                  </Box>

                  <Box
                    bg="white"
                    p={4}
                    borderRadius="md"
                    shadow="md"
                    maxH="500px"
                    overflowY="auto"
                  >
                    <Heading size="md" mb={4}>
                      Students
                    </Heading>
                    {filteredUsers.length === 0 ? (
                      <Alert status="info">
                        <AlertIcon />
                        No students found matching the criteria.
                      </Alert>
                    ) : (
                      <VStack spacing={2} align="stretch">
                        {filteredUsers.map((user) => (
                          <Box
                            key={user.id}
                            p={2}
                            borderRadius="md"
                            cursor="pointer"
                            bg={
                              selectedUser === user.id
                                ? "blue.50"
                                : "transparent"
                            }
                            _hover={{ bg: "gray.100" }}
                            onClick={() => handleUserSelect(user.id)}
                          >
                            <Flex align="center">
                              <Avatar size="sm" name={user.name} mr={2} />
                              <Box>
                                <Text fontWeight="bold">{user.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  ID: {user.uniqueId}
                                </Text>
                              </Box>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </GridItem>

              {/* Main Content */}
              <GridItem>
                {selectedUser ? (
                  <VStack spacing={4} align="stretch">
                    <Box bg="white" p={4} borderRadius="md" shadow="md">
                      <Flex justify="space-between" align="center">
                        <Heading size="md">
                          {selectedUserName}'s Attendance
                        </Heading>
                        <HStack>
                          <Button
                            size="sm"
                            leftIcon={<CalendarIcon />}
                            onClick={() => setCalendarView(true)}
                            colorScheme={calendarView ? "blue" : "gray"}
                          >
                            Calendar
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<InfoIcon />}
                            onClick={() => setCalendarView(false)}
                            colorScheme={!calendarView ? "blue" : "gray"}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>

                    {calendarView ? (
                      <AttendanceCalendar />
                    ) : (
                      <AttendanceTable />
                    )}
                  </VStack>
                ) : (
                  <Box
                    bg="white"
                    p={8}
                    borderRadius="md"
                    shadow="md"
                    textAlign="center"
                  >
                    <Heading size="md" color="gray.500">
                      Select a student to view attendance
                    </Heading>
                  </Box>
                )}
              </GridItem>
            </Grid>
          </TabPanel>

          {/* Regularization Requests Tab */}
          <TabPanel>
            <Grid templateColumns="1fr" gap={6}>
              <GridItem>
                <Box bg="white" p={4} borderRadius="md" shadow="md">
                  <Heading size="md" mb={4}>
                    Regularization Requests
                  </Heading>

                  <Tabs>
                    <TabList>
                      <Tab>Pending ({pendingRequests.length})</Tab>
                      <Tab>All Requests</Tab>
                    </TabList>

                    <TabPanels>
                      {/* Pending Requests */}
                      <TabPanel>
                        {pendingRequests.length === 0 ? (
                          <Alert status="info">
                            <AlertIcon />
                            No pending regularization requests.
                          </Alert>
                        ) : (
                          <Grid
                            templateColumns={{
                              base: "1fr",
                              md: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                            }}
                            gap={4}
                          >
                            {pendingRequests.map((request) => (
                              <Card key={request.id}>
                                <CardHeader>
                                  <Flex justify="space-between" align="center">
                                    <Heading size="sm">
                                      {request.userName || "Unknown User"}
                                    </Heading>
                                    <Badge colorScheme="yellow">Pending</Badge>
                                  </Flex>
                                </CardHeader>
                                <CardBody py={2}>
                                  <VStack align="start" spacing={1}>
                                    <Flex>
                                      <Text fontWeight="bold" w="80px">
                                        Date:
                                      </Text>
                                      <Text>{formatDate(request.date)}</Text>
                                    </Flex>
                                    <Flex>
                                      <Text fontWeight="bold" w="80px">
                                        In Time:
                                      </Text>
                                      <Text>{request.inTime || "N/A"}</Text>
                                    </Flex>
                                    <Flex>
                                      <Text fontWeight="bold" w="80px">
                                        Out Time:
                                      </Text>
                                      <Text>{request.outTime || "N/A"}</Text>
                                    </Flex>
                                    <Flex>
                                      <Text fontWeight="bold" w="80px">
                                        Reason:
                                      </Text>
                                      <Text noOfLines={2}>
                                        {request.reason}
                                      </Text>
                                    </Flex>
                                  </VStack>
                                </CardBody>
                                <CardFooter pt={2}>
                                  <HStack spacing={2} width="100%">
                                    <Button
                                      size="sm"
                                      colorScheme="blue"
                                      width="100%"
                                      onClick={() =>
                                        viewRequestDetails(request)
                                      }
                                    >
                                      View Details
                                    </Button>
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      leftIcon={<CheckIcon />}
                                      onClick={() =>
                                        handleRegularizationAction(
                                          request.id,
                                          "Approved"
                                        )
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      colorScheme="red"
                                      leftIcon={<CloseIcon />}
                                      onClick={() =>
                                        handleRegularizationAction(
                                          request.id,
                                          "Rejected"
                                        )
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </HStack>
                                </CardFooter>
                              </Card>
                            ))}
                          </Grid>
                        )}
                      </TabPanel>

                      {/* All Requests */}
                      <TabPanel>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Student</Th>
                              <Th>ID</Th> {/* Replace Department with ID */}
                              <Th>Date</Th>
                              <Th>Punch Times</Th>
                              <Th>Reason</Th>
                              <Th>Status</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {regularizationRequests.map((request) => (
                              <Tr key={request.id}>
                                <Td>{request.userName || "Unknown"}</Td>
                                <Td>
                                  {users.find((u) => u.id === request.userId)
                                    ?.uniqueId || "Unknown"}
                                </Td>
                                <Td>{formatDate(request.date)}</Td>
                                <Td>
                                  {request.inTime || "N/A"} -{" "}
                                  {request.outTime || "N/A"}
                                </Td>
                                <Td>{request.reason}</Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      request.status === "Approved"
                                        ? "green"
                                        : request.status === "Rejected"
                                        ? "red"
                                        : "yellow"
                                    }
                                  >
                                    {request.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => viewRequestDetails(request)}
                                  >
                                    View Details
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Day Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedDate.toLocaleDateString()} - {selectedUserName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {dayLogs.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No attendance records found for this day.
              </Alert>
            ) : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Status</Th>
                    <Th>Info</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dayLogs.map((log) => (
                    <Tr key={log.id}>
                      <Td>{formatTime(log.timestamp)}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            log.status === "Punched In" ? "green" : "red"
                          }
                        >
                          {log.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack>
                          {log.isLate && (
                            <Badge colorScheme="yellow">Late</Badge>
                          )}
                          {log.regularized && (
                            <Badge colorScheme="blue">Regularized</Badge>
                          )}
                          {log.regularized && (
                            <Tooltip label="Regularized">
                              <InfoIcon />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Regularization Request Details Modal */}
      <Modal isOpen={isRequestOpen} onClose={onRequestClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Regularization Request Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <VStack spacing={4} align="stretch">
                <Flex>
                  <Box w="50%">
                    <Text fontWeight="bold">Student Name</Text>
                    <Text>{selectedRequest.userName || "Unknown"}</Text>
                  </Box>
                  <Box w="50%">
                    <Text fontWeight="bold">Student ID</Text>
                    <Text>
                      {users.find((u) => u.id === selectedRequest.userId)
                        ?.uniqueId || "Unknown"}
                    </Text>
                  </Box>
                </Flex>
                <Divider />
                <Flex>
                  <Box w="50%">
                    <Text fontWeight="bold">Date</Text>
                    <Text>{formatDate(selectedRequest.date)}</Text>
                  </Box>
                  <Box w="50%">
                    <Text fontWeight="bold">Status</Text>
                    <Badge
                      colorScheme={
                        selectedRequest.status === "Approved"
                          ? "green"
                          : selectedRequest.status === "Rejected"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {selectedRequest.status}
                    </Badge>
                  </Box>
                </Flex>
                <Divider />
                <Flex>
                  <Box w="50%">
                    <Text fontWeight="bold">Punch In Time</Text>
                    <Text>{selectedRequest.inTime || "Not Requested"}</Text>
                  </Box>
                  <Box w="50%">
                    <Text fontWeight="bold">Punch Out Time</Text>
                    <Text>{selectedRequest.outTime || "Not Requested"}</Text>
                  </Box>
                </Flex>
                <Divider />
                <Box>
                  <Text fontWeight="bold">Reason</Text>
                  <Text>{selectedRequest.reason}</Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold">Request Date</Text>
                  <Text>
                    {formatDate(selectedRequest.createdAt)}{" "}
                    {formatTime(selectedRequest.createdAt)}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedRequest && selectedRequest.status === "Pending" && (
              <>
                <Button
                  colorScheme="green"
                  mr={3}
                  onClick={() =>
                    handleRegularizationAction(selectedRequest.id, "Approved")
                  }
                >
                  Approve
                </Button>
                <Button
                  colorScheme="red"
                  mr={3}
                  onClick={() =>
                    handleRegularizationAction(selectedRequest.id, "Rejected")
                  }
                >
                  Reject
                </Button>
              </>
            )}
            <Button onClick={onRequestClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
