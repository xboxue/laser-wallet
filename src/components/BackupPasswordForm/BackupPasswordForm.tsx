import { Box, Button, FormControl, Input, Text } from "native-base";
import { useState } from "react";
import { isValidPassword } from "../../services/cloudBackup";

interface Props {
  onSubmit: (password: string) => void;
  submitting: boolean;
}

const BackupPasswordForm = ({ onSubmit, submitting }: Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <Box>
      <FormControl isInvalid={!isValidPassword(password)}>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoFocus
          size="lg"
        />
        <FormControl.ErrorMessage>
          {password && password.length < 8 && "Must be at least 8 characters"}
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={!!confirmPassword && password !== confirmPassword}
      >
        <Input
          isDisabled={!isValidPassword(password)}
          type="password"
          mt="3"
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          size="lg"
        />
        <FormControl.ErrorMessage>
          Passwords don't match
        </FormControl.ErrorMessage>
      </FormControl>
      <Button
        isLoading={submitting}
        isDisabled={!isValidPassword(password) || password !== confirmPassword}
        mt="4"
        onPress={() => onSubmit(password)}
      >
        Create backup
      </Button>
    </Box>
  );
};

export default BackupPasswordForm;
