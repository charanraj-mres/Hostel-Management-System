import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";

interface Step4Props {
  formData: any;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: { [key: string]: any };
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

      <FormControl isInvalid={!!errors["documents.aadharCard"]}>
        <FormLabel>Aadhar Card</FormLabel>
        <Input
          type="file"
          name="aadharCard"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,application/pdf"
        />
        <FormErrorMessage>{errors["documents.aadharCard"]}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors["documents.photo"]}>
        <FormLabel>Photo</FormLabel>
        <Input
          type="file"
          name="photo"
          onChange={handleFileChange}
          accept="image/jpeg,image/png"
        />
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
        <FormErrorMessage>{errors["documents.addressProof"]}</FormErrorMessage>
      </FormControl>
    </VStack>
  );
};
export default Step4;
