import React from "react";
import { Box, Flex, Text, Grid, GridItem, Badge } from "@chakra-ui/react";

interface AttendanceLog {
  timestamp: { seconds: number }; // Firebase Timestamp format
  status: "Punched In" | "Punched Out";
  isLate?: boolean;
  regularized?: boolean;
}

interface AttendanceCalendarProps {
  logs: AttendanceLog[];
  month: number;
  year: number;
  onDayClick: (date: Date) => void;
}

type AttendanceStatus =
  | "present"
  | "absent"
  | "missing-out"
  | "regularized"
  | "late"
  | "weekend"
  | "";

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  logs,
  month,
  year,
  onDayClick,
}) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getStatusForDay = (day: number): AttendanceStatus => {
    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp.seconds * 1000);
      return (
        logDate.getFullYear() === year &&
        logDate.getMonth() === month &&
        logDate.getDate() === day
      );
    });

    const hasPunchIn = dayLogs.some((log) => log.status === "Punched In");
    const hasPunchOut = dayLogs.some((log) => log.status === "Punched Out");

    if (dayLogs.length === 0) {
      const currentDate = new Date(year, month, day);
      return ![0, 6].includes(currentDate.getDay()) && currentDate <= new Date()
        ? "absent"
        : "weekend";
    }

    if (hasPunchIn && hasPunchOut) {
      return dayLogs.some((log) => log.isLate) ? "late" : "present";
    } else if (hasPunchIn) {
      return "missing-out";
    } else {
      return dayLogs.some((log) => log.regularized) ? "regularized" : "absent";
    }
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "green.500";
      case "absent":
        return "red.500";
      case "missing-out":
        return "orange.500";
      case "regularized":
        return "blue.500";
      case "late":
        return "yellow.500";
      case "weekend":
        return "gray.200";
      default:
        return "white";
    }
  };

  return (
    <Box w="100%" bg="white" p={4} borderRadius="md" shadow="md">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontWeight="bold">
          {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
          {year}
        </Text>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} textAlign="center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <GridItem key={day} fontWeight="bold" p={2}>
            {day}
          </GridItem>
        ))}

        {days.map((day, index) => {
          if (day === null)
            return <GridItem key={`empty-${index}`} p={2}></GridItem>;

          const status = getStatusForDay(day);
          return (
            <GridItem
              key={`day-${day}`}
              p={2}
              bg={getStatusColor(status)}
              color={status === "weekend" || !status ? "black" : "white"}
              borderRadius="md"
              cursor="pointer"
              onClick={() => onDayClick(new Date(year, month, day))}
              _hover={{ opacity: 0.8 }}
            >
              {day}
            </GridItem>
          );
        })}
      </Grid>

      <Flex mt={4} justifyContent="center" gap={4} flexWrap="wrap">
        <Badge colorScheme="green">Present</Badge>
        <Badge colorScheme="red">Absent</Badge>
        <Badge colorScheme="orange">Missing Punch Out</Badge>
        <Badge colorScheme="blue">Regularized</Badge>
        <Badge colorScheme="yellow">Late</Badge>
      </Flex>
    </Box>
  );
};

export default AttendanceCalendar;
