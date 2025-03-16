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
  email: string;
  uniqueId: string;
  gender: string;
  status: string;
};

export default function StudentManagement() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    uniqueId: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
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
          email: data.email,
          uniqueId: data.uniqueId,
          gender: data.gender,
          status: data.status,
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

    if (!formData.uniqueId.trim()) {
      newErrors.uniqueId = "Student ID is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
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

      // Add student document to Firestore
      await addDoc(collection(db, "users"), {
        id: uid,
        name: formData.name,
        email: formData.email,
        userType: "student",
        status: "active",
        createdAt: serverTimestamp(),
        uniqueId: formData.uniqueId,
        gender: formData.gender,
      });

      toast({
        title: "Success",
        description:
          "Student added successfully. A password reset email has been sent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        gender: "male",
        uniqueId: "",
      });

      // Close modal and refresh students list
      onClose();
      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        setIsDeleting(true);

        // Delete student document from Firestore
        await deleteDoc(doc(db, "users", docId));

        toast({
          title: "Success",
          description: "Student deleted successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Refresh students list
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
        toast({
          title: "Error",
          description: "Failed to delete student. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case "male":
        return <Badge colorScheme="blue">Male</Badge>;
      case "female":
        return <Badge colorScheme="pink">Female</Badge>;
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
            Student Management
          </Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Student
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
                  <Th>Student ID</Th>
                  <Th>Gender</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <Tr key={student.id}>
                      <Td>{student.name}</Td>
                      <Td>{student.email}</Td>
                      <Td>{student.uniqueId}</Td>
                      <Td>{getGenderDisplay(student.gender)}</Td>
                      <Td>
                        <IconButton
                          aria-label="Delete student"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          isLoading={isDeleting}
                          onClick={() => handleDeleteStudent(student.id)}
                        />
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={4}>
                      No students found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" id="add-student-form" onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.name} mb={4} isRequired>
                <FormLabel>Student Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter student's full name"
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
                  placeholder="Enter student's email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.uniqueId} mb={4} isRequired>
                <FormLabel>Student ID</FormLabel>
                <Input
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleChange}
                  placeholder="Enter student ID"
                />
                <FormErrorMessage>{errors.uniqueId}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.gender} mb={4} isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.gender}</FormErrorMessage>
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
              form="add-student-form"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Add Student
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
