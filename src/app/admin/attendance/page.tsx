"use client";
import { useState, useEffect, useRef } from "react";
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
  FormControl,
  FormLabel,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  Grid,
  GridItem,
  Badge,
  Flex,
} from "@chakra-ui/react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  getFirestore,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Log {
  id: string;
  timestamp: { seconds: number };
  status: string;
  regularized: boolean;
}

// Calendar component
interface CalendarProps {
  logs: Log[];
  month: number;
  year: number;
  onDayClick: (date: Date) => void;
}

const Calendar = ({ logs, month, year, onDayClick }: CalendarProps) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      return logDate.toISOString().split("T")[0] === dateStr;
    });

    if (dayLogs.length === 0) {
      const today = new Date();
      const currentDate = new Date(year, month, day);
      return currentDate > today ? "" : "absent";
    }

    // Check if day has both punch in and punch out
    const hasPunchIn = dayLogs.some((log) => log.status === "Punched In");
    const hasPunchOut = dayLogs.some((log) => log.status === "Punched Out");

    if (hasPunchIn && hasPunchOut) {
      return "present";
    } else if (hasPunchIn) {
      return "missing-out";
    } else {
      // Check if this was regularized
      return dayLogs.some((log: Log) => log.regularized)
        ? "regularized"
        : "absent";
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
          return (
            <GridItem
              key={`day-${day}`}
              p={2}
              bg={getStatusColor(status)}
              color={status ? "white" : "black"}
              borderRadius="md"
              cursor="pointer"
              onClick={() => onDayClick(new Date(year, month, day))}
              _hover={{ opacity: 0.8 }}
            >
              {day}
            </GridItem>
          );
        })}
      </Grid>

      <Flex mt={4} justifyContent="center" gap={4}>
        <Badge colorScheme="green">Present</Badge>
        <Badge colorScheme="red">Absent</Badge>
        <Badge colorScheme="orange">Missing Punch Out</Badge>
        <Badge colorScheme="blue">Regularized</Badge>
        <Badge colorScheme="yellow">Late</Badge>
      </Flex>
    </Box>
  );
};

export default function Attendance() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchLog, setPunchLog] = useState<Log[]>([]);
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const {
    isOpen: isRegularizeOpen,
    onOpen: onRegularizeOpen,
    onClose: onRegularizeClose,
  } = useDisclosure();
  const {
    isOpen: isDayDetailsOpen,
    onOpen: onDayDetailsOpen,
    onClose: onDayDetailsClose,
  } = useDisclosure();

  const [regularizationData, setRegularizationData] = useState({
    date: new Date(),
    reason: "",
    inTime: "",
    outTime: "",
  });

  interface Log {
    id: string;
    timestamp: { seconds: number };
    status: string;
    regularized: boolean;
  }

  const [dayLogs, setDayLogs] = useState<Log[]>([]);
  const toast = useToast();
  const db = getFirestore();
  const auth = getAuth();

  // Fetch location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description:
              "Unable to get your location. Please enable location services.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    }

    // Check for authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserLogs(user.uid);
      } else {
        // Redirect to login or handle unauthenticated state
        toast({
          title: "Authentication required",
          description: "Please login to use the attendance system.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if user is already punched in for today
  useEffect(() => {
    if (userId) {
      checkPunchStatus();
    }
  }, [userId]);

  const checkPunchStatus = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendanceRef = collection(db, "attendance");
      const q = query(
        attendanceRef,
        where("userId", "==", userId),
        where("timestamp", ">=", Timestamp.fromDate(today)),
        where("timestamp", "<", Timestamp.fromDate(tomorrow))
      );

      const querySnapshot = await getDocs(q);
      const todayLogs: Log[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todayLogs.push({
          id: doc.id,
          timestamp: data.timestamp,
          status: data.status,
          regularized: data.regularized,
        });
      });

      // Check if last log is a punch in (no punch out yet)
      if (todayLogs.length > 0) {
        const lastLog = todayLogs.sort(
          (a, b) => b.timestamp.seconds - a.timestamp.seconds
        )[0];

        setIsPunchedIn(lastLog.status === "Punched In");
      }
    } catch (error) {
      console.error("Error checking punch status:", error);
    }
  };

  const fetchUserLogs = async (uid: string) => {
    try {
      const attendanceRef = collection(db, "attendance");
      const q = query(attendanceRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);

      const logs: Log[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          timestamp: data.timestamp,
          status: data.status,
          regularized: data.regularized,
        });
      });

      setPunchLog(
        logs.sort((a: Log, b: Log) => b.timestamp.seconds - a.timestamp.seconds)
      );
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePunch = async () => {
    if (!location.latitude || !location.longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location services to record attendance",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const currentTime = new Date();
      const newStatus = isPunchedIn ? "Punched Out" : "Punched In";

      // Check for late punch-in (after 9:30 AM)
      let isLate = false;
      if (newStatus === "Punched In") {
        const lateThreshold = new Date(currentTime);
        lateThreshold.setHours(9, 30, 0, 0);
        isLate = currentTime > lateThreshold;
      }

      const logData = {
        userId,
        timestamp: Timestamp.fromDate(currentTime),
        status: newStatus,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        isLate,
        regularized: false,
      };

      // Add log to Firestore
      const docRef = await addDoc(collection(db, "attendance"), logData);

      // Update local state
      setPunchLog([{ id: docRef.id, ...logData }, ...punchLog]);
      setIsPunchedIn(!isPunchedIn);

      toast({
        title: `${newStatus} successfully`,
        description: isLate ? "You've been marked as late" : "",
        status: isLate ? "warning" : "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegularize = async () => {
    try {
      const { date, reason, inTime, outTime } = regularizationData;

      // Create regularization records for both punch in and out
      if (inTime) {
        const inDateTime = new Date(date);
        const [inHours, inMinutes] = inTime.split(":").map(Number);
        inDateTime.setHours(inHours, inMinutes, 0, 0);

        await addDoc(collection(db, "attendance"), {
          userId,
          timestamp: Timestamp.fromDate(inDateTime),
          status: "Punched In",
          regularized: true,
          reason,
          location: { latitude: null, longitude: null },
        });
      }

      if (outTime) {
        const outDateTime = new Date(date);
        const [outHours, outMinutes] = outTime.split(":").map(Number);
        outDateTime.setHours(outHours, outMinutes, 0, 0);

        await addDoc(collection(db, "attendance"), {
          userId,
          timestamp: Timestamp.fromDate(outDateTime),
          status: "Punched Out",
          regularized: true,
          reason,
          location: { latitude: null, longitude: null },
        });
      }

      toast({
        title: "Attendance Regularized",
        description: "Your attendance has been successfully regularized",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh logs
      if (userId) {
        fetchUserLogs(userId);
      }
      onRegularizeClose();
    } catch (error) {
      console.error("Error regularizing attendance:", error);
      toast({
        title: "Error",
        description: "Failed to regularize attendance",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDayClick = async (date: Date) => {
    setSelectedDate(date);

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const attendanceRef = collection(db, "attendance");
      const q = query(
        attendanceRef,
        where("userId", "==", userId),
        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      const logs: Log[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          timestamp: data.timestamp,
          status: data.status,
          regularized: data.regularized,
        });
      });

      setDayLogs(
        logs.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
      );
      onDayDetailsOpen();
    } catch (error) {
      console.error("Error fetching day logs:", error);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box
      pt={{ base: "130px", md: "80px", xl: "80px" }}
      bg="gray.100"
      minH="100vh"
      textAlign="center"
    >
      <VStack spacing={4}>
        <Button
          onClick={handlePunch}
          colorScheme={isPunchedIn ? "red" : "green"}
        >
          {isPunchedIn ? "Punch Out" : "Punch In"}
        </Button>

        <Button onClick={onRegularizeOpen} colorScheme="blue">
          Regularize Attendance
        </Button>

        <Box>
          <Button onClick={handlePrevMonth} mr={2}>
            Previous
          </Button>
          <Button onClick={handleNextMonth}>Next</Button>
        </Box>

        <Calendar
          logs={punchLog}
          month={currentMonth}
          year={currentYear}
          onDayClick={handleDayClick}
        />
      </VStack>

      <Modal isOpen={isRegularizeOpen} onClose={onRegularizeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Regularize Attendance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={regularizationData.date.toISOString().split("T")[0]}
                onChange={(e) =>
                  setRegularizationData({
                    ...regularizationData,
                    date: new Date(e.target.value),
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Reason</FormLabel>
              <Input
                value={regularizationData.reason}
                onChange={(e) =>
                  setRegularizationData({
                    ...regularizationData,
                    reason: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Punch In Time</FormLabel>
              <Input
                type="time"
                value={regularizationData.inTime}
                onChange={(e) =>
                  setRegularizationData({
                    ...regularizationData,
                    inTime: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Punch Out Time</FormLabel>
              <Input
                type="time"
                value={regularizationData.outTime}
                onChange={(e) =>
                  setRegularizationData({
                    ...regularizationData,
                    outTime: e.target.value,
                  })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleRegularize}>
              Submit
            </Button>
            <Button onClick={onRegularizeClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDayDetailsOpen} onClose={onDayDetailsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attendance Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {dayLogs.length === 0 ? (
              <Text>No logs for this day</Text>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Status</Th>
                    <Th>Regularized</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dayLogs.map((log) => (
                    <Tr key={log.id}>
                      <Td>
                        {new Date(
                          log.timestamp.seconds * 1000
                        ).toLocaleTimeString()}
                      </Td>
                      <Td>{log.status}</Td>
                      <Td>{log.regularized ? "Yes" : "No"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDayDetailsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
