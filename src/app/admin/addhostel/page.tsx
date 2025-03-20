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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "config/firebase";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

type Hostel = {
  id: string;
  name: string;
  availableSeats: number;
  gender: string;
  feeAmount: number;
  securityDeposit: number;
  location: string;
  amenities: string;
  description: string;
};

export default function HostelManagement() {
  const [formData, setFormData] = useState({
    name: "",
    availableSeats: 0,
    gender: "male",
    feeAmount: 0,
    securityDeposit: 0,
    location: "",
    amenities: "",
    description: "",
  });
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "hostels"));
      const querySnapshot = await getDocs(q);
      const hostelsList: Hostel[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        hostelsList.push({
          id: doc.id,
          name: data.name,
          availableSeats: data.availableSeats,
          gender: data.gender,
          feeAmount: data.feeAmount,
          securityDeposit: data.securityDeposit,
          location: data.location,
          amenities: data.amenities,
          description: data.description,
        });
      });

      setHostels(hostelsList);
    } catch (error) {
      console.error("Error fetching hostels:", error);
      toast({
        title: "Error",
        description: "Failed to load hostels. Please try again.",
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
      newErrors.name = "Hostel name is required";
    }

    if (formData.availableSeats <= 0) {
      newErrors.availableSeats = "Available seats must be greater than 0";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (formData.feeAmount <= 0) {
      newErrors.feeAmount = "Fee amount must be greater than 0";
    }

    if (formData.securityDeposit < 0) {
      newErrors.securityDeposit = "Security deposit cannot be negative";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  const handleNumberChange = (name: string, value: string | number) => {
    setFormData({
      ...formData,
      [name]: typeof value === "string" ? parseInt(value) : value,
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

      // Add hostel document to Firestore
      await addDoc(collection(db, "hostels"), {
        name: formData.name,
        availableSeats: formData.availableSeats,
        gender: formData.gender,
        feeAmount: formData.feeAmount,
        securityDeposit: formData.securityDeposit,
        location: formData.location,
        amenities: formData.amenities,
        description: formData.description,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "Hostel added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: "",
        availableSeats: 0,
        gender: "male",
        feeAmount: 0,
        securityDeposit: 0,
        location: "",
        amenities: "",
        description: "",
      });

      // Close modal and refresh hostels list
      onClose();
      fetchHostels();
    } catch (error) {
      console.error("Error adding hostel:", error);
      toast({
        title: "Error",
        description: "Failed to add hostel. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHostel = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this hostel?")) {
      try {
        setIsDeleting(true);

        // Delete hostel document from Firestore
        await deleteDoc(doc(db, "hostels", docId));

        toast({
          title: "Success",
          description: "Hostel deleted successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Refresh hostels list
        fetchHostels();
      } catch (error) {
        console.error("Error deleting hostel:", error);
        toast({
          title: "Error",
          description: "Failed to delete hostel. Please try again.",
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
      case "mixed":
        return <Badge colorScheme="purple">Mixed</Badge>;
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
            Hostel Management
          </Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Hostel
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
                  <Th>Location</Th>
                  <Th>Gender</Th>
                  <Th>Available Seats</Th>
                  <Th>Fee Amount</Th>
                  <Th>Security Deposit</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {hostels.length > 0 ? (
                  hostels.map((hostel) => (
                    <Tr key={hostel.id}>
                      <Td>{hostel.name}</Td>
                      <Td>{hostel.location}</Td>
                      <Td>{getGenderDisplay(hostel.gender)}</Td>
                      <Td>{hostel.availableSeats}</Td>
                      <Td>₹{hostel.feeAmount.toLocaleString()}</Td>
                      <Td>₹{hostel.securityDeposit.toLocaleString()}</Td>
                      <Td>
                        <IconButton
                          aria-label="Delete hostel"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          mr={2}
                          isLoading={isDeleting}
                          onClick={() => handleDeleteHostel(hostel.id)}
                        />
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={4}>
                      No hostels found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Add Hostel Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Hostel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" id="add-hostel-form" onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.name} mb={4} isRequired>
                <FormLabel>Hostel Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hostel name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.location} mb={4} isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter hostel location"
                />
                <FormErrorMessage>{errors.location}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.gender} mb={4} isRequired>
                <FormLabel>Gender Type</FormLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="mixed">Mixed</option>
                </Select>
                <FormErrorMessage>{errors.gender}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={!!errors.availableSeats}
                mb={4}
                isRequired
              >
                <FormLabel>Available Seats</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.availableSeats}
                  onChange={(value) =>
                    handleNumberChange("availableSeats", value)
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.availableSeats}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.feeAmount} mb={4} isRequired>
                <FormLabel>Fee Amount (₹)</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.feeAmount}
                  onChange={(value) => handleNumberChange("feeAmount", value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.feeAmount}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.securityDeposit} mb={4}>
                <FormLabel>Security Deposit (₹)</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.securityDeposit}
                  onChange={(value) =>
                    handleNumberChange("securityDeposit", value)
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.securityDeposit}</FormErrorMessage>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Amenities</FormLabel>
                <Input
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="e.g. Wi-Fi, AC, Laundry, Canteen"
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the hostel"
                />
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
              form="add-hostel-form"
              isLoading={isSubmitting}
              loadingText="Submitting"
            >
              Add Hostel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
