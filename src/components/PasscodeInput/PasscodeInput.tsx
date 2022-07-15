import { range } from "lodash";
import { Box, Circle } from "native-base";
import { PASSCODE_LENGTH } from "../../constants/auth";

interface Props {
  passcode: string;
}

const PasscodeInput = ({ passcode }: Props) => {
  return (
    <Box flexDirection="row">
      {range(PASSCODE_LENGTH).map((value, index) => (
        <Circle
          key={value}
          size="3"
          bg="black"
          mx="1"
          opacity={index >= passcode.length ? "0.3" : "1"}
        />
      ))}
    </Box>
  );
};

export default PasscodeInput;
