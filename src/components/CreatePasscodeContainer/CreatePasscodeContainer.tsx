import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PASSCODE_LENGTH } from "../../constants/auth";
import { setPasscode } from "../../features/auth/authSlice";
import PasscodeNumberPad from "../PasscodeNumberPad/PasscodeNumberPad";

interface Props {
  onSuccess: () => void;
}

const CreatePasscodeContainer = ({ onSuccess }: Props) => {
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
      onSuccess();
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
    />
  );
};

export default CreatePasscodeContainer;
