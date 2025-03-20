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
  Grid,
  GridItem,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  Tooltip,
  Heading,
} from "@chakra-ui/react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getFirestore,
  serverTimestamp,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { InfoIcon } from "@chakra-ui/icons";

/// Define interfaces
interface Log {
  id: string;
  timestamp: { seconds: number; nanoseconds: number };
  status: string;
  regularized: boolean;
  isLate?: boolean;
  reason?: string;
  serverTime?: { seconds: number; nanoseconds: number };
}

// Calendar component
interface CalendarProps {
  logs: Log[];
  month: number;
  year: number;
  onDayClick: (date: Date) => void;
  onMonthChange: (increment: number) => void;
}

const Calendar = ({
  logs,
  month,
  year,
  onDayClick,
  onMonthChange,
}: CalendarProps) => {
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
    const isLate = dayLogs.some((log) => log.isLate);

    if (hasPunchIn && hasPunchOut) {
      return isLate ? "late" : "present";
    } else if (hasPunchIn) {
      return "missing-out";
    } else {
      // Check if this was regularized
      return dayLogs.some((log) => log.regularized) ? "regularized" : "absent";
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
          {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
          {year}
        </Heading>
        <Flex>
          <Button size="sm" onClick={() => onMonthChange(-1)} mr={2}>
            Previous
          </Button>
          <Button size="sm" onClick={() => onMonthChange(1)}>
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
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

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
              border={isToday ? "2px solid black" : "none"}
            >
              {day}
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

export default function StudentAttendance() {
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    regularized: 0,
  });
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  const [workingHours, setWorkingHours] = useState<string>("");
  const [dayLogs, setDayLogs] = useState<Log[]>([]);
  const [hasPunchedInToday, setHasPunchedInToday] = useState(false);
  const [hasPunchedOutToday, setHasPunchedOutToday] = useState(false);

  // For regularization
  const {
    isOpen: isRegularizeOpen,
    onOpen: onRegularizeOpen,
    onClose: onRegularizeClose,
  } = useDisclosure();

  // For day details
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

  const toast = useToast();
  const db = getFirestore();
  const auth = getAuth();
  const timeInterval = useRef<any>(null);

  // Start the clock timer
  useEffect(() => {
    // Update current time every second
    timeInterval.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval.current);
  }, []);

  // Fetch location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
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
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    }

    // Check for authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setupRealtimeListener(user.uid);
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

    return () => {
      unsubscribe();
      if (timeInterval.current) clearInterval(timeInterval.current);
    };
  }, []);

  // Set up realtime listener for attendance logs
  const setupRealtimeListener = (uid: string) => {
    const attendanceRef = collection(db, "attendance");
    const q = query(
      attendanceRef,
      where("userId", "==", uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logs: Log[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          timestamp: data.timestamp,
          status: data.status,
          regularized: data.regularized || false,
          isLate: data.isLate || false,
          reason: data.reason || "",
          serverTime: data.serverTime || null,
        });
      });

      setPunchLog(logs);
      calculateAttendanceStats(logs);
      checkPunchStatus(logs);
    });

    return unsubscribe;
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (logs: Log[]) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filter logs for current month
    const monthLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      return logDate >= firstDayOfMonth && logDate <= today;
    });

    // Get unique dates with attendance
    const datesWithAttendance = new Set();
    const lateAttendanceDates = new Set();
    const regularizedDates = new Set();

    monthLogs.forEach((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000)
        .toISOString()
        .split("T")[0];

      if (log.status === "Punched In" || log.status === "Punched Out") {
        datesWithAttendance.add(logDate);

        if (log.isLate) {
          lateAttendanceDates.add(logDate);
        }

        if (log.regularized) {
          regularizedDates.add(logDate);
        }
      }
    });

    // Calculate business days so far this month
    const businessDaysSoFar = getBusinessDayCount(firstDayOfMonth, today);

    setAttendanceStats({
      present: datesWithAttendance.size,
      absent: Math.max(0, businessDaysSoFar - datesWithAttendance.size),
      late: lateAttendanceDates.size,
      regularized: regularizedDates.size,
    });
  };

  // Count business days between two dates
  const getBusinessDayCount = (startDate: Date, endDate: Date) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());

    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }

    return count;
  };

  // Check if user has already punched in/out for today
  const checkPunchStatus = (logs: Log[]) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter logs for today
      const todayLogs = logs.filter((log) => {
        const logDate = new Date(log.timestamp.seconds * 1000);
        const logDay = new Date(
          logDate.getFullYear(),
          logDate.getMonth(),
          logDate.getDate()
        );
        return logDay.getTime() === today.getTime();
      });

      // Check for punch in and punch out
      const punchInLog = todayLogs.find((log) => log.status === "Punched In");
      const punchOutLog = todayLogs.find((log) => log.status === "Punched Out");

      setHasPunchedInToday(!!punchInLog);
      setHasPunchedOutToday(!!punchOutLog);

      // Set punch in time if available
      if (punchInLog) {
        setPunchInTime(new Date(punchInLog.timestamp.seconds * 1000));
      } else {
        setPunchInTime(null);
      }

      // Set punch out time if available
      if (punchOutLog) {
        setPunchOutTime(new Date(punchOutLog.timestamp.seconds * 1000));
      } else {
        setPunchOutTime(null);
      }

      // Update current status
      if (punchInLog && !punchOutLog) {
        setIsPunchedIn(true);
      } else {
        setIsPunchedIn(false);
      }

      // Calculate working hours if both punch in and out exist
      if (punchInLog && punchOutLog) {
        const punchInTime = new Date(punchInLog.timestamp.seconds * 1000);
        const punchOutTime = new Date(punchOutLog.timestamp.seconds * 1000);

        // Calculate difference in milliseconds
        const diffMs = punchOutTime.getTime() - punchInTime.getTime();

        // Convert to hours and minutes
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setWorkingHours(`${hours}h ${minutes}m`);
      } else {
        setWorkingHours("");
      }
    } catch (error) {
      console.error("Error checking punch status:", error);
    }
  };

  // Handle punch in/out
  const handlePunch = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to use the attendance system.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!location.latitude || !location.longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location services to punch in/out.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const now = new Date();
      const status = isPunchedIn ? "Punched Out" : "Punched In";

      // Check if user already has both punches for today
      if (status === "Punched In" && hasPunchedInToday) {
        toast({
          title: "Already Punched In",
          description: "You have already punched in today.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      if (status === "Punched Out" && hasPunchedOutToday) {
        toast({
          title: "Already Punched Out",
          description: "You have already punched out today.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // Check if trying to punch out without punching in
      if (status === "Punched Out" && !hasPunchedInToday) {
        toast({
          title: "Punch In Required",
          description: "You need to punch in before punching out.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // Check if punch-in is late (after 9:30 AM)
      let isLate = false;
      if (status === "Punched In") {
        const lateThreshold = new Date();
        lateThreshold.setHours(9, 30, 0, 0);
        isLate = now > lateThreshold;
      }

      // Add the punch record
      await addDoc(collection(db, "attendance"), {
        userId,
        timestamp: Timestamp.fromDate(now),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        status,
        isLate,
        regularized: false,
        serverTime: serverTimestamp(),
      });

      toast({
        title: `${status} Successfully`,
        description: `You have ${status.toLowerCase()} at ${now.toLocaleTimeString()}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update punch status in state
      if (status === "Punched In") {
        setHasPunchedInToday(true);
        setPunchInTime(now);
      } else {
        setHasPunchedOutToday(true);
        setPunchOutTime(now);
      }

      setIsPunchedIn(status === "Punched In");
    } catch (error) {
      console.error("Error punching in/out:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle regularization submission
  const handleRegularizationSubmit = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to regularize attendance.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!regularizationData.reason) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for regularization.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!regularizationData.inTime && !regularizationData.outTime) {
      toast({
        title: "Time Required",
        description: "Please provide at least one punch time.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Add the regularization request
      await addDoc(collection(db, "regularization"), {
        userId,
        date: Timestamp.fromDate(regularizationData.date),
        reason: regularizationData.reason,
        inTime: regularizationData.inTime,
        outTime: regularizationData.outTime,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Regularization Requested",
        description:
          "Your attendance regularization request has been submitted and is pending approval.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form and close modal
      setRegularizationData({
        date: new Date(),
        reason: "",
        inTime: "",
        outTime: "",
      });
      onRegularizeClose();
    } catch (error) {
      console.error("Error submitting regularization:", error);
      toast({
        title: "Error",
        description:
          "Failed to submit regularization request. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle day click on calendar
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    // Update month and year if they change
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());

    // Get logs for the selected date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const filteredLogs = punchLog.filter((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    setDayLogs(filteredLogs);
    onDayDetailsOpen();
  };

  // Format time for display
  const formatTime = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
  };

  // Format date for display
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };
  // Check if it's within office hours (9:00 AM to 6:00 PM)
  const isWithinOfficeHours = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 9 && hours < 18;
  };

  // Check if it's a weekend
  const isWeekend = () => {
    const now = new Date();
    const day = now.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Get punch button status and color
  const getPunchButtonStatus = () => {
    // If already punched in and out, disable both buttons
    if (hasPunchedInToday && hasPunchedOutToday) {
      return {
        disabled: true,
        colorScheme: "gray",
        text: "Attendance Completed for Today",
      };
    }

    // If weekend
    if (isWeekend()) {
      return {
        disabled: true,
        colorScheme: "gray",
        text: "Weekend - No Attendance Required",
      };
    }

    // If not within office hours
    if (!isWithinOfficeHours()) {
      return {
        disabled: false,
        colorScheme: isPunchedIn ? "red" : "blue",
        text: isPunchedIn
          ? "Punch Out (After Hours)"
          : "Punch In (After Hours)",
      };
    }

    // Normal case
    return {
      disabled: false,
      colorScheme: isPunchedIn ? "red" : "green",
      text: isPunchedIn ? "Punch Out" : "Punch In",
    };
  };

  const buttonStatus = getPunchButtonStatus();

  // Calculate monthly attendance rate
  const attendanceRate =
    attendanceStats.present > 0
      ? (
          (attendanceStats.present /
            (attendanceStats.present + attendanceStats.absent)) *
          100
        ).toFixed(1)
      : "0.0";
  // Handle month change in calendar
  const handleMonthChange = (increment: number) => {
    const newDate = new Date(currentYear, currentMonth + increment);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };
  return (
    <Box mt={20} p={4} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Current Time Display */}
        <Box textAlign="center" py={4}>
          <Text fontSize="4xl" fontWeight="bold">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
          <Text fontSize="md" color="gray.500">
            {currentTime.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Box>

        {/* Today's Status */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={4}>
            Today's Status
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <GridItem>
              <Stat>
                <StatLabel>Status</StatLabel>
                <StatNumber>
                  {hasPunchedInToday && hasPunchedOutToday ? (
                    <Badge colorScheme="blue" fontSize="md" p={1}>
                      Completed
                    </Badge>
                  ) : isPunchedIn ? (
                    <Badge colorScheme="green" fontSize="md" p={1}>
                      Punched In
                    </Badge>
                  ) : (
                    <Badge colorScheme="yellow" fontSize="md" p={1}>
                      Not Punched In
                    </Badge>
                  )}
                </StatNumber>
              </Stat>
            </GridItem>
            {punchInTime && (
              <GridItem>
                <Stat>
                  <StatLabel>Punch-In Time</StatLabel>
                  <StatNumber>
                    {punchInTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {punchInTime.getHours() >= 9 &&
                      punchInTime.getMinutes() > 30 && (
                        <Badge colorScheme="red" ml={2}>
                          Late
                        </Badge>
                      )}
                  </StatNumber>
                </Stat>
              </GridItem>
            )}
            {punchOutTime && (
              <GridItem>
                <Stat>
                  <StatLabel>Punch-Out Time</StatLabel>
                  <StatNumber>
                    {punchOutTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </StatNumber>
                </Stat>
              </GridItem>
            )}
            <GridItem>
              <Stat>
                <StatLabel>Working Hours</StatLabel>
                <StatNumber>{workingHours || "Not Available"}</StatNumber>
              </Stat>
            </GridItem>
          </Grid>
          <Button
            colorScheme={buttonStatus.colorScheme}
            onClick={handlePunch}
            isLoading={loading}
            disabled={buttonStatus.disabled}
            mt={4}
            size="lg"
            width="100%"
          >
            {buttonStatus.text}
          </Button>
        </Box>

        {/* Monthly Stats */}
        <Box bg="white" p={4} borderRadius="md" shadow="md">
          <Heading size="md" mb={4}>
            Monthly Stats
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
            <GridItem>
              <Stat>
                <StatLabel>Present</StatLabel>
                <StatNumber>{attendanceStats.present}</StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <StatLabel>Absent</StatLabel>
                <StatNumber>{attendanceStats.absent}</StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <StatLabel>Late</StatLabel>
                <StatNumber>{attendanceStats.late}</StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <StatLabel>Regularized</StatLabel>
                <StatNumber>{attendanceStats.regularized}</StatNumber>
              </Stat>
            </GridItem>
          </Grid>
          <Alert status="info" mt={4}>
            <AlertIcon />
            Your monthly attendance rate is <strong>{attendanceRate}%</strong>
          </Alert>
        </Box>

        {/* Calendar */}
        <Calendar
          logs={punchLog}
          month={currentMonth}
          year={currentYear}
          onDayClick={handleDayClick}
          onMonthChange={handleMonthChange}
        />

        {/* Regularization Request */}
        <Button colorScheme="blue" onClick={onRegularizeOpen} width="100%">
          Request Attendance Regularization
        </Button>
      </VStack>

      {/* Regularization Modal */}
      {/* Regularization Modal */}
      <Modal isOpen={isRegularizeOpen} onClose={onRegularizeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Attendance Regularization</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Note:</Text>
                <Text>
                  This request will be sent to administrators for approval.
                  Please provide accurate information.
                </Text>
              </Box>
            </Alert>
            <FormControl mt={4}>
              <FormLabel>Date for Regularization</FormLabel>
              <Input
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
              <FormLabel>Reason for Regularization</FormLabel>
              <Input
                placeholder="Enter reason"
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
              <FormLabel>
                Punch-In Time{" "}
                <Tooltip
                  label="Time when you should have punched in"
                  fontSize="sm"
                >
                  <InfoIcon />
                </Tooltip>
              </FormLabel>
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
              <FormLabel>
                Punch-Out Time{" "}
                <Tooltip
                  label="Time when you should have punched out"
                  fontSize="sm"
                >
                  <InfoIcon />
                </Tooltip>
              </FormLabel>
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
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleRegularizationSubmit}
              isLoading={loading}
            >
              Submit Request
            </Button>
            <Button variant="ghost" onClick={onRegularizeClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Day Details Modal */}
      <Modal isOpen={isDayDetailsOpen} onClose={onDayDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Attendance Details for{" "}
            {selectedDate.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {dayLogs.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No attendance records found for this date.
              </Alert>
            ) : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Status</Th>
                    <Th>Details</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dayLogs
                    .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)
                    .map((log) => (
                      <Tr key={log.id}>
                        <Td>
                          {new Date(
                            log.timestamp.seconds * 1000
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              log.status === "Punched In"
                                ? "green"
                                : log.status === "Punched Out"
                                ? "red"
                                : "blue"
                            }
                          >
                            {log.status}
                          </Badge>
                        </Td>
                        <Td>
                          {log.isLate && (
                            <Badge colorScheme="yellow" mr={2}>
                              Late
                            </Badge>
                          )}
                          {log.regularized && (
                            <Badge colorScheme="purple" mr={2}>
                              Regularized
                            </Badge>
                          )}
                          {log.reason && (
                            <Tooltip label={log.reason}>
                              <InfoIcon color="blue.500" />
                            </Tooltip>
                          )}
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            )}

            {/* Regularization request for this day */}
            {dayLogs.length === 0 && (
              <Button
                colorScheme="blue"
                mt={4}
                onClick={() => {
                  setRegularizationData({
                    ...regularizationData,
                    date: selectedDate,
                  });
                  onDayDetailsClose();
                  onRegularizeOpen();
                }}
              >
                Request Regularization for This Day
              </Button>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onDayDetailsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
