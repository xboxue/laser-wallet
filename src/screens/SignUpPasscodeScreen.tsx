import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import { useState } from "react";
import NumberPad from "../components/NumberPad/NumberPad";

const SignUpPasscodeScreen = () => {
  const navigation = useNavigation();
  const [passcode, setPasscode] = useState("");

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <Text>{passcode}</Text>
      <NumberPad
        onChange={value => {
          if (value === "backspace") {
            setPasscode(passcode.slice(0, passcode.length - 1));
          } else if (value === "clear") {
            setPasscode("");
          } else {
            setPasscode(passcode.concat(value));
          }
        }}
      />
    </Box>
  );
};

export default SignUpPasscodeScreen;
