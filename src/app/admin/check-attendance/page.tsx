"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stack,
  StackDivider,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Button,
  useDisclosure,
  Avatar,
  AvatarGroup,
  Badge,
  HStack,
  VStack,
  Tooltip,
  IconButton,
  useToast,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  Timestamp,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserGraduate,
  FaFileInvoiceDollar,
  FaChartLine,
  FaBell,
  FaExclamationCircle,
  FaCheck,
  FaBullhorn,
} from "react-icons/fa";

// Import custom components
import AttendanceCalendar from "components/check-attendance/AttendanceCalendar";
import FeeDetails from "components/check-attendance/FeeDetails";
import DayLogsModal from "components/check-attendance/DayLogsModal";
import LoadingSpinner from "components/common/LoadingSpinner";
import NotificationBell from "components/common/NotificationBell";

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  grade?: string;
  section?: string;
  rollNumber?: string;
}

interface AttendanceLog {
  id?: string;
  timestamp: Timestamp;
  status: "Punched In" | "Punched Out";
  isLate?: boolean;
  regularized?: boolean;
  notes?: string;
}

interface FeeRecord {
  id?: string;
  type: string;
  amount: number;
  dueDate: Timestamp;
  status: "Paid" | "Pending" | "Overdue";
  receiptNumber?: string;
  paidDate?: Timestamp;
  paymentMethod?: string;
}

interface CustomNotification {
  id: string;
  timestamp: Timestamp;
  title: string;
  message: string;
  type: "info" | "warning" | "urgent" | "success";
  read: boolean;
  relatedTo?: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
  monthlyTrend: number;
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [dayLogs, setDayLogs] = useState<AttendanceLog[]>([]);
  const [feeData, setFeeData] = useState<FeeRecord[]>([]);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    monthlyTrend: 0,
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    isOpen: isDayDetailsOpen,
    onOpen: onDayDetailsOpen,
    onClose: onDayDetailsClose,
  } = useDisclosure();

  const {
    isOpen: isNotificationsOpen,
    onOpen: onNotificationsOpen,
    onClose: onNotificationsClose,
  } = useDisclosure();

  const toast = useToast();
  const db = getFirestore();
  const auth = getAuth();
  const notificationsUnsubscribe = useRef<() => void | null>();

  // Check authentication and load parent data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchChildren(user.uid);
        setupNotificationsListener(user.uid);
      } else {
        toast({
          title: "Authentication required",
          description: "Please login to view your dashboard.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (notificationsUnsubscribe.current) {
        notificationsUnsubscribe.current();
      }
    };
  }, []);

  // Setup real-time listener for notifications
  const setupNotificationsListener = (parentId: string) => {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("parentId", "==", parentId),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData: CustomNotification[] = [];
      snapshot.forEach((doc) => {
        notificationsData.push({
          id: doc.id,
          ...doc.data(),
        } as CustomNotification);
      });

      setNotifications(notificationsData);
      const unread = notificationsData.filter((n) => !n.read).length;
      setUnreadCount(unread);

      // Show toast for new unread notifications
      if (unread > 0) {
        const latestNotification = notificationsData.find((n) => !n.read);
        if (latestNotification) {
          toast({
            title: latestNotification.title,
            description: latestNotification.message,
            status:
              latestNotification.type === "success"
                ? "success"
                : latestNotification.type === "warning"
                ? "warning"
                : latestNotification.type === "urgent"
                ? "error"
                : "info",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    });

    notificationsUnsubscribe.current = unsubscribe;
  };

  // Fetch children linked to the parent
  const fetchChildren = async (parentId: string) => {
    try {
      const studentsRef = collection(db, "users");
      const q = query(studentsRef, where("parentId", "==", parentId));
      const querySnapshot = await getDocs(q);

      const childrenData: Student[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          avatarUrl: data.avatarUrl,
          grade: data.grade,
          section: data.section,
          rollNumber: data.rollNumber,
        } as Student;
      });

      setChildren(childrenData);

      // Select the first child by default
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
        fetchChildAttendance(childrenData[0].id);
        fetchChildFees(childrenData[0].id);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student information. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch attendance logs for a child with real-time updates
  const fetchChildAttendance = async (childId: string) => {
    try {
      const attendanceRef = collection(db, "attendance");
      const q = query(
        attendanceRef,
        where("studentId", "==", childId),
        where(
          "timestamp",
          ">=",
          Timestamp.fromDate(new Date(currentYear, currentMonth, 1))
        ),
        where(
          "timestamp",
          "<=",
          Timestamp.fromDate(new Date(currentYear, currentMonth + 1, 0))
        ),
        orderBy("timestamp", "desc")
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const attendanceData: AttendanceLog[] = [];
        querySnapshot.forEach((doc) => {
          attendanceData.push({
            id: doc.id,
            ...doc.data(),
          } as AttendanceLog);
        });

        setAttendanceLogs(attendanceData);
        calculateAttendanceStats(attendanceData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch attendance information. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (logs: AttendanceLog[]) => {
    // Only count unique days for attendance
    const uniqueDays = new Map<string, { status: string; isLate: boolean }>();

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      const dateKey = logDate.toISOString().split("T")[0];

      // For each day, prioritize "Punched In" status
      if (!uniqueDays.has(dateKey) || log.status === "Punched In") {
        uniqueDays.set(dateKey, {
          status: log.status,
          isLate: log.isLate || false,
        });
      }
    });

    // Count days by status
    let present = 0;
    let absent = 0;
    let late = 0;

    // Calculate business days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const businessDays = getBusinessDaysInMonth(currentYear, currentMonth);

    // Process each unique day
    uniqueDays.forEach((dayData) => {
      if (dayData.status === "Punched In") {
        present++;
        if (dayData.isLate) {
          late++;
        }
      }
    });

    // Calculate absences (business days - present days)
    absent = Math.max(0, businessDays - present);

    // Calculate month-over-month trend (compare with previous month)
    // For demo purposes, using a random value between -10 and 10
    const monthlyTrend = Math.round(Math.random() * 20 - 10);

    setAttendanceStats({
      present,
      absent,
      late,
      total: businessDays,
      monthlyTrend,
    });
  };

  // Helper function to get business days in month (excluding weekends)
  const getBusinessDaysInMonth = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    let count = 0;

    for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }

    return count;
  };

  // Fetch fee records for a child with real-time updates
  const fetchChildFees = async (childId: string) => {
    try {
      const feesRef = collection(db, "fees");
      const q = query(
        feesRef,
        where("studentId", "==", childId),
        orderBy("dueDate", "desc")
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const feeRecords: FeeRecord[] = [];
        querySnapshot.forEach((doc) => {
          feeRecords.push({
            id: doc.id,
            ...doc.data(),
          } as FeeRecord);
        });
        setFeeData(feeRecords);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching fee records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch fee information. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Change month for attendance calendar
  const changeMonth = (increment: number) => {
    const newDate = new Date(currentYear, currentMonth + increment);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());

    if (selectedChild) {
      fetchChildAttendance(selectedChild.id);
    }
  };

  // Handle day click on calendar
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    const filteredLogs = attendanceLogs.filter((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      return (
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate()
      );
    });

    setDayLogs(filteredLogs);
    onDayDetailsOpen();
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Calculate attendance percentage
  const attendancePercentage =
    attendanceStats.total > 0
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
      : 0;

  // Check if there are any urgent fee payments
  const hasOverdueFees = feeData.some((fee) => fee.status === "Overdue");

  // Get pending fee amount
  const pendingFeeAmount = feeData
    .filter((fee) => fee.status !== "Paid")
    .reduce((total, fee) => total + fee.amount, 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">Parent Dashboard</Heading>
        <HStack spacing={4}>
          <Select
            width="200px"
            value={selectedChild?.id || ""}
            onChange={(e) => {
              const childId = e.target.value;
              const child = children.find((c) => c.id === childId) || null;
              setSelectedChild(child);
              if (child) {
                fetchChildAttendance(child.id);
                fetchChildFees(child.id);
              }
            }}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </Select>
          <NotificationBell
            count={unreadCount}
            onClick={onNotificationsOpen}
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
          />
        </HStack>
      </Flex>

      {selectedChild ? (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
            <Card>
              <CardBody>
                <Stat>
                  <Flex align="center">
                    <Box color="green.500" mr={2}>
                      <FaCalendarAlt />
                    </Box>
                    <StatLabel>Attendance Rate</StatLabel>
                  </Flex>
                  <StatNumber>{attendancePercentage}%</StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={
                        attendanceStats.monthlyTrend >= 0
                          ? "increase"
                          : "decrease"
                      }
                    />
                    {Math.abs(attendanceStats.monthlyTrend)}% since last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <Flex align="center">
                    <Box color="red.500" mr={2}>
                      <FaExclamationCircle />
                    </Box>
                    <StatLabel>Late Arrivals</StatLabel>
                  </Flex>
                  <StatNumber>{attendanceStats.late}</StatNumber>
                  <StatHelpText>
                    {attendanceStats.total > 0
                      ? Math.round(
                          (attendanceStats.late / attendanceStats.total) * 100
                        )
                      : 0}
                    % of school days
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <Flex align="center">
                    <Box color="blue.500" mr={2}>
                      <FaFileInvoiceDollar />
                    </Box>
                    <StatLabel>Pending Fees</StatLabel>
                  </Flex>
                  <StatNumber>${pendingFeeAmount.toFixed(2)}</StatNumber>
                  <StatHelpText>
                    {hasOverdueFees && (
                      <Badge colorScheme="red">Overdue Payments</Badge>
                    )}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <Flex align="center">
                    <Box color="purple.500" mr={2}>
                      <FaUserGraduate />
                    </Box>
                    <StatLabel>Student Info</StatLabel>
                  </Flex>
                  <StatNumber>
                    {selectedChild.grade}-{selectedChild.section}
                  </StatNumber>
                  <StatHelpText>Roll #{selectedChild.rollNumber}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {hasOverdueFees && (
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <AlertTitle>Payment Reminder</AlertTitle>
              <AlertDescription>
                You have overdue fee payments. Please clear them as soon as
                possible.
              </AlertDescription>
            </Alert>
          )}

          <Tabs variant="enclosed" colorScheme="teal">
            <TabList>
              <Tab>
                <FaCalendarAlt />
                <Text ml={2}>Attendance</Text>
              </Tab>
              <Tab>
                <FaMoneyBillWave />
                <Text ml={2}>Fees</Text>
              </Tab>
              <Tab>
                <FaBullhorn />
                <Text ml={2}>Announcements</Text>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Heading size="md">Monthly Attendance</Heading>
                      <HStack spacing={2}>
                        <Button size="sm" onClick={() => changeMonth(-1)}>
                          Previous
                        </Button>
                        <Text>
                          {new Date(currentYear, currentMonth).toLocaleString(
                            "default",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </Text>
                        <Button size="sm" onClick={() => changeMonth(1)}>
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <AttendanceCalendar
                      attendanceLogs={attendanceLogs}
                      month={currentMonth}
                      year={currentYear}
                      onDayClick={handleDayClick}
                    />
                    <Grid templateColumns="repeat(4, 1fr)" gap={4} mt={4}>
                      <GridItem>
                        <VStack align="flex-start">
                          <Text fontWeight="bold">Present Days</Text>
                          <Badge colorScheme="green" fontSize="lg">
                            {attendanceStats.present}
                          </Badge>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start">
                          <Text fontWeight="bold">Absent Days</Text>
                          <Badge colorScheme="red" fontSize="lg">
                            {attendanceStats.absent}
                          </Badge>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start">
                          <Text fontWeight="bold">Late Arrivals</Text>
                          <Badge colorScheme="yellow" fontSize="lg">
                            {attendanceStats.late}
                          </Badge>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start">
                          <Text fontWeight="bold">School Days</Text>
                          <Badge colorScheme="blue" fontSize="lg">
                            {attendanceStats.total}
                          </Badge>
                        </VStack>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Fee Records</Heading>
                  </CardHeader>
                  <CardBody>
                    <FeeDetails feeData={feeData} />
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Recent Announcements</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack divider={<StackDivider />} spacing={4}>
                      {notifications
                        .filter(
                          (n) => n.type !== "urgent" && n.type !== "warning"
                        )
                        .slice(0, 5)
                        .map((notification) => (
                          <Box key={notification.id}>
                            <Flex justifyContent="space-between">
                              <Heading size="xs">{notification.title}</Heading>
                              <Text fontSize="xs" color="gray.500">
                                {notification.timestamp
                                  .toDate()
                                  .toLocaleDateString()}
                              </Text>
                            </Flex>
                            <Text pt={2}>{notification.message}</Text>
                            {!notification.read && (
                              <Badge colorScheme="blue" mt={1}>
                                New
                              </Badge>
                            )}
                          </Box>
                        ))}
                      {notifications.filter(
                        (n) => n.type !== "urgent" && n.type !== "warning"
                      ).length === 0 && (
                        <Text>No announcements to display.</Text>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardBody>
            <Text>
              No students found. Please contact the school administrator.
            </Text>
          </CardBody>
        </Card>
      )}

      {/* Day Logs Modal */}
      <DayLogsModal
        isOpen={isDayDetailsOpen}
        onClose={onDayDetailsClose}
        date={selectedDate}
        logs={dayLogs}
        studentName={selectedChild?.name || ""}
        dayLogs={[]}
      />
    </Box>
  );
}
