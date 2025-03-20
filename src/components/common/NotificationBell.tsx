import { IconButton, Badge, Box } from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
interface CustomNotification {
  id: string;
  message: string;
  read: boolean;
}

interface NotificationBellProps {
  count: number;
  onClick: () => void;
  notifications: CustomNotification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
}
const NotificationBell: React.FC<NotificationBellProps> = ({
  count,
  onClick,
  notifications,
  onMarkAsRead,
}) => {
  return (
    <Box position="relative">
      <IconButton
        aria-label="Notifications"
        icon={<FaBell />}
        onClick={onClick}
      />
      {count > 0 && (
        <Badge
          colorScheme="red"
          borderRadius="full"
          position="absolute"
          top="-2px"
          right="-2px"
        >
          {count}
        </Badge>
      )}
    </Box>
  );
};
export default NotificationBell;
