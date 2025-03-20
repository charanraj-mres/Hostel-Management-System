import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from "react-icons/md";

import { IRoute } from "types/navigation";

const routes: IRoute[] = [
  // all
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  // userType: "warden",
  {
    name: "All users",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/allusers",
    userType: "warden",
  },
  // userType: "staff",
  {
    name: "Add parents",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addparents",
    userType: "staff",
  },
  // userType: "warden",
  {
    name: "Add Staff",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addstaff",
    userType: "warden",
  },
  {
    name: "Add Hostel",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addhostel",
    userType: "warden",
  },
  // userType: "warden",
  {
    name: "Add Students",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/addstudents",
    userType: "warden",
  },
  // userType: "warden",
  {
    name: "Admission",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/admission",
    userType: "student",
  },
  {
    name: "Admission Details",
    layout: "/admin",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    path: "/admissiondetails",
    userType: "warden",
  },
  // userType: "staff, student",
  {
    name: "Attendance",
    layout: "/admin",
    path: "/attendance",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    userType: "staff, student",
  },
  {
    name: "Attendance Details",
    layout: "/admin",
    path: "/attendancedetails",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    userType: " warden, staff",
  },
  // userType: "parents",
  {
    name: "Check Attendance",
    layout: "/admin",
    path: "/check-attendance",
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    userType: "parent",
  },
];

export default routes;
