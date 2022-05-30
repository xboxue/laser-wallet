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
          navigation.navigate("SignUpGuardians");
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
    <Box flex={1} pb="4">
      <Box p="4">
        <Text variant="subtitle1">Protect your wallet</Text>
        <Text>Enter a passcode to keep your wallet safe.</Text>
      </Box>
      <Box flex={1} justifyContent="center" alignItems="center">
        <Box flexDirection="row" mb="3">
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
      </Box>
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
