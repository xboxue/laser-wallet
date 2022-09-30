import { Box, Text } from "native-base";
import { Pressable } from "react-native";

interface Props {
  onPress: () => void;
  subtitle: string;
  title: string;
  rightText?: string;
  icon: React.ReactNode;
}

const TokenItem = ({ onPress, subtitle, title, rightText, icon }: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          flexDirection="row"
          alignItems="center"
          px="4"
          py="2"
          opacity={pressed ? 0.3 : 1}
          bgColor="gray.50"
          rounded="xl"
          mx="3"
          my="1"
        >
          {icon}
          <Box ml="3" flex={1}>
            <Text variant="subtitle1">{title}</Text>
            <Text>{subtitle}</Text>
          </Box>
          {rightText && <Text variant="subtitle1">{rightText}</Text>}
        </Box>
      )}
    </Pressable>
  );
};

export default TokenItem;
