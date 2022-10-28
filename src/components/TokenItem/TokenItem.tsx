import { random } from "lodash";
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
          px="2"
          py="2"
          opacity={pressed ? 0.3 : 1}
          rounded="xl"
          mx="3"
        >
          {icon}
          <Box ml="3" flex={1}>
            <Text variant="subtitle1">{title}</Text>
            <Text color="text.500">{subtitle}</Text>
          </Box>
          {rightText && <Text variant="subtitle2">{rightText}</Text>}
        </Box>
      )}
    </Pressable>
  );
};

export default TokenItem;
