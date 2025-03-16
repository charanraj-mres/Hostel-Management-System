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

interface Step3Props {
  formData: {
    course: string;
    semester: string;
    roomType: string;
    admissionPeriod: string;
    feeAmount: number;
    securityDeposit: number;
    totalAmount: number;
    feeStructures: {
      id: string;
      feeAmount: number;
      securityDeposit: number;
    }[];
  };
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleRadioChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    course?: string;
    semester?: string;
    roomType?: string;
    admissionPeriod?: string;
  };
  admissionPeriods?: {
    id: string;
    academicYear: string;
    startDate: string;
    endDate: string;
  }[];
}

const Step3: React.FC<Step3Props> = ({
  formData,
  handleChange,
  handleRadioChange,
  errors,
  admissionPeriods,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Academic & Room Information
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

      <FormControl isInvalid={!!errors.roomType}>
        <FormLabel>Room Type</FormLabel>
        <Select
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          placeholder="Select room type"
        >
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
        </Select>
        <FormErrorMessage>{errors.roomType}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.admissionPeriod}>
        <FormLabel>Admission Period</FormLabel>
        <Select
          name="admissionPeriod"
          value={formData.admissionPeriod}
          onChange={handleChange}
          placeholder="Select admission period"
        >
          {admissionPeriods?.map((period) => (
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
          <Text>Room Fee: ₹{formData.feeAmount}</Text>
          <Text>Security Deposit: ₹{formData.securityDeposit}</Text>
          <Text fontWeight="bold">Total Amount: ₹{formData.totalAmount}</Text>
        </Card>
      )}
    </VStack>
  );
};
export default Step3;
