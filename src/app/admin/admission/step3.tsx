import React from "react";
import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Select,
  Card,
  Text,
} from "@chakra-ui/react";

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

interface Step3Props {
  formData: {
    course: string;
    semester: string;
    hostelId: string;
    hostelName: string;
    admissionPeriod: string;
    feeAmount: number;
    securityDeposit: number;
    totalAmount: number;
    gender: string;
  };
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  errors: {
    course?: string;
    semester?: string;
    hostelId?: string;
    admissionPeriod?: string;
  };
  admissionPeriods: AdmissionPeriod[];
  hostels: Hostel[];
}

const Step3: React.FC<Step3Props> = ({
  formData,
  handleChange,
  errors,
  admissionPeriods,
  hostels,
}) => {
  // Filter hostels based on gender
  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.gender.toLowerCase() === formData.gender.toLowerCase() ||
      hostel.gender.toLowerCase() === "any"
  );

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Academic & Hostel Information
      </Heading>

      <FormControl isInvalid={!!errors.course}>
        <FormLabel>Course</FormLabel>
        <Input name="course" value={formData.course} onChange={handleChange} />
        <FormErrorMessage>{errors.course}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.semester}>
        <FormLabel>Semester</FormLabel>
        <Input
          name="semester"
          value={formData.semester}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.semester}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.hostelId}>
        <FormLabel>Hostel</FormLabel>
        <Select
          name="hostelId"
          value={formData.hostelId}
          onChange={handleChange}
          placeholder="Select hostel"
        >
          {filteredHostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name} - {hostel.availableSeats} seats available
            </option>
          ))}
        </Select>
        <FormErrorMessage>{errors.hostelId}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.admissionPeriod}>
        <FormLabel>Admission Period</FormLabel>
        <Select
          name="admissionPeriod"
          value={formData.admissionPeriod}
          onChange={handleChange}
          placeholder="Select admission period"
        >
          {admissionPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.academicYear} ({period.startDate} to {period.endDate})
            </option>
          ))}
        </Select>
        <FormErrorMessage>{errors.admissionPeriod}</FormErrorMessage>
      </FormControl>

      {formData.totalAmount > 0 && (
        <Card p={4}>
          <Heading as="h3" size="sm" mb={3}>
            Fee Details
          </Heading>
          <Text>Hostel Fee: ₹{formData.feeAmount}</Text>
          <Text>Security Deposit: ₹{formData.securityDeposit}</Text>
          <Text fontWeight="bold">Total Amount: ₹{formData.totalAmount}</Text>
        </Card>
      )}
    </VStack>
  );
};

export default Step3;
