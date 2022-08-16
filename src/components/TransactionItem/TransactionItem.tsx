import { format, fromUnixTime, isToday } from "date-fns";
import { Box, Image, Pressable, Text } from "native-base";

interface Props {
  onPress: () => void;
  title: string;
  subtitle?: string;
  amount: string;
  timestamp: Date;
  icon: React.ReactNode;
}

const TransactionItem = ({
  onPress,
  icon,
  title,
  subtitle,
  amount,
  timestamp,
}: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ isPressed }) => (
        <Box
          flexDirection="row"
          alignItems="center"
          py="2"
          opacity={isPressed ? 0.3 : 1}
        >
          {icon}
          <Box ml="3">
            <Text variant="subtitle1">{title}</Text>
            <Text>
              {format(timestamp, isToday(timestamp) ? "h:mm a" : "LLL d")}{" "}
              {subtitle && `· ${subtitle}`}
            </Text>
          </Box>
          <Text variant="subtitle1" ml="auto">
            {amount}
          </Text>
        </Box>
      )}
    </Pressable>
  );
};

export default TransactionItem;
