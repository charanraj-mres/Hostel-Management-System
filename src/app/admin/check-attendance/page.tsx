"use client";
import { useState, useEffect } from "react";
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
  Select,
  Button,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserGraduate,
  FaFileInvoiceDollar,
} from "react-icons/fa";

// Import custom components
import AttendanceCalendar from "components/check-attendance/AttendanceCalendar";
import FeeDetails from "components/check-attendance//FeeDetails";
import DayLogsModal from "components/check-attendance/DayLogsModal";

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface AttendanceLog {
  timestamp: Timestamp;
  status: "Punched In" | "Punched Out";
  isLate?: boolean;
  regularized?: boolean;
  notes?: string;
}

interface FeeRecord {
  type: string;
  amount: number;
  dueDate: Timestamp;
  status: "Paid" | "Pending" | "Overdue";
  receiptNumber?: string;
  paidDate?: Timestamp;
  paymentMethod?: string;
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [dayLogs, setDayLogs] = useState<AttendanceLog[]>([]);
  const [feeData, setFeeData] = useState<FeeRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const {
    isOpen: isDayDetailsOpen,
    onOpen: onDayDetailsOpen,
    onClose: onDayDetailsClose,
  } = useDisclosure();

  const db = getFirestore();
  const auth = getAuth();

  // Check authentication and load parent data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchChildren(user.uid);
      } else {
        console.log("User not authenticated");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    }
  };

  // Fetch attendance logs for a child
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
        )
      );
      const querySnapshot = await getDocs(q);

      const attendanceData: AttendanceLog[] = querySnapshot.docs.map(
        (doc) => doc.data() as AttendanceLog
      );
      setAttendanceLogs(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
    }
  };

  // Fetch fee records for a child
  const fetchChildFees = async (childId: string) => {
    try {
      const feesRef = collection(db, "fees");
      const q = query(feesRef, where("studentId", "==", childId));
      const querySnapshot = await getDocs(q);

      const feeRecords: FeeRecord[] = querySnapshot.docs.map(
        (doc) => doc.data() as FeeRecord
      );
      setFeeData(feeRecords);
    } catch (error) {
      console.error("Error fetching fee records:", error);
    }
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>
        Parent Dashboard
      </Heading>

      {/* Child Selection */}
      <Select
        placeholder="Select Child"
        value={selectedChild?.id || ""}
        onChange={(e) => {
          const child = children.find((c) => c.id === e.target.value);
          if (child) {
            setSelectedChild(child);
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

      {/* Dashboard Tabs */}
      <Tabs mt={4} isFitted variant="enclosed">
        <TabList>
          <Tab>
            <FaCalendarAlt /> Attendance
          </Tab>
          <Tab>
            <FaMoneyBillWave /> Fees
          </Tab>
        </TabList>

        <TabPanels>
          {/* Attendance Calendar */}
          <TabPanel>
            <AttendanceCalendar
              logs={attendanceLogs}
              month={currentMonth}
              year={currentYear}
              onDayClick={(date) => {
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
              }}
            />
          </TabPanel>

          {/* Fee Details */}
          <TabPanel>
            <FeeDetails feeData={feeData} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal for daily logs */}
      <DayLogsModal
        isOpen={isDayDetailsOpen}
        onClose={onDayDetailsClose}
        dayLogs={dayLogs}
      />
    </Box>
  );
}
