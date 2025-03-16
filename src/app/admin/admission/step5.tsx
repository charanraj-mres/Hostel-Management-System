import {
  VStack,
  Heading,
  Card,
  Text,
  Divider,
  FormControl,
  Checkbox,
  FormErrorMessage,
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
    roomType: string;
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
        Review & Submit
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
          Academic & Room Information
        </Heading>
        <Text>Course: {formData.course}</Text>
        <Text>Semester: {formData.semester}</Text>
        <Text>Room Type: {formData.roomType}</Text>
        <Text>Academic Year: {formData.academicYear}</Text>

        <Divider my={3} />

        <Heading as="h3" size="sm" mb={3}>
          Fee Details
        </Heading>
        <Text>Room Fee: ₹{formData.feeAmount}</Text>
        <Text>Security Deposit: ₹{formData.securityDeposit}</Text>
        <Text fontWeight="bold">Total Amount: ₹{formData.totalAmount}</Text>
      </Card>

      <FormControl isInvalid={!!errors.termsAccepted}>
        <Checkbox
          name="termsAccepted"
          isChecked={formData.termsAccepted}
          onChange={handleCheckboxChange}
        >
          I agree to the terms and conditions
        </Checkbox>
        <FormErrorMessage>{errors.termsAccepted}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
export default Step5;
