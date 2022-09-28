import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication";
import { Box, Icon, Switch, Text } from "native-base";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FaceIdIcon from "../../../assets/face-id.svg";
import { PASSCODE_LENGTH } from "../../constants/auth";
import {
  selectIsBiometricsEnabled,
  setIsBiometricsEnabled,
} from "../../features/auth/authSlice";
import useBiometricTypes from "../../hooks/useBiometricTypes";
import { setItem } from "../../services/keychain";
import PasscodeNumberPad from "../PasscodeNumberPad/PasscodeNumberPad";

interface Props {
  onSuccess: () => void;
}

const CreatePasscodeContainer = ({ onSuccess }: Props) => {
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [passcodeToConfirm, setPasscodeToConfirm] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const isBiometricsEnabled = useSelector(selectIsBiometricsEnabled);

  const { data: biometricTypes } = useBiometricTypes();

  const renderToolbar = () => {
    if (!biometricTypes) return;
    const [type] = biometricTypes;

    if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      return (
        <Box flexDir="row" alignItems="center" px="4" mb="3">
          <FaceIdIcon width={20} height={20} fill="black" />
          <Text ml="3" variant="subtitle2">
            Use Face ID
          </Text>
          <Switch
            ml="auto"
            isChecked={isBiometricsEnabled}
            onToggle={() =>
              dispatch(setIsBiometricsEnabled(!isBiometricsEnabled))
            }
          />
        </Box>
      );

    if (type === LocalAuthentication.AuthenticationType.FINGERPRINT)
      return (
        <Box flexDir="row" alignItems="center" px="4" mb="3">
          <Icon size="lg" as={<MaterialIcons name="fingerprint" />} />
          <Text ml="2" variant="subtitle2">
            Use fingerprint
          </Text>
          <Switch
            ml="auto"
            isChecked={isBiometricsEnabled}
            onToggle={() =>
              dispatch(setIsBiometricsEnabled(!isBiometricsEnabled))
            }
          />
        </Box>
      );
  };

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
      setItem("passcode", currentPasscode).then(() => onSuccess());
      return;
    } else {
      setCurrentPasscode("");
      setError("Incorrect");
    }
  }, [currentPasscode]);

  return (
    <PasscodeNumberPad
      passcode={currentPasscode}
      onChange={setCurrentPasscode}
      helperText={
        error || (!!passcodeToConfirm ? "Confirm passcode" : undefined)
      }
      toolbar={renderToolbar()}
    />
  );
};

export default CreatePasscodeContainer;
