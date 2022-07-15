import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PasscodeNumberPad from "../components/PasscodeNumberPad/PasscodeNumberPad";
import { PASSCODE_LENGTH } from "../constants/auth";
import { setPasscode } from "../features/auth/authSlice";

const SignUpPasscodeScreen = () => {
  const navigation = useNavigation();
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [passcodeToConfirm, setPasscodeToConfirm] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentPasscode.length > 0 && error) setError("");
    if (currentPasscode.length !== PASSCODE_LENGTH) return;

    if (!passcodeToConfirm) {
      setPasscodeToConfirm(currentPasscode);
      setCurrentPasscode("");
      return;
    }

    if (currentPasscode === passcodeToConfirm) {
      setCurrentPasscode("");
      setPasscodeToConfirm("");
      dispatch(setPasscode(currentPasscode));
      navigation.navigate("SignUpGuardians");
      return;
    } else {
      setCurrentPasscode("");
      setError("Incorrect");
    }
  }, [currentPasscode]);

  return (
    <Box flex={1} pb="4">
      <Box p="4">
        <Text variant="subtitle1">Protect your wallet</Text>
        <Text>Enter a passcode to keep your wallet safe.</Text>
      </Box>
      <PasscodeNumberPad
        passcode={currentPasscode}
        onChange={setCurrentPasscode}
        helperText={
          error || (!!passcodeToConfirm ? "Confirm passcode" : undefined)
        }
      />
    </Box>
  );
};

export default SignUpPasscodeScreen;
