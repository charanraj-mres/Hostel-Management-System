"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Image,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Text,
  Spinner,
  Center,
  Badge,
  Heading,
} from "@chakra-ui/react";

// Custom components
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import {
  MdAddTask,
  MdAttachMoney,
  MdBarChart,
  MdPeople,
  MdHome,
} from "react-icons/md";
import { FaUserGraduate, FaUserTie, FaUserShield } from "react-icons/fa";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import PieCard from "views/admin/default/components/PieCard";
import Tasks from "views/admin/default/components/Tasks";
import TotalSpent from "views/admin/default/components/TotalSpent";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";

// Firebase
import { db } from "config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "context/AuthContext";

export default function Default() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const userTypeBg = useColorModeValue("blue.100", "blue.800");

  // Auth context
  const { user, userData, userType } = useAuth();

  // Time-based greeting
  const [greeting, setGreeting] = useState("Hello");

  // Dashboard data states
  const [isLoading, setIsLoading] = useState(true);
  interface Activity {
    id: string;
    description: string;
    completed: boolean;
    timestamp: any;
  }

  interface UserSpecificData {
    student: {
      roomNumber: string;
      feeStatus: string;
      mealPlan: string;
    };
    staff: {
      department: string;
      assignedTasks: number;
      completedTasks: number;
    };
    warden: {
      hostelBlock: string;
      studentsUnderCare: number;
      pendingApprovals: number;
    };
  }

  interface DashboardData {
    totalStudents: number;
    totalStaff: number;
    totalWardens: number;
    pendingTasks: number;
    totalProjects: number;
    monthlyExpenses: number;
    monthlyIncome: number;
    recentActivities: Activity[];
    roomOccupancy: number;
    userSpecificData: UserSpecificData;
  }

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    totalStaff: 0,
    totalWardens: 0,
    pendingTasks: 0,
    totalProjects: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    recentActivities: [],
    roomOccupancy: 0,
    userSpecificData: {
      student: {
        roomNumber: "N/A",
        feeStatus: "N/A",
        mealPlan: "N/A",
      },
      staff: {
        department: "N/A",
        assignedTasks: 0,
        completedTasks: 0,
      },
      warden: {
        hostelBlock: "N/A",
        studentsUnderCare: 0,
        pendingApprovals: 0,
      },
    },
  });

  interface CheckTableData {
    name: string;
    progress: number;
    quantity: number;
    date: string;
    status: string;
  }

  interface ComplexTableData {
    name: string;
    email: string;
    status: string;
    date: string;
    type: string;
  }

  const [tableData, setTableData] = useState<CheckTableData[]>([]);
  const [complexTableData, setComplexTableData] = useState<ComplexTableData[]>(
    []
  );

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Count users by type
        const studentsSnapshot = await getDocs(
          query(
            collection(db, "users"),
            where("userType", "==", "student"),
            where("status", "==", "active")
          )
        );
        const staffSnapshot = await getDocs(
          query(
            collection(db, "users"),
            where("userType", "==", "staff"),
            where("status", "==", "active")
          )
        );
        const wardensSnapshot = await getDocs(
          query(
            collection(db, "users"),
            where("userType", "==", "warden"),
            where("status", "==", "active")
          )
        );

        // Get tasks
        const tasksSnapshot = await getDocs(
          query(collection(db, "tasks"), where("status", "==", "pending"))
        );

        // Get projects/rooms
        const roomsSnapshot = await getDocs(collection(db, "rooms"));

        // Get financial data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const expensesSnapshot = await getDocs(
          query(
            collection(db, "financials"),
            where("type", "==", "expense"),
            where("month", "==", currentMonth),
            where("year", "==", currentYear)
          )
        );

        const incomeSnapshot = await getDocs(
          query(
            collection(db, "financials"),
            where("type", "==", "income"),
            where("month", "==", currentMonth),
            where("year", "==", currentYear)
          )
        );

        // Calculate totals
        let totalExpenses = 0;
        expensesSnapshot.forEach((doc) => {
          totalExpenses += doc.data().amount || 0;
        });

        let totalIncome = 0;
        incomeSnapshot.forEach((doc) => {
          totalIncome += doc.data().amount || 0;
        });

        // Get recent activities for table
        const activitiesSnapshot = await getDocs(
          query(
            collection(db, "activities"),
            orderBy("timestamp", "desc"),
            limit(5)
          )
        );

        const activities = activitiesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            description: data.description,
            completed: data.completed,
            timestamp: data.timestamp,
          };
        });

        // Get room occupancy
        let occupiedRooms = 0;
        roomsSnapshot.forEach((doc) => {
          if (doc.data().occupied) {
            occupiedRooms++;
          }
        });

        const roomOccupancyRate =
          roomsSnapshot.size > 0
            ? (occupiedRooms / roomsSnapshot.size) * 100
            : 0;

        // Create table data for CheckTable
        const checkTableData = activities.map((activity) => ({
          name: activity.description,
          progress: activity.completed
            ? 100
            : Math.floor(Math.random() * 90) + 10,
          quantity: 1,
          date: activity.timestamp
            ? new Date(activity.timestamp.toDate()).toLocaleDateString()
            : "N/A",
          status: activity.completed ? "Approved" : "Pending",
        }));

        // Create table data for ComplexTable
        const userSnapshots = await getDocs(
          query(collection(db, "users"), orderBy("name"), limit(8))
        );

        const complexData = userSnapshots.docs.map((doc) => {
          const userData = doc.data();
          return {
            name: userData.name,
            email: userData.email,
            status: userData.status,
            date: userData.createdAt
              ? new Date(userData.createdAt.toDate()).toLocaleDateString()
              : "N/A",
            type: userData.userType,
          };
        });

        // Fetch user-specific data based on userType
        let userSpecificData = {
          student: {
            roomNumber: "N/A",
            feeStatus: "N/A",
            mealPlan: "N/A",
          },
          staff: {
            department: "N/A",
            assignedTasks: 0,
            completedTasks: 0,
          },
          warden: {
            hostelBlock: "N/A",
            studentsUnderCare: 0,
            pendingApprovals: 0,
          },
        };

        if (user && userData) {
          if (userType === "student") {
            // Fetch student-specific data
            const studentDataSnapshot = await getDocs(
              query(
                collection(db, "studentDetails"),
                where("userId", "==", user.uid)
              )
            );

            if (!studentDataSnapshot.empty) {
              const studentData = studentDataSnapshot.docs[0].data();
              userSpecificData.student = {
                roomNumber: studentData.roomNumber || "Not Assigned",
                feeStatus: studentData.feeStatus || "Pending",
                mealPlan: studentData.mealPlan || "Standard",
              };
            }
          } else if (userType === "staff") {
            // Fetch staff-specific data
            const staffDataSnapshot = await getDocs(
              query(
                collection(db, "staffDetails"),
                where("userId", "==", user.uid)
              )
            );

            const staffTasksSnapshot = await getDocs(
              query(
                collection(db, "tasks"),
                where("assignedTo", "==", user.uid)
              )
            );

            let assignedTasks = 0;
            let completedTasks = 0;

            staffTasksSnapshot.forEach((doc) => {
              assignedTasks++;
              if (doc.data().status === "completed") {
                completedTasks++;
              }
            });

            if (!staffDataSnapshot.empty) {
              const staffData = staffDataSnapshot.docs[0].data();
              userSpecificData.staff = {
                department: staffData.department || "General",
                assignedTasks,
                completedTasks,
              };
            }
          } else if (userType === "warden") {
            // Fetch warden-specific data
            const wardenDataSnapshot = await getDocs(
              query(
                collection(db, "wardenDetails"),
                where("userId", "==", user.uid)
              )
            );

            const pendingApprovalsSnapshot = await getDocs(
              query(
                collection(db, "approvals"),
                where("wardenId", "==", user.uid),
                where("status", "==", "pending")
              )
            );

            if (!wardenDataSnapshot.empty) {
              const wardenData = wardenDataSnapshot.docs[0].data();
              const blockStudentsSnapshot = await getDocs(
                query(
                  collection(db, "studentDetails"),
                  where("hostelBlock", "==", wardenData.hostelBlock)
                )
              );

              userSpecificData.warden = {
                hostelBlock: wardenData.hostelBlock || "Not Assigned",
                studentsUnderCare: blockStudentsSnapshot.size,
                pendingApprovals: pendingApprovalsSnapshot.size,
              };
            }
          }
        }

        setDashboardData({
          totalStudents: studentsSnapshot.size,
          totalStaff: staffSnapshot.size,
          totalWardens: wardensSnapshot.size,
          pendingTasks: tasksSnapshot.size,
          totalProjects: roomsSnapshot.size,
          monthlyExpenses: totalExpenses,
          monthlyIncome: totalIncome,
          recentActivities: activities,
          roomOccupancy: parseFloat(roomOccupancyRate.toFixed(1)),
          userSpecificData,
        });

        setTableData(checkTableData);
        setComplexTableData(complexData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, userType]);

  if (isLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center>
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex direction="column" mb="20px">
        <Heading size="xl" mb="2">
          {greeting}, {userData?.name || "User"}!
        </Heading>
        <Flex align="center">
          <Text fontSize="lg" mr="3">
            St Agnes Hostel Management System
          </Text>
          <Badge
            colorScheme={
              userType === "student"
                ? "green"
                : userType === "staff"
                ? "purple"
                : "blue"
            }
            fontSize="md"
            py="1"
            px="3"
          >
            {userType?.toUpperCase()}
          </Badge>
        </Flex>
      </Flex>

      {/* User-specific section */}
      <Box p="6" borderRadius="lg" bg={userTypeBg} mb="20px" boxShadow="md">
        <Text fontSize="lg" fontWeight="bold" mb="3">
          Your {userType} Dashboard
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {userType === "student" && (
            <>
              <MiniStatistics
                name="Room Number"
                value={dashboardData.userSpecificData.student.roomNumber}
              />
              <MiniStatistics
                name="Fee Status"
                value={dashboardData.userSpecificData.student.feeStatus}
              />
              <MiniStatistics
                name="Meal Plan"
                value={dashboardData.userSpecificData.student.mealPlan}
              />
            </>
          )}

          {userType === "staff" && (
            <>
              <MiniStatistics
                name="Department"
                value={dashboardData.userSpecificData.staff.department}
              />
              <MiniStatistics
                name="Assigned Tasks"
                value={dashboardData.userSpecificData.staff.assignedTasks}
              />
              <MiniStatistics
                name="Completed Tasks"
                value={dashboardData.userSpecificData.staff.completedTasks}
              />
            </>
          )}

          {userType === "warden" && (
            <>
              <MiniStatistics
                name="Hostel Block"
                value={dashboardData.userSpecificData.warden.hostelBlock}
              />
              <MiniStatistics
                name="Students Under Care"
                value={dashboardData.userSpecificData.warden.studentsUnderCare}
              />
              <MiniStatistics
                name="Pending Approvals"
                value={dashboardData.userSpecificData.warden.pendingApprovals}
              />
            </>
          )}
        </SimpleGrid>
      </Box>

      {/* General hostel stats */}
      <Text fontSize="xl" fontWeight="bold" mb="4">
        Hostel Overview
      </Text>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap="20px"
        mb="20px"
      >
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon
                  w="32px"
                  h="32px"
                  as={FaUserGraduate}
                  color={brandColor}
                />
              }
            />
          }
          name="Total Students"
          value={dashboardData.totalStudents}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={FaUserTie} color={brandColor} />
              }
            />
          }
          name="Staff Members"
          value={dashboardData.totalStaff}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={FaUserShield} color={brandColor} />
              }
            />
          }
          name="Wardens"
          value={dashboardData.totalWardens}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdAttachMoney} color={brandColor} />
              }
            />
          }
          name="Monthly Expenses"
          value={`$${dashboardData.monthlyExpenses.toFixed(2)}`}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)"
              icon={<Icon w="28px" h="28px" as={MdAddTask} color="white" />}
            />
          }
          name="Pending Tasks"
          value={dashboardData.pendingTasks}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="32px" h="32px" as={MdHome} color={brandColor} />}
            />
          }
          name="Room Occupancy"
          value={`${dashboardData.roomOccupancy}%`}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px" mb="20px">
        <TotalSpent
          title="Monthly Expenses Trend"
          currentAmount={dashboardData.monthlyExpenses}
          previousAmount={dashboardData.monthlyExpenses * 0.85}
        />
        <WeeklyRevenue
          title="Monthly Income"
          amount={dashboardData.monthlyIncome}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
        <CheckTable tableData={tableData} />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px">
          <DailyTraffic
            title="Room Occupancy"
            percentage={dashboardData.roomOccupancy}
          />
          <PieCard
            title="User Distribution"
            data={[
              { name: "Students", value: dashboardData.totalStudents },
              { name: "Staff", value: dashboardData.totalStaff },
              { name: "Wardens", value: dashboardData.totalWardens },
            ]}
          />
        </SimpleGrid>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
        <ComplexTable tableData={complexTableData} title="User Management" />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px">
          <Tasks
            title="Pending Tasks"
            tasks={dashboardData.recentActivities.map((activity, idx) => ({
              id: idx,
              name: activity.description,
              status: activity.completed ? "DONE" : "PENDING",
            }))}
          />
          <MiniStatistics
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={MdBarChart} color={brandColor} />
                }
              />
            }
            name="Monthly Income"
            value={`$${dashboardData.monthlyIncome.toFixed(2)}`}
            growth={
              dashboardData.monthlyIncome > dashboardData.monthlyExpenses
                ? "+positive"
                : "-negative"
            }
          />
        </SimpleGrid>
      </SimpleGrid>
    </Box>
  );
}
