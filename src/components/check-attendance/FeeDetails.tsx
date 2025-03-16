import React, { useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stack,
  Heading,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface FeeData {
  type: string;
  amount: number;
  dueDate?: { seconds: number }; // Firebase Timestamp format
  status: "Paid" | "Pending" | "Overdue";
  receiptNumber?: string;
  paidDate?: { seconds: number };
  paymentMethod?: string;
}

interface FeeDetailsProps {
  feeData: FeeData[];
}

const FeeDetails: React.FC<FeeDetailsProps> = ({ feeData }) => {
  const [selectedFee, setSelectedFee] = useState<FeeData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleViewReceipt = (fee: FeeData) => {
    setSelectedFee(fee);
    onOpen();
  };

  if (!feeData || feeData.length === 0) {
    return <Text>No fee information available</Text>;
  }

  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Fee Type</Th>
            <Th>Amount</Th>
            <Th>Due Date</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {feeData.map((fee, index) => (
            <Tr key={index}>
              <Td>{fee.type}</Td>
              <Td>₹{fee.amount.toLocaleString()}</Td>
              <Td>
                {fee.dueDate?.seconds
                  ? new Date(fee.dueDate.seconds * 1000).toLocaleDateString()
                  : "N/A"}
              </Td>
              <Td>
                <Badge
                  colorScheme={
                    fee.status === "Paid"
                      ? "green"
                      : fee.status === "Pending"
                      ? "yellow"
                      : "red"
                  }
                >
                  {fee.status}
                </Badge>
              </Td>
              <Td>
                {fee.status === "Paid" ? (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleViewReceipt(fee)}
                  >
                    View Receipt
                  </Button>
                ) : (
                  <Button size="sm" colorScheme="green">
                    Pay Now
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Fee Receipt</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFee && (
              <Stack spacing={4}>
                <Heading size="md" textAlign="center">
                  School Fee Receipt
                </Heading>
                <Text textAlign="center">
                  Receipt #{selectedFee.receiptNumber ?? "N/A"}
                </Text>
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <GridItem>
                    <Text fontWeight="bold">Fee Type:</Text>
                    <Text>{selectedFee.type}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold">Amount:</Text>
                    <Text>₹{selectedFee.amount.toLocaleString()}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold">Payment Date:</Text>
                    <Text>
                      {selectedFee.paidDate?.seconds
                        ? new Date(
                            selectedFee.paidDate.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text fontWeight="bold">Payment Method:</Text>
                    <Text>{selectedFee.paymentMethod ?? "N/A"}</Text>
                  </GridItem>
                </Grid>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Download PDF</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FeeDetails;
