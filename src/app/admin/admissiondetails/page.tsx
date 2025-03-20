"use client";
import {
  Box,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Input,
  Select,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Link,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "config/firebase";
import { SearchIcon, DownloadIcon, ViewIcon } from "@chakra-ui/icons";

export default function AdmissionDetails() {
  // Interface for admission data
  interface Admission {
    id: string;
    studentName: string;
    email: string;
    contactNumber: string;
    gender: string;
    hostelName: string;
    course: string;
    semester: string;
    academicYear: string;
    totalAmount: number;
    paymentStatus: string;
    admissionStatus: string;
    createdAt: any;
    pdfUrl?: string;
  }

  // States
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  // Fetch admissions data
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const admissionsCollection = collection(db, "hostelAdmissions");
        const admissionSnapshot = await getDocs(admissionsCollection);
        const admissionList = admissionSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            studentName: data.studentName || "",
            email: data.email || "",
            contactNumber: data.contactNumber || "",
            gender: data.gender || "",
            hostelName: data.hostelName || "",
            course: data.course || "",
            semester: data.semester || "",
            academicYear: data.academicYear || "",
            totalAmount: data.totalAmount || 0,
            paymentStatus: data.paymentStatus || "pending",
            admissionStatus: data.admissionStatus || "pending",
            createdAt: data.createdAt
              ? new Date(data.createdAt.toDate()).toLocaleDateString()
              : "N/A",
            pdfUrl: data.pdfUrl || "",
          };
        });
        setAdmissions(admissionList);
        setFilteredAdmissions(admissionList);
      } catch (error) {
        console.error("Error fetching admissions:", error);
        toast({
          title: "Error",
          description: "Failed to load admission data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let result = admissions;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (admission) =>
          admission.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          admission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admission.hostelName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (admission) => admission.admissionStatus === statusFilter
      );
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      result = result.filter(
        (admission) => admission.paymentStatus === paymentFilter
      );
    }

    setFilteredAdmissions(result);
  }, [searchTerm, statusFilter, paymentFilter, admissions]);

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const admissionRef = doc(db, "hostelAdmissions", id);
      await updateDoc(admissionRef, {
        admissionStatus: newStatus,
      });

      // Update local state
      const updatedAdmissions = admissions.map((admission) =>
        admission.id === id
          ? { ...admission, admissionStatus: newStatus }
          : admission
      );

      setAdmissions(updatedAdmissions);

      toast({
        title: "Status Updated",
        description: `Admission status changed to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update admission status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // View admission details
  const viewAdmissionDetails = (admission: Admission) => {
    setSelectedAdmission(admission);
    setIsModalOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} px={4}>
      <Heading mb={6}>Hostel Admission Details</Heading>

      {/* Filters */}
      <Flex mb={6} direction={{ base: "column", md: "row" }} gap={4}>
        <Flex align="center" flex={1}>
          <SearchIcon mr={2} />
          <Input
            placeholder="Search by name, email, or hostel"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Flex>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          width={{ base: "100%", md: "200px" }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>

        <Select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          width={{ base: "100%", md: "200px" }}
        >
          <option value="all">All Payments</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </Select>

        <Button onClick={resetFilters} colorScheme="gray">
          Reset Filters
        </Button>
      </Flex>

      {/* Table */}
      {loading ? (
        <Flex justify="center" p={10}>
          <Spinner size="xl" />
        </Flex>
      ) : filteredAdmissions.length > 0 ? (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student Name</Th>
                <Th>Email</Th>
                <Th>Hostel</Th>
                <Th>Course</Th>
                <Th>Academic Year</Th>
                <Th>Total Amount</Th>
                <Th>Payment Status</Th>
                <Th>Admission Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAdmissions.map((admission) => (
                <Tr key={admission.id}>
                  <Td>{admission.studentName}</Td>
                  <Td>{admission.email}</Td>
                  <Td>{admission.hostelName}</Td>
                  <Td>
                    {admission.course} (Sem {admission.semester})
                  </Td>
                  <Td>{admission.academicYear}</Td>
                  <Td>₹{admission.totalAmount.toLocaleString()}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        admission.paymentStatus === "completed"
                          ? "green"
                          : "yellow"
                      }
                    >
                      {admission.paymentStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        admission.admissionStatus === "approved"
                          ? "green"
                          : admission.admissionStatus === "rejected"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {admission.admissionStatus}
                    </Badge>
                  </Td>
                  <Td>{admission.createdAt}</Td>
                  <Td>
                    <Flex gap={2}>
                      <Button
                        size="sm"
                        onClick={() => viewAdmissionDetails(admission)}
                        leftIcon={<ViewIcon />}
                      >
                        View
                      </Button>
                      {admission.pdfUrl && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          as={Link}
                          href={admission.pdfUrl}
                          target="_blank"
                          leftIcon={<DownloadIcon />}
                        >
                          PDF
                        </Button>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Box textAlign="center" p={10}>
          No admission records found
        </Box>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Admission Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAdmission && (
              <Box>
                <Heading size="md" mb={4}>
                  Student Information
                </Heading>
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Td fontWeight="bold">Name</Td>
                      <Td>{selectedAdmission.studentName}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Email</Td>
                      <Td>{selectedAdmission.email}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Contact</Td>
                      <Td>{selectedAdmission.contactNumber}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Gender</Td>
                      <Td>{selectedAdmission.gender}</Td>
                    </Tr>
                  </Tbody>
                </Table>

                <Heading size="md" mt={6} mb={4}>
                  Hostel & Course Details
                </Heading>
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Td fontWeight="bold">Hostel</Td>
                      <Td>{selectedAdmission.hostelName}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Course</Td>
                      <Td>{selectedAdmission.course}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Semester</Td>
                      <Td>{selectedAdmission.semester}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Academic Year</Td>
                      <Td>{selectedAdmission.academicYear}</Td>
                    </Tr>
                  </Tbody>
                </Table>

                <Heading size="md" mt={6} mb={4}>
                  Payment Information
                </Heading>
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Td fontWeight="bold">Total Amount</Td>
                      <Td>₹{selectedAdmission.totalAmount.toLocaleString()}</Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Payment Status</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            selectedAdmission.paymentStatus === "completed"
                              ? "green"
                              : "yellow"
                          }
                        >
                          {selectedAdmission.paymentStatus}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Admission Status</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            selectedAdmission.admissionStatus === "approved"
                              ? "green"
                              : selectedAdmission.admissionStatus === "rejected"
                              ? "red"
                              : "yellow"
                          }
                        >
                          {selectedAdmission.admissionStatus}
                        </Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedAdmission &&
              selectedAdmission.admissionStatus === "pending" && (
                <>
                  <Button
                    colorScheme="green"
                    mr={3}
                    onClick={() => {
                      handleStatusChange(selectedAdmission.id, "approved");
                      setIsModalOpen(false);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    colorScheme="red"
                    mr={3}
                    onClick={() => {
                      handleStatusChange(selectedAdmission.id, "rejected");
                      setIsModalOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
