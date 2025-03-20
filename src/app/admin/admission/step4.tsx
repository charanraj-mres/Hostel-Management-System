import React from "react";
import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
  FormHelperText,
} from "@chakra-ui/react";

interface Step4Props {
  formData: {
    documents: {
      aadharCard: File | null;
      photo: File | null;
      addressProof: File | null;
    };
  };
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    "documents.aadharCard"?: string;
    "documents.photo"?: string;
    "documents.addressProof"?: string;
  };
}

const Step4: React.FC<Step4Props> = ({
  formData,
  handleFileChange,
  errors,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="md">
        Document Upload
      </Heading>

      <Text mb={2}>
        Please upload the following documents for verification. All documents
        should be clear and readable.
      </Text>

      <FormControl isInvalid={!!errors["documents.aadharCard"]}>
        <FormLabel>Aadhar Card</FormLabel>
        <Input
          type="file"
          name="aadharCard"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,application/pdf"
        />
        <FormHelperText>
          Upload a scanned copy of your Aadhar card (JPG, PNG, or PDF)
        </FormHelperText>
        <FormErrorMessage>{errors["documents.aadharCard"]}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors["documents.photo"]}>
        <FormLabel>Recent Passport Size Photo</FormLabel>
        <Input
          type="file"
          name="photo"
          onChange={handleFileChange}
          accept="image/jpeg,image/png"
        />
        <FormHelperText>
          Upload a recent passport size photo (JPG or PNG)
        </FormHelperText>
        <FormErrorMessage>{errors["documents.photo"]}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors["documents.addressProof"]}>
        <FormLabel>Address Proof</FormLabel>
        <Input
          type="file"
          name="addressProof"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,application/pdf"
        />
        <FormHelperText>
          Upload a document as proof of address (Utility bill, Passport, etc. in
          JPG, PNG, or PDF)
        </FormHelperText>
        <FormErrorMessage>{errors["documents.addressProof"]}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};

export default Step4;
