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
  Radio,
  RadioGroup,
  Stack,
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

type Staff = {
  id: string;
  docId: string;
  name: string;
  email: string;
  staffId: string;
  gender: string;
  position: string;
  hostelBlock: string;
  contactNumber: string;
};

export default function StaffManagement() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    staffId: "",
    gender: "",
    position: "",
    hostelBlock: "",
    contactNumber: "",
  });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "users"),
        where("userType", "==", "staff"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const staffList: Staff[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        staffList.push({
          id: data.id,
          docId: doc.id,
          name: data.name,
          email: data.email,
          staffId: data.staffId,
          gender: data.gender,
          position: data.position,
          hostelBlock: data.hostelBlock,
          contactNumber: data.contactNumber,
        });
      });

      setStaff(staffList);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to load staff. Please try again.",
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

    if (!formData.staffId.trim()) {
      newErrors.staffId = "Staff ID is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.position) {
      newErrors.position = "Position is required";
    }

    if (!formData.hostelBlock) {
      newErrors.hostelBlock = "Hostel block is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
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

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });

    // Clear error when field is updated
    if (errors.gender) {
      setErrors({
        ...errors,
        gender: "",
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

      // Add staff document to Firestore
      await addDoc(collection(db, "users"), {
        id: uid,
        name: formData.name,
        email: formData.email,
        userType: "staff",
        status: "active",
        createdAt: serverTimestamp(),
        staffId: formData.staffId,
        gender: formData.gender,
        position: formData.position,
        hostelBlock: formData.hostelBlock,
        contactNumber: formData.contactNumber,
      });

      toast({
        title: "Success",
        description:
          "Staff added successfully. A password reset email has been sent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        staffId: "",
        gender: "",
        position: "",
        hostelBlock: "",
        contactNumber: "",
      });

      // Close modal and refresh staff list
      onClose();
      fetchStaff();
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        title: "Error",
        description: "Failed to add staff. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        setIsDeleting(true);

        // Delete staff document from Firestore
        await deleteDoc(doc(db, "users", docId));

        toast({
          title: "Success",
          description: "Staff deleted successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Refresh staff list
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
        toast({
          title: "Error",
          description: "Failed to delete staff. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getPositionDisplay = (position: string) => {
    switch (position) {
      case "warden":
        return <Badge colorScheme="red">Warden</Badge>;
      case "assistantWarden":
        return <Badge colorScheme="orange">Assistant Warden</Badge>;
      case "supervisor":
        return <Badge colorScheme="green">Supervisor</Badge>;
      case "security":
        return <Badge colorScheme="blue">Security</Badge>;
      case "maintenance":
        return <Badge colorScheme="purple">Maintenance</Badge>;
      case "cleaner":
        return <Badge colorScheme="teal">Cleaner</Badge>;
      default:
        return <Badge colorScheme="gray">Other</Badge>;
    }
  };

  const getGenderDisplay = (gender: string) => {
    return gender === "male" ? (
      <Badge colorScheme="blue">Male</Badge>
    ) : (
      <Badge colorScheme="pink">Female</Badge>
    );
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
            Staff Management
          </Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Staff
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
                  <Th>Staff ID</Th>
                  <Th>Name</Th>
                  <Th>Gender</Th>
                  <Th>Position</Th>
                  <Th>Hostel Block</Th>
                  <Th>Contact</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {staff.length > 0 ? (
                  staff.map((staffMember) => (
                    <Tr key={staffMember.id}>
                      <Td>{staffMember.staffId}</Td>
                      <Td>{staffMember.name}</Td>
                      <Td>{getGenderDisplay(staffMember.gender)}</Td>
                      <Td>{getPositionDisplay(staffMember.position)}</Td>
                      <Td>{staffMember.hostelBlock}</Td>
                      <Td>{staffMember.contactNumber}</Td>
                      <Td>
                        <IconButton
                          aria-label="Delete staff"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          isLoading={isDeleting}
                          onClick={() => handleDeleteStaff(staffMember.docId)}
                        />
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={4}>
                      No staff found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Add Staff Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Staff</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" id="add-staff-form" onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.name} mb={4} isRequired>
                <FormLabel>Staff Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter staff's full name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.staffId} mb={4} isRequired>
                <FormLabel>Staff ID</FormLabel>
                <Input
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  placeholder="Enter staff ID"
                />
                <FormErrorMessage>{errors.staffId}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email} mb={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter staff's email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.contactNumber} mb={4} isRequired>
                <FormLabel>Contact Number</FormLabel>
                <Input
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit contact number"
                />
                <FormErrorMessage>{errors.contactNumber}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.gender} mb={4} isRequired>
                <FormLabel>Gender</FormLabel>
                <RadioGroup
                  onChange={handleRadioChange}
                  value={formData.gender}
                  name="gender"
                >
                  <Stack direction="row">
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>{errors.gender}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.position} mb={4} isRequired>
                <FormLabel>Position</FormLabel>
                <Select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Select position"
                >
                  <option value="warden">Warden</option>
                  <option value="assistantWarden">Assistant Warden</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="security">Security</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.position}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.hostelBlock} mb={4} isRequired>
                <FormLabel>Hostel Block</FormLabel>
                <Select
                  name="hostelBlock"
                  value={formData.hostelBlock}
                  onChange={handleChange}
                  placeholder="Select hostel block"
                >
                  <option value="A">A Block</option>
                  <option value="B">B Block</option>
                  <option value="C">C Block</option>
                  <option value="D">D Block</option>
                </Select>
                <FormErrorMessage>{errors.hostelBlock}</FormErrorMessage>
              </FormControl>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              form="add-staff-form"
              isLoading={isSubmitting}
            >
              Add Staff
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
