import { Box, Text } from "native-base";
import { PASSCODE_LENGTH } from "../../constants/auth";
import NumberPad from "../NumberPad/NumberPad";
import PasscodeInput from "../PasscodeInput/PasscodeInput";

interface Props {
  passcode: string;
  onChange: (value: string) => void;
  helperText?: string;
  toolbar?: React.ReactNode;
}

const PasscodeNumberPad = ({
  passcode,
  onChange,
  helperText,
  toolbar,
}: Props) => {
  return (
    <>
      <Box flex={1} justifyContent="center" alignItems="center">
        <PasscodeInput passcode={passcode} />
        <Box mt="3" />
        {helperText && <Text variant="subtitle2">{helperText}</Text>}
      </Box>
      {toolbar}
      <NumberPad
        onChange={(value) => {
          if (value === "backspace") {
            onChange(passcode.slice(0, passcode.length - 1));
          } else if (value === "clear") {
            onChange("");
          } else if (passcode.length < PASSCODE_LENGTH) {
            onChange(passcode.concat(value));
          }
        }}
      />
    </>
  );
};

export default PasscodeNumberPad;
