import { Box, Circle, Pressable, Text } from "native-base";

interface Props {
  onPress?: () => void;
  title: string;
  icon: React.ReactNode;
  rightComponent?: React.ReactNode;
}

const SettingsItem = ({ onPress, icon, title, rightComponent }: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ isPressed }) => (
        <Box
          px="4"
          py="3"
          flexDir="row"
          alignItems="center"
          opacity={isPressed && onPress ? "0.2" : "1"}
        >
          <Circle bg="gray.800" size="10">
            {icon}
          </Circle>
          <Text variant="subtitle1" ml="3" flex="1">
            {title}
          </Text>
          {rightComponent}
        </Box>
      )}
    </Pressable>
  );
};

export default SettingsItem;
