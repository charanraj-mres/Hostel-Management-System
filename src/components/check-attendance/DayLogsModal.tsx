import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
} from "@chakra-ui/react";

interface DayLog {
  timestamp: { seconds: number }; // Firebase Timestamp format
  status: "Punched In" | "Punched Out";
  isLate?: boolean;
  regularized?: boolean;
  notes?: string;
}

interface AttendanceLog {
  timestamp: { seconds: number }; // Firebase Timestamp format
  status: "Punched In" | "Punched Out";
  isLate?: boolean;
  regularized?: boolean;
  notes?: string;
}

interface DayLogsModalProps {
  isOpen: boolean;
  date: Date | null;
  onClose: () => void;
  dayLogs: DayLog[];
  logs: AttendanceLog[];
  studentName: string;
}

const DayLogsModal: React.FC<DayLogsModalProps> = ({
  isOpen,
  date,
  logs,
  onClose,
  dayLogs,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {dayLogs.length > 0
            ? `Attendance Details - ${new Date(
                dayLogs[0]?.timestamp?.seconds * 1000
              ).toLocaleDateString()}`
            : "Attendance Details"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {dayLogs.length === 0 ? (
            <Text>No attendance records found for this day.</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Time</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dayLogs.map((log, index) => (
                  <Tr key={index}>
                    <Td>
                      {new Date(
                        log.timestamp.seconds * 1000
                      ).toLocaleTimeString()}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          log.status === "Punched In"
                            ? log.isLate
                              ? "yellow"
                              : "green"
                            : log.status === "Punched Out"
                            ? "blue"
                            : log.regularized
                            ? "purple"
                            : "red"
                        }
                      >
                        {log.status}
                        {log.isLate && log.status === "Punched In" && " (Late)"}
                      </Badge>
                    </Td>
                    <Td>{log.notes || "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DayLogsModal;
