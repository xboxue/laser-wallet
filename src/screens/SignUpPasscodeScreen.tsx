import { useNavigation } from "@react-navigation/native";
import { range } from "lodash";
import { Box, Circle, Text } from "native-base";
import { useEffect, useState } from "react";
import NumberPad from "../components/NumberPad/NumberPad";

const PASSCODE_LENGTH = 6;

const SignUpPasscodeScreen = () => {
  const navigation = useNavigation();
  const [passcode, setPasscode] = useState("");
  const [firstPasscode, setFirstPasscode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (passcode.length > 0 && error) {
      setError("");
    }

    if (passcode.length === PASSCODE_LENGTH) {
      if (firstPasscode) {
        if (passcode === firstPasscode) {
          // Store
        } else {
          setPasscode("");
          setError("Incorrect");
        }
      } else {
        setFirstPasscode(passcode);
        setPasscode("");
      }
    }
  }, [passcode]);

  return (
    <Box flex={1} justifyContent="flex-end" alignItems="center" pb="4">
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
      {firstPasscode && <Text>Confirm passcode</Text>}
      {error && <Text>{error}</Text>}
      <NumberPad
        onChange={value => {
          if (value === "backspace") {
            setPasscode(passcode.slice(0, passcode.length - 1));
          } else if (value === "clear") {
            setPasscode("");
          } else if (passcode.length < PASSCODE_LENGTH) {
            setPasscode(passcode.concat(value));
          }
        }}
      />
    </Box>
  );
};

export default SignUpPasscodeScreen;
