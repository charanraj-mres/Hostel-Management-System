import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react";

interface Step2Props {
  formData: {
    permanentAddress: string;
    currentAddress: string;
    guardianName: string;
    guardianContact: string;
    guardianRelation: string;
  };
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  errors: {
    permanentAddress?: string;
    currentAddress?: string;
    guardianName?: string;
    guardianContact?: string;
    guardianRelation?: string;
  };
}

const Step2: React.FC<Step2Props> = ({ formData, handleChange, errors }) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Address & Guardian Information
      </Heading>

      <FormControl isInvalid={!!errors.permanentAddress}>
        <FormLabel>Permanent Address</FormLabel>
        <Textarea
          name="permanentAddress"
          value={formData.permanentAddress}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.permanentAddress}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.currentAddress}>
        <FormLabel>Current Address</FormLabel>
        <Textarea
          name="currentAddress"
          value={formData.currentAddress}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.currentAddress}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guardianName}>
        <FormLabel>Guardian Name</FormLabel>
        <Input
          name="guardianName"
          value={formData.guardianName}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.guardianName}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guardianContact}>
        <FormLabel>Guardian Contact</FormLabel>
        <Input
          name="guardianContact"
          value={formData.guardianContact}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.guardianContact}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guardianRelation}>
        <FormLabel>Relation with Guardian</FormLabel>
        <Input
          name="guardianRelation"
          value={formData.guardianRelation}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.guardianRelation}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
export default Step2;
