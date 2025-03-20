import React from "react";
import {
  VStack,
  Heading,
  Card,
  Text,
  Divider,
  FormControl,
  Checkbox,
  FormErrorMessage,
  Box,
} from "@chakra-ui/react";

interface Step5Props {
  formData: {
    studentName: string;
    email: string;
    contactNumber: string;
    gender: string;
    dateOfBirth: string;
    aadharNumber: string;
    permanentAddress: string;
    currentAddress: string;
    guardianName: string;
    guardianRelation: string;
    guardianContact: string;
    course: string;
    semester: string;
    hostelName: string;
    academicYear: string;
    feeAmount: number;
    securityDeposit: number;
    totalAmount: number;
    termsAccepted: boolean;
  };
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    termsAccepted?: string;
  };
}

const Step5: React.FC<Step5Props> = ({
  formData,
  handleCheckboxChange,
  errors,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Review & Terms
      </Heading>

      <Card p={4} id="admission-form-preview">
        <Heading as="h3" size="sm" mb={3}>
          Personal Information
        </Heading>
        <Text>Name: {formData.studentName}</Text>
        <Text>Email: {formData.email}</Text>
        <Text>Contact: {formData.contactNumber}</Text>
        <Text>Gender: {formData.gender}</Text>
        <Text>Date of Birth: {formData.dateOfBirth}</Text>
        <Text>Aadhar Number: {formData.aadharNumber}</Text>

        <Divider my={3} />

        <Heading as="h3" size="sm" mb={3}>
          Address & Guardian Information
        </Heading>
        <Text>Permanent Address: {formData.permanentAddress}</Text>
        <Text>Current Address: {formData.currentAddress}</Text>
        <Text>
          Guardian: {formData.guardianName} ({formData.guardianRelation})
        </Text>
        <Text>Guardian Contact: {formData.guardianContact}</Text>

        <Divider my={3} />

        <Heading as="h3" size="sm" mb={3}>
          Academic & Hostel Information
        </Heading>
        <Text>Course: {formData.course}</Text>
        <Text>Semester: {formData.semester}</Text>
        <Text>Hostel: {formData.hostelName}</Text>
        <Text>Academic Year: {formData.academicYear}</Text>

        <Divider my={3} />

        <Heading as="h3" size="sm" mb={3}>
          Fee Details
        </Heading>
        <Text>Hostel Fee: ₹{formData.feeAmount}</Text>
        <Text>Security Deposit: ₹{formData.securityDeposit}</Text>
        <Text fontWeight="bold">Total Amount: ₹{formData.totalAmount}</Text>
      </Card>

      <Box p={4} borderWidth="1px" borderRadius="md">
        <Heading as="h3" size="sm" mb={3}>
          Terms and Conditions
        </Heading>
        <Text mb={2}>
          1. The hostel fee is non-refundable once the admission is confirmed.
        </Text>
        <Text mb={2}>
          2. Security deposit is refundable at the end of the stay, subject to
          deductions for damages, if any.
        </Text>
        <Text mb={2}>
          3. Students must follow all hostel rules and regulations.
        </Text>
        <Text mb={2}>
          4. Any violation of hostel rules may lead to disciplinary action.
        </Text>
        <Text mb={2}>
          5. The institute reserves the right to change the hostel allocation if
          needed.
        </Text>
      </Box>

      <FormControl isInvalid={!!errors.termsAccepted}>
        <Checkbox
          name="termsAccepted"
          isChecked={formData.termsAccepted}
          onChange={handleCheckboxChange}
        >
          I have read and agree to the terms and conditions
        </Checkbox>
        <FormErrorMessage>{errors.termsAccepted}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};

export default Step5;
