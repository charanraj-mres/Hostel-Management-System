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
  Heading,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Checkbox,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
} from "@chakra-ui/react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Step5 from "./step5";
import PaymentStep from "./paymentStep";

import { db } from "config/firebase";
import { getStorage } from "firebase/storage";

const storage = getStorage();
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Student {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  gender: string;
  dateOfBirth: string;
  aadharNumber: string;
}

interface Guardian {
  id: string;
  name: string;
  contactNumber: string;
  relation: string;
}

interface AdmissionPeriod {
  id: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  isActive: boolean;
}

interface Hostel {
  id: string;
  name: string;
  availableSeats: number;
  gender: string;
  feeAmount: number;
  securityDeposit: number;
}

interface AdmissionFormData {
  studentId: string;
  studentName: string;
  email: string;
  contactNumber: string;
  gender: string;
  dateOfBirth: string;
  aadharNumber: string;
  permanentAddress: string;
  currentAddress: string;
  guardianId: string;
  guardianName: string;
  guardianContact: string;
  guardianRelation: string;
  course: string;
  semester: string;
  hostelId: string;
  hostelName: string;
  admissionPeriod: string;
  documents: {
    aadharCard: File | null;
    photo: File | null;
    addressProof: File | null;
  };
  feeAmount: number;
  securityDeposit: number;
  totalAmount: number;
  paymentStatus: string;
  admissionStatus: string;
  academicYear: string;
  termsAccepted: boolean;
  paymentId: string;
  orderId: string;
}

export default function HostelAdmissionProcess() {
  const [currentStep, setCurrentStep] = useState(1);
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>(
    []
  );
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const toast = useToast();
  const formBackgroundColor = useColorModeValue("white", "gray.700");

  const [formData, setFormData] = useState<AdmissionFormData>({
    studentId: "",
    studentName: "",
    email: "",
    contactNumber: "",
    gender: "",
    dateOfBirth: "",
    aadharNumber: "",
    permanentAddress: "",
    currentAddress: "",
    guardianId: "",
    guardianName: "",
    guardianContact: "",
    guardianRelation: "",
    course: "",
    semester: "",
    hostelId: "",
    hostelName: "",
    admissionPeriod: "",
    documents: {
      aadharCard: null,
      photo: null,
      addressProof: null,
    },
    feeAmount: 0,
    securityDeposit: 0,
    totalAmount: 0,
    paymentStatus: "pending",
    admissionStatus: "pending",
    academicYear: "",
    termsAccepted: false,
    paymentId: "",
    orderId: "",
  });

  useEffect(() => {
    fetchAdmissionPeriods();
    fetchHostels();
    fetchStudents();
    fetchGuardians();
  }, []);

  useEffect(() => {
    if (formData.hostelId && formData.admissionPeriod) {
      calculateFees();
    }
  }, [formData.hostelId, formData.admissionPeriod]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "users"),
        where("userType", "==", "student")
      );
      const querySnapshot = await getDocs(q);
      const studentsList: Student[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        studentsList.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          contactNumber: data.contactNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          aadharNumber: data.aadharNumber,
        });
      });

      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuardians = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "users"),
        where("userType", "==", "parent")
      );
      const querySnapshot = await getDocs(q);
      const guardiansList: Guardian[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        guardiansList.push({
          id: doc.id,
          name: data.name,
          contactNumber: data.contactNumber,
          relation: data.relation || "Guardian",
        });
      });

      setGuardians(guardiansList);
    } catch (error) {
      console.error("Error fetching guardians:", error);
      toast({
        title: "Error",
        description: "Failed to load guardians.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmissionPeriods = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "admissionPeriods"),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const periods: AdmissionPeriod[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        periods.push({
          id: doc.id,
          startDate: data.startDate,
          endDate: data.endDate,
          academicYear: data.academicYear,
          isActive: data.isActive,
        });
      });

      setAdmissionPeriods(periods);
    } catch (error) {
      console.error("Error fetching admission periods:", error);
      toast({
        title: "Error",
        description: "Failed to load admission periods.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        });
      });
      try {
        console.log(hostelsList);
      } catch (e) {
        console.log(e);
      }

      setHostels(hostelsList);
    } catch (error) {
      console.error("Error fetching hostels:", error);
      toast({
        title: "Error",
        description: "Failed to load hostels.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFees = () => {
    const selectedPeriod = admissionPeriods.find(
      (period) => period.id === formData.admissionPeriod
    );

    const selectedHostel = hostels.find(
      (hostel) => hostel.id === formData.hostelId
    );

    if (selectedHostel && selectedPeriod) {
      setFormData({
        ...formData,
        hostelName: selectedHostel.name,
        feeAmount: selectedHostel.feeAmount,
        securityDeposit: selectedHostel.securityDeposit,
        totalAmount: selectedHostel.feeAmount + selectedHostel.securityDeposit,
        academicYear: selectedPeriod.academicYear,
      });
    }
  };

  const handleStudentChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const studentId = e.target.value;
    const student = students.find((s) => s.id === studentId);

    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        contactNumber: student.contactNumber || "", // Add fallback empty string
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        aadharNumber: student.aadharNumber,
      });
    }
  };

  const handleGuardianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const guardianId = e.target.value;
    const guardian = guardians.find((g) => g.id === guardianId);

    if (guardian) {
      setFormData({
        ...formData,
        guardianId: guardian.id,
        guardianName: guardian.name,
        guardianContact: guardian.contactNumber,
        guardianRelation: guardian.relation,
      });
    }
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

  const handleRadioChange = (name: string, value: string) => {
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };
  const storeFileLocally = async (file: File) => {
    try {
      // Create a local URL for the file
      const fileUrl = URL.createObjectURL(file);
      return fileUrl;
    } catch (error) {
      console.error("Error storing file locally:", error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [name]: files[0],
        },
      });

      if (errors[`documents.${name}`]) {
        setErrors({
          ...errors,
          [`documents.${name}`]: "",
        });
      }
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.studentId) {
        newErrors.studentId = "Student selection is required";
      }
    } else if (step === 2) {
      if (!formData.permanentAddress.trim()) {
        newErrors.permanentAddress = "Permanent address is required";
      }
      if (!formData.currentAddress.trim()) {
        newErrors.currentAddress = "Current address is required";
      }
      if (!formData.guardianId) {
        newErrors.guardianId = "Guardian selection is required";
      }
    } else if (step === 3) {
      if (!formData.course.trim()) {
        newErrors.course = "Course is required";
      }
      if (!formData.semester.trim()) {
        newErrors.semester = "Semester is required";
      }
      if (!formData.hostelId) {
        newErrors.hostelId = "Hostel selection is required";
      }
      if (!formData.admissionPeriod) {
        newErrors.admissionPeriod = "Admission period is required";
      }
    } else if (step === 4) {
      if (!formData.documents.aadharCard) {
        newErrors["documents.aadharCard"] = "Aadhar card is required";
      }
      if (!formData.documents.photo) {
        newErrors["documents.photo"] = "Photo is required";
      }
      if (!formData.documents.addressProof) {
        newErrors["documents.addressProof"] = "Address proof is required";
      }
    } else if (step === 5) {
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "You must accept the terms and conditions";
      }
    } else if (step === 6) {
      if (!formData.paymentId) {
        newErrors.paymentId = "Payment must be completed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      // Instead of uploading to Firebase, we'll just store a reference locally
      return await storeFileLocally(file);
    } catch (error) {
      console.error("Error handling file:", error);
      throw error;
    }
  };

  const generatePdf = async () => {
    setIsPdfGenerating(true);
    try {
      const content = document.getElementById("admission-form-preview");
      if (!content) return;

      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`hostel_admission_form_${formData.studentName}.pdf`);

      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    setFormData({
      ...formData,
      paymentStatus: "completed",
      paymentId: paymentId,
      orderId: orderId,
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Store files locally instead of uploading to Firebase
      const aadharCardUrl = formData.documents.aadharCard
        ? await storeFileLocally(formData.documents.aadharCard as File)
        : "";
      const photoUrl = formData.documents.photo
        ? await storeFileLocally(formData.documents.photo as File)
        : "";
      const addressProofUrl = formData.documents.addressProof
        ? await storeFileLocally(formData.documents.addressProof as File)
        : "";

      // Generate PDF
      const pdfBlob = await generatePdf();
      const pdfUrl = pdfBlob ? URL.createObjectURL(pdfBlob as Blob) : "";

      // Save admission data to Firestore
      const admissionDocRef = await addDoc(collection(db, "hostelAdmissions"), {
        studentId: formData.studentId,
        studentName: formData.studentName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        aadharNumber: formData.aadharNumber,
        permanentAddress: formData.permanentAddress,
        currentAddress: formData.currentAddress,
        guardianId: formData.guardianId,
        guardianName: formData.guardianName,
        guardianContact: formData.guardianContact,
        guardianRelation: formData.guardianRelation,
        course: formData.course,
        semester: formData.semester,
        hostelId: formData.hostelId,
        hostelName: formData.hostelName,
        admissionPeriod: formData.admissionPeriod,
        feeAmount: formData.feeAmount,
        securityDeposit: formData.securityDeposit,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
        paymentId: formData.paymentId,
        orderId: formData.orderId,
        admissionStatus: "approved", // Auto-approve if payment is successful
        academicYear: formData.academicYear,
        termsAccepted: formData.termsAccepted,
        aadharCardUrl,
        photoUrl,
        addressProofUrl,
        pdfUrl,
        localFiles: true, // Add a flag to indicate files are stored locally
        createdAt: serverTimestamp(),
      });

      // Update hostel available seats
      const hostelDocRef = doc(db, "hostels", formData.hostelId);
      const hostelDoc = await getDoc(hostelDocRef);
      if (hostelDoc.exists()) {
        const hostelData = hostelDoc.data();
        await updateDoc(hostelDocRef, {
          availableSeats: Math.max(0, hostelData.availableSeats - 1),
        });
      }

      toast({
        title: "Admission successful",
        description: "Admission form submitted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        studentId: "",
        studentName: "",
        email: "",
        contactNumber: "",
        gender: "",
        dateOfBirth: "",
        aadharNumber: "",
        permanentAddress: "",
        currentAddress: "",
        guardianId: "",
        guardianName: "",
        guardianContact: "",
        guardianRelation: "",
        course: "",
        semester: "",
        hostelId: "",
        hostelName: "",
        admissionPeriod: "",
        documents: {
          aadharCard: null,
          photo: null,
          addressProof: null,
        },
        feeAmount: 0,
        securityDeposit: 0,
        totalAmount: 0,
        paymentStatus: "pending",
        admissionStatus: "pending",
        academicYear: "",
        termsAccepted: false,
        paymentId: "",
        orderId: "",
      });

      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting admission form:", error);
      toast({
        title: "Error",
        description: "Failed to submit admission form.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      bg={formBackgroundColor}
      p={8}
      rounded="md"
      shadow="md"
      className="mt-24"
    >
      <Heading as="h1" mb={6}>
        Hostel Admission Process
      </Heading>
      {isLoading ? (
        <Flex justify="center" align="center" height="100%">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <VStack spacing={4} align="stretch">
            {currentStep === 1 && (
              <Step1
                formData={formData}
                handleChange={handleChange}
                handleRadioChange={handleRadioChange}
                handleStudentChange={handleStudentChange}
                errors={errors}
                students={students}
              />
            )}
            {currentStep === 2 && (
              <Step2
                formData={formData}
                handleChange={handleChange}
                handleGuardianChange={handleGuardianChange}
                errors={errors}
                guardians={guardians}
              />
            )}
            {currentStep === 3 && (
              <Step3
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                admissionPeriods={admissionPeriods}
                hostels={hostels}
              />
            )}
            {currentStep === 4 && (
              <Step4
                formData={formData}
                handleFileChange={handleFileChange}
                errors={errors}
              />
            )}
            {currentStep === 5 && (
              <Step5
                formData={formData}
                handleCheckboxChange={handleCheckboxChange}
                errors={errors}
              />
            )}
            {currentStep === 6 && (
              <PaymentStep
                formData={formData}
                onPaymentSuccess={handlePaymentSuccess}
                errors={errors}
              />
            )}
          </VStack>
          <Divider my={6} />
          <HStack justify="space-between">
            {currentStep > 1 && (
              <Button onClick={handlePrevious} isDisabled={isSubmitting}>
                Previous
              </Button>
            )}
            {currentStep < 6 ? (
              <Button onClick={handleNext} isDisabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button
                colorScheme="teal"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!formData.paymentId}
              >
                Submit
              </Button>
            )}
          </HStack>
        </>
      )}
    </Box>
  );
}
