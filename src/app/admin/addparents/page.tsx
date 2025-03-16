"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Flex,
  Text,
  Spinner,
  FormErrorMessage,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useDisclosure,
  Badge,
} from "@chakra-ui/react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "config/firebase";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { DeleteIcon } from "@chakra-ui/icons";

type Student = {
  id: string;
  name: string;
  uniqueId: string;
};

type Parent = {
  id: string;
  docId: string;
  name: string;
  email: string;
  studentName: string;
  guardianType: string;
};

export default function ParentManagement() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    guardianType: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "users"),
        where("userType", "==", "student"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const studentsList: Student[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        studentsList.push({
          id: doc.id,
          name: data.name,
          uniqueId: data.uniqueId,
        });
      });

      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "users"),
        where("userType", "==", "parent"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const parentsList: Parent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parentsList.push({
          id: data.id,
          docId: doc.id,
          name: data.name,
          email: data.email,
          studentName: data.studentName,
          guardianType: data.guardianType,
        });
      });

      setParents(parentsList);
    } catch (error) {
      console.error("Error fetching parents:", error);
      toast({
        title: "Error",
        description: "Failed to load parents. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.studentId) {
      newErrors.studentId = "Please select a student";
    }

    if (!formData.guardianType) {
      newErrors.guardianType = "Guardian type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Get selected student details
      const selectedStudent = students.find(
        (student) => student.id === formData.studentId
      );

      if (!selectedStudent) {
        throw new Error("Selected student not found");
      }

      // Create user in Firebase Authentication
      const auth = getAuth();
      const tempPassword = Math.random().toString(36).slice(-8);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        tempPassword
      );

      const uid = userCredential.user.uid;

      // Send password reset email
      await sendPasswordResetEmail(auth, formData.email);

      // Add parent document to Firestore
      await addDoc(collection(db, "users"), {
        id: uid,
        name: formData.name,
        email: formData.email,
        userType: "parent",
        status: "active",
        createdAt: serverTimestamp(),
        studentId: formData.studentId,
        studentUniqueId: selectedStudent.uniqueId,
        studentName: selectedStudent.name,
        guardianType: formData.guardianType,
      });

      toast({
        title: "Success",
        description:
          "Parent added successfully. A password reset email has been sent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        studentId: "",
        guardianType: "",
      });

      // Close modal and refresh parents list
      onClose();
      fetchParents();
    } catch (error) {
      console.error("Error adding parent:", error);
      toast({
        title: "Error",
        description: "Failed to add parent. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParent = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      try {
        setIsDeleting(true);

        // Delete parent document from Firestore
        await deleteDoc(doc(db, "users", docId));

        toast({
          title: "Success",
          description: "Parent deleted successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Refresh parents list
        fetchParents();
      } catch (error) {
        console.error("Error deleting parent:", error);
        toast({
          title: "Error",
          description: "Failed to delete parent. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getGuardianTypeDisplay = (type: string) => {
    switch (type) {
      case "father":
        return <Badge colorScheme="blue">Father</Badge>;
      case "mother":
        return <Badge colorScheme="pink">Mother</Badge>;
      case "guardian":
        return <Badge colorScheme="purple">Guardian</Badge>;
      default:
        return <Badge colorScheme="gray">Other</Badge>;
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} bg="gray.100">
      <Card flexDirection="column" w="100%" p={5} mx="auto" maxW="1000px">
        <Flex px="25px" mb="20px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Parent Management
          </Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Parent
          </Button>
        </Flex>

        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" py={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <Box px="25px" overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Student</Th>
                  <Th>Relationship</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {parents.length > 0 ? (
                  parents.map((parent) => (
                    <Tr key={parent.id}>
                      <Td>{parent.name}</Td>
                      <Td>{parent.email}</Td>
                      <Td>{parent.studentName}</Td>
                      <Td>{getGuardianTypeDisplay(parent.guardianType)}</Td>
                      <Td>
                        <IconButton
                          aria-label="Delete parent"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          isLoading={isDeleting}
                          onClick={() => handleDeleteParent(parent.docId)}
                        />
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={4}>
                      No parents found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Add Parent Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Parent</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" id="add-parent-form" onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.name} mb={4} isRequired>
                <FormLabel>Parent Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter parent's full name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email} mb={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter parent's email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.studentId} mb={4} isRequired>
                <FormLabel>Student</FormLabel>
                <Select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Select student"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.uniqueId})
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.studentId}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.guardianType} mb={4} isRequired>
                <FormLabel>Guardian Type</FormLabel>
                <Select
                  name="guardianType"
                  value={formData.guardianType}
                  onChange={handleChange}
                  placeholder="Select guardian type"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.guardianType}</FormErrorMessage>
              </FormControl>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              form="add-parent-form"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Add Parent
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
