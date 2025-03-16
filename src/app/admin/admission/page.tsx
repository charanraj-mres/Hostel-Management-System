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
} from "firebase/firestore";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import step5 from "./step5";

import { db } from "config/firebase";
import { getStorage } from "firebase/storage";

const storage = getStorage();
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Step5 from "./step5";

interface AdmissionPeriod {
  id: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  isActive: boolean;
}

interface FeeStructure {
  id: string;
  roomType: string;
  amount: number;
  securityDeposit: number;
  academicYear: string;
}

interface AdmissionFormData {
  studentName: string;
  email: string;
  contactNumber: string;
  gender: string;
  dateOfBirth: string;
  aadharNumber: string;
  permanentAddress: string;
  currentAddress: string;
  guardianName: string;
  guardianContact: string;
  guardianRelation: string;
  course: string;
  semester: string;
  roomType: string;
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
  feeStructures: {
    id: string;
    feeAmount: number;
    securityDeposit: number;
  }[];
}
export default function HostelAdmissionProcess() {
  const [currentStep, setCurrentStep] = useState(1);
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>(
    []
  );
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const toast = useToast();
  const formBackgroundColor = useColorModeValue("white", "gray.700");

  const [formData, setFormData] = useState<AdmissionFormData>({
    studentName: "",
    email: "",
    contactNumber: "",
    gender: "",
    dateOfBirth: "",
    aadharNumber: "",
    permanentAddress: "",
    currentAddress: "",
    guardianName: "",
    guardianContact: "",
    guardianRelation: "",
    course: "",
    semester: "",
    roomType: "",
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
    feeStructures: [],
  });

  useEffect(() => {
    fetchAdmissionPeriods();
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    if (formData.roomType && formData.admissionPeriod) {
      calculateFees();
    }
  }, [formData.roomType, formData.admissionPeriod]);

  // Modify your fetchAdmissionPeriods function to check all periods first
  const fetchAdmissionPeriods = async () => {
    try {
      setIsLoading(true);
      // First, let's check if there are ANY periods at all
      const allPeriodsQuery = query(collection(db, "admissionPeriods"));
      const allSnapshot = await getDocs(allPeriodsQuery);
      console.log("All admission periods count:", allSnapshot.size);

      // Then check for active ones
      const q = query(
        collection(db, "admissionPeriods"),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);
      console.log("Active admission periods count:", querySnapshot.size);

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

  const fetchFeeStructures = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "feeStructures"));
      const querySnapshot = await getDocs(q);
      const fees: FeeStructure[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fees.push({
          id: doc.id,
          roomType: data.roomType,
          amount: data.amount,
          securityDeposit: data.securityDeposit,
          academicYear: data.academicYear,
        });
      });

      setFeeStructures(fees);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      toast({
        title: "Error",
        description: "Failed to load fee structures.",
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

    const selectedFeeStructure = feeStructures.find(
      (fee) =>
        fee.roomType === formData.roomType &&
        fee.academicYear === selectedPeriod?.academicYear
    );

    if (selectedFeeStructure && selectedPeriod) {
      setFormData({
        ...formData,
        feeAmount: selectedFeeStructure.amount,
        securityDeposit: selectedFeeStructure.securityDeposit,
        totalAmount:
          selectedFeeStructure.amount + selectedFeeStructure.securityDeposit,
        academicYear: selectedPeriod.academicYear,
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
      if (!formData.studentName.trim()) {
        newErrors.studentName = "Student name is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = "Contact number is required";
      } else if (!/^\d{10}$/.test(formData.contactNumber)) {
        newErrors.contactNumber = "Contact number must be 10 digits";
      }
      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }
      if (!formData.aadharNumber.trim()) {
        newErrors.aadharNumber = "Aadhar number is required";
      } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
        newErrors.aadharNumber = "Aadhar number must be 12 digits";
      }
    } else if (step === 2) {
      if (!formData.permanentAddress.trim()) {
        newErrors.permanentAddress = "Permanent address is required";
      }
      if (!formData.currentAddress.trim()) {
        newErrors.currentAddress = "Current address is required";
      }
      if (!formData.guardianName.trim()) {
        newErrors.guardianName = "Guardian name is required";
      }
      if (!formData.guardianContact.trim()) {
        newErrors.guardianContact = "Guardian contact is required";
      } else if (!/^\d{10}$/.test(formData.guardianContact)) {
        newErrors.guardianContact = "Guardian contact must be 10 digits";
      }
      if (!formData.guardianRelation.trim()) {
        newErrors.guardianRelation = "Guardian relation is required";
      }
    } else if (step === 3) {
      if (!formData.course.trim()) {
        newErrors.course = "Course is required";
      }
      if (!formData.semester.trim()) {
        newErrors.semester = "Semester is required";
      }
      if (!formData.roomType) {
        newErrors.roomType = "Room type is required";
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
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading file:", error);
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload documents
      // const aadharCardUrl = await uploadFile(
      //   formData.documents.aadharCard as File,
      //   `documents/${formData.studentName}/aadhar_card`
      // );
      // const photoUrl = await uploadFile(
      //   formData.documents.photo as File,
      //   `documents/${formData.studentName}/photo`
      // );
      // const addressProofUrl = await uploadFile(
      //   formData.documents.addressProof as File,
      //   `documents/${formData.studentName}/address_proof`
      // );

      // // Generate PDF
      // const pdfBlob = await generatePdf();
      // const pdfUrl = pdfBlob
      //   ? await uploadFile(
      //       pdfBlob as unknown as File,
      //       `forms/${formData.studentName}_admission_form.pdf`
      //     )
      //   : "";
      // Create local URLs for the files instead of uploading to Firebase
      const aadharCardUrl = formData.documents.aadharCard
        ? URL.createObjectURL(formData.documents.aadharCard)
        : "";
      const photoUrl = formData.documents.photo
        ? URL.createObjectURL(formData.documents.photo)
        : "";
      const addressProofUrl = formData.documents.addressProof
        ? URL.createObjectURL(formData.documents.addressProof)
        : "";

      // Generate PDF
      const pdfBlob = await generatePdf();
      const pdfUrl = pdfBlob ? URL.createObjectURL(pdfBlob) : "";

      // Save admission data to Firestore
      const admissionDocRef = await addDoc(collection(db, "hostelAdmissions"), {
        studentName: formData.studentName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        aadharNumber: formData.aadharNumber,
        permanentAddress: formData.permanentAddress,
        currentAddress: formData.currentAddress,
        guardianName: formData.guardianName,
        guardianContact: formData.guardianContact,
        guardianRelation: formData.guardianRelation,
        course: formData.course,
        semester: formData.semester,
        roomType: formData.roomType,
        admissionPeriod: formData.admissionPeriod,
        feeAmount: formData.feeAmount,
        securityDeposit: formData.securityDeposit,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
        admissionStatus: formData.admissionStatus,
        academicYear: formData.academicYear,
        termsAccepted: formData.termsAccepted,
        aadharCardUrl,
        photoUrl,
        addressProofUrl,
        pdfUrl,
        createdAt: serverTimestamp(),
      });

      // Update admission period
      const periodDocRef = doc(
        db,
        "admissionPeriods",
        formData.admissionPeriod
      );
      await updateDoc(periodDocRef, {
        isActive: false,
      });

      toast({
        title: "Admission successful",
        description: "Admission form submitted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        studentName: "",
        email: "",
        contactNumber: "",
        gender: "",
        dateOfBirth: "",
        aadharNumber: "",
        permanentAddress: "",
        currentAddress: "",
        guardianName: "",
        guardianContact: "",
        guardianRelation: "",
        course: "",
        semester: "",
        roomType: "",
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
        feeStructures: [],
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
    <Box bg={formBackgroundColor} p={8} rounded="md" shadow="md">
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
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <Step2
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <Step3
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                admissionPeriods={admissionPeriods} // Add this line
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
          </VStack>
          <Divider my={6} />
          <HStack justify="space-between">
            {currentStep > 1 && (
              <Button onClick={handlePrevious} isDisabled={isSubmitting}>
                Previous
              </Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} isDisabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button
                colorScheme="teal"
                onClick={handleSubmit}
                isLoading={isSubmitting}
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
