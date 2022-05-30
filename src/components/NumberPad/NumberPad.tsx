import Ionicons from "@expo/vector-icons/Ionicons";
import { Box } from "native-base";
import NumberPadButton from "./NumberPadButton";

interface Props {
  onChange: (value: string) => void;
  backspaceIcon?: JSX.Element;
}

const NumberPad = ({ onChange }: Props) => {
  const inputs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <Box flexDirection="row" flexWrap="wrap" justifyContent="flex-end">
      {inputs.map(value => {
        return (
          <NumberPadButton
            value={value}
            onPress={() => onChange(value)}
            key={value}
          />
        );
      })}
      <NumberPadButton
        value={<Ionicons name="backspace-outline" size={24} />}
        onPress={() => onChange("backspace")}
        onLongPress={() => onChange("clear")}
      />
    </Box>
  );
};

export default NumberPad;
