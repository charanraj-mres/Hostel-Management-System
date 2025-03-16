"use client";
import { Box } from "@chakra-ui/react";
import UserManagementTable from "views/admin/dataTables/components/UserManagementTable";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "config/firebase";

export default function DataTables() {
  interface User {
    id: string;
    name: string;
    email: string;
    uniqueId: string;
    userType: string;
    status: string;
    createdAt: string;
  }

  const [tableData, setTableData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            uniqueId: data.uniqueId,
            userType: data.userType,
            status: data.status,
            createdAt: data.createdAt,
          };
        });
        setTableData(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} bg="gray.100">
      {loading ? (
        <Box textAlign="center" p={5}>
          Loading user data...
        </Box>
      ) : tableData.length > 0 ? (
        <UserManagementTable tableData={tableData} />
      ) : (
        <Box textAlign="center" p={5}>
          No user data available
        </Box>
      )}
    </Box>
  );
}
