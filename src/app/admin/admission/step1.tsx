import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Select,
  Text,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";

interface Student {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  gender: string;
  dateOfBirth: string;
  aadharNumber: string;
}

interface Step1Props {
  formData: {
    studentId: string;
    studentName: string;
    email: string;
    contactNumber: string;
    gender: string;
    dateOfBirth: string;
    aadharNumber: string;
  };
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (name: string, value: string) => void;
  handleStudentChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  errors: {
    studentId?: string;
    studentName?: string;
    email?: string;
    contactNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    aadharNumber?: string;
  };
  students: Student[];
}

const Step1: React.FC<Step1Props> = ({
  formData,
  handleChange,
  handleRadioChange,
  handleStudentChange,
  errors,
  students,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Student Selection
      </Heading>

      <FormControl isInvalid={!!errors.studentId}>
        <FormLabel>Select Student</FormLabel>
        <Select
          name="studentId"
          value={formData.studentId}
          onChange={handleStudentChange}
          placeholder="Select a student"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </Select>
        <FormErrorMessage>{errors.studentId}</FormErrorMessage>
      </FormControl>

      {formData.studentId && (
        <>
          <Heading as="h2" size="md" mt={4}>
            Student Information
          </Heading>

          <FormControl>
            <FormLabel>Student Name</FormLabel>
            <Input name="studentName" value={formData.studentName} isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              isReadOnly
            />
          </FormControl>

          <FormControl>
            <FormLabel>Contact Number</FormLabel>
            <Input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.gender}>
            <RadioGroup
              value={formData.gender}
              onChange={(value) => handleRadioChange("gender", value)}
            >
              <Stack direction="row">
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Stack>
            </RadioGroup>
            <FormErrorMessage>{errors.gender}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.dateOfBirth}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.dateOfBirth}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.aadharNumber}>
            <FormLabel>Aadhar Number</FormLabel>
            <Input
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
            />
            <FormErrorMessage>{errors.aadharNumber}</FormErrorMessage>
          </FormControl>
        </>
      )}
    </VStack>
  );
};

export default Step1;
