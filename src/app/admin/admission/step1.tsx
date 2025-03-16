import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";

interface Step1Props {
  formData: {
    studentName: string;
    email: string;
    contactNumber: string;
    gender: string;
    dateOfBirth: string;
    aadharNumber: string;
  };
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (name: string, value: string) => void;
  errors: {
    studentName?: string;
    email?: string;
    contactNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    aadharNumber?: string;
  };
}

const Step1: React.FC<Step1Props> = ({
  formData,
  handleChange,
  handleRadioChange,
  errors,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Personal Information
      </Heading>

      <FormControl isInvalid={!!errors.studentName}>
        <FormLabel>Student Name</FormLabel>
        <Input
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.studentName}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.email}>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.contactNumber}>
        <FormLabel>Contact Number</FormLabel>
        <Input
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.contactNumber}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.gender}>
        <FormLabel>Gender</FormLabel>
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
    </VStack>
  );
};
export default Step1;
