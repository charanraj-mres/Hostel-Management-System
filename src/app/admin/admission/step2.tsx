import React from "react";
import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  Input,
  Select,
} from "@chakra-ui/react";

interface Guardian {
  id: string;
  name: string;
  contactNumber: string;
  relation: string;
}

interface Step2Props {
  formData: {
    permanentAddress: string;
    currentAddress: string;
    guardianId: string;
    guardianName: string;
    guardianContact: string;
    guardianRelation: string;
  };
  handleChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleGuardianChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  errors: {
    permanentAddress?: string;
    currentAddress?: string;
    guardianId?: string;
    guardianName?: string;
    guardianContact?: string;
    guardianRelation?: string;
  };
  guardians: Guardian[];
}

const Step2: React.FC<Step2Props> = ({
  formData,
  handleChange,
  handleGuardianChange,
  errors,
  guardians,
}) => {
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

      <FormControl isInvalid={!!errors.guardianId}>
        <FormLabel>Select Guardian</FormLabel>
        <Select
          name="guardianId"
          value={formData.guardianId}
          onChange={handleGuardianChange}
          placeholder="Select guardian"
        >
          {guardians.map((guardian) => (
            <option key={guardian.id} value={guardian.id}>
              {guardian.name} ({guardian.relation})
            </option>
          ))}
        </Select>
        <FormErrorMessage>{errors.guardianId}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guardianName}>
        <FormLabel>Guardian Name</FormLabel>
        <Input
          name="guardianName"
          value={formData.guardianName}
          onChange={handleChange}
          readOnly
        />
        <FormErrorMessage>{errors.guardianName}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guardianContact}>
        <FormLabel>Guardian Contact</FormLabel>
        <Input
          name="guardianContact"
          value={formData.guardianContact}
          onChange={handleChange}
          readOnly
        />
        <FormErrorMessage>{errors.guardianContact}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guardianRelation}>
        <FormLabel>Relation with Guardian</FormLabel>
        <Input
          name="guardianRelation"
          value={formData.guardianRelation}
          onChange={handleChange}
          readOnly
        />
        <FormErrorMessage>{errors.guardianRelation}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};

export default Step2;
