import { Pressable, Text } from "native-base";

interface Props {
  value: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
}

const NumberPadButton = ({ value, onPress, onLongPress }: Props) => {
  return (
    <Pressable
      alignItems="center"
      justifyContent="center"
      p="3"
      width="33%"
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {({ isPressed }) => (
        <Text fontSize="2xl" opacity={isPressed ? "0.2" : "1"}>
          {value}
        </Text>
      )}
    </Pressable>
  );
};

export default NumberPadButton;
