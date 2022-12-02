import { Box, Text, IBoxProps } from "native-base";
import { Pressable } from "react-native";

interface Props extends IBoxProps {
  onPress: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const ActionCard = ({ onPress, title, subtitle, icon, ...props }: Props) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          flexDir="row"
          alignItems="center"
          py="4"
          px="3"
          bgColor="gray.900"
          rounded="lg"
          opacity={pressed ? "0.6" : "1"}
          {...props}
        >
          {icon}
          <Box ml="2">
            <Text variant="subtitle1">{title}</Text>
            <Text color="text.300">{subtitle}</Text>
          </Box>
        </Box>
      )}
    </Pressable>
  );
};

export default ActionCard;
