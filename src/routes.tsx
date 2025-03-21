import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from "react-icons/md";

export interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon: JSX.Element;
  userType?: string | string[];
}

const routes: IRoute[] = [
  // Accessible to all authenticated users
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  // Admin routes - warden only
  {
    name: "All users",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/allusers",
    userType: "warden",
  },
  {
    name: "Add Staff",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addstaff",
    userType: "warden",
  },
  {
    name: "Register Complaint",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/complaints",
    userType: "student",
  },
  {
    name: "Manage Complaints",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/WardenComplaintManagement",
    userType: "warden, staff",
  },
  {
    name: "Add Hostel",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addhostel",
    userType: "warden",
  },
  {
    name: "Add Students",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addstudents",
    userType: "warden",
  },
  {
    name: "Admission Details",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/admissiondetails",
    userType: "warden",
  },
  // Staff routes
  {
    name: "Add parents",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addparents",
    userType: "staff",
  },
  // Staff and warden routes
  {
    name: "Attendance Details",
    layout: "/admin",
    path: "/attendancedetails",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    userType: ["warden", "staff"],
  },
  // Staff and student routes
  {
    name: "Attendance",
    layout: "/admin",
    path: "/attendance",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    userType: ["staff", "student"],
  },
  // Student routes
  {
    name: "Admission",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/admission",
    userType: "student",
  },
  // Parent routes
  {
    name: "Check Attendance",
    layout: "/admin",
    path: "/check-attendance",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    userType: "parent",
  },
];

export default routes;
