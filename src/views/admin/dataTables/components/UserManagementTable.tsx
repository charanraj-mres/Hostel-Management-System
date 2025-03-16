import React, { useState } from "react";
import {
  Box,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  HStack,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
// Assets
import {
  MdCancel,
  MdCheckCircle,
  MdOutlineError,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "config/firebase"; // Adjust the import path as needed
import { getAuth, deleteUser } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";

type UserData = {
  id: string;
  name: string;
  email: string;
  uniqueId: string;
  userType: string;
  status: string;
  createdAt: string;
};

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
  onSave: (userData: UserData) => void;
};

const EditUserModal = ({
  isOpen,
  onClose,
  userData,
  onSave,
}: EditModalProps) => {
  const [formData, setFormData] = useState<UserData | null>(userData);
  const textColor = useColorModeValue("secondaryGray.900", "white");

  React.useEffect(() => {
    setFormData(userData);
  }, [userData]);

  if (!formData) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              value={formData.email}
              isReadOnly
              bg="gray.100"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Unique Id</FormLabel>
            <Input
              name="uniqueId"
              value={formData.uniqueId}
              isReadOnly
              bg="gray.100"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>User Type</FormLabel>
            <Select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="warden">Warden</option>
              <option value="admin">Admin</option>
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Status</FormLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disable">Disable</option>
              <option value="error">Error</option>
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const columnHelper = createColumnHelper<UserData>();

export default function UserManagementTable({
  tableData,
}: {
  tableData: UserData[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<UserData[]>(tableData);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // For delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Update local data when tableData prop changes
  React.useEffect(() => {
    setData(tableData);
  }, [tableData]);

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    onOpen();
  };

  const openDeleteConfirmation = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteClick = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);

      // Call Cloud Function to delete both auth and Firestore data
      // This is the secure way to handle user deletion
      const functions = getFunctions();
      const deleteUserFunction = httpsCallable(functions, "deleteUser");

      await deleteUserFunction({ uid: userToDelete.id });

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", userToDelete.id));

      // Update local state
      setData(data.filter((item) => item.id !== userToDelete.id));

      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been deleted successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      closeDeleteConfirmation();
    }
  };

  const handleSaveUser = async (updatedUser: UserData) => {
    try {
      setIsLoading(true);
      // Update user in Firestore
      const userRef = doc(db, "users", updatedUser.id);
      await updateDoc(userRef, {
        name: updatedUser.name,
        userType: updatedUser.userType,
        status: updatedUser.status,
      });

      // Update local state
      setData(
        data.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      toast({
        title: "User updated",
        description: `${updatedUser.name}'s information has been updated.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format dates safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          NAME
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("uniqueId", {
      id: "uniqueId",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          UNIQUE ID
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          EMAIL
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("userType", {
      id: "userType",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          USER TYPE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          STATUS
        </Text>
      ),
      cell: (info) => {
        const status = info.getValue();
        let icon;
        let color;

        switch (status) {
          case "active":
            icon = MdCheckCircle;
            color = "green.500";
            break;
          case "inactive":
            icon = MdCancel;
            color = "red.500";
            break;
          case "approved":
            icon = MdCheckCircle;
            color = "green.500";
            break;
          case "disable":
            icon = MdCancel;
            color = "yellow.500";
            break;
          case "error":
            icon = MdOutlineError;
            color = "orange.500";
            break;
          default:
            icon = MdOutlineError;
            color = "orange.500";
        }

        return (
          <Flex align="center">
            <Icon w="24px" h="24px" me="5px" color={color} as={icon} />
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {status}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          CREATED AT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {formatDate(info.getValue())}
        </Text>
      ),
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          ACTIONS
        </Text>
      ),
      cell: (info) => {
        const user = info.row.original;
        return (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Icon as={MdEdit} />}
              onClick={() => handleEditClick(user)}
              isDisabled={isLoading}
            >
              Edit
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<Icon as={MdDelete} />}
              onClick={() => openDeleteConfirmation(user)}
              isDisabled={isLoading}
            >
              Delete
            </Button>
          </HStack>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });

  if (!data || data.length === 0) {
    return (
      <Card flexDirection="column" w="100%" p={5} textAlign="center">
        <Text>No user data available</Text>
      </Card>
    );
  }

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: "scroll", lg: "hidden" }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            User Management
          </Text>
          <Menu />
        </Flex>
        <Box position="relative">
          {isLoading && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="rgba(255, 255, 255, 0.7)"
              zIndex="1"
              justifyContent="center"
              alignItems="center"
            >
              <Spinner size="xl" color="blue.500" />
            </Flex>
          )}
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex
                        justifyContent="space-between"
                        align="center"
                        fontSize={{ sm: "10px", lg: "12px" }}
                        color="gray.400"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "desc" ? (
                            <Icon as={MdCancel} />
                          ) : (
                            <Icon as={MdCheckCircle} />
                          )
                        ) : null}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      borderColor={borderColor}
                      px="10px"
                      py="10px"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
      <EditUserModal
        isOpen={isOpen}
        onClose={onClose}
        userData={selectedUser}
        onSave={handleSaveUser}
      />
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteConfirmation}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {userToDelete?.name}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteConfirmation}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteClick}
                ml={3}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
