import { useFormik } from "formik";
import { Box, Button, FormControl, Input } from "native-base";
import { isValidPassword } from "../../services/cloudBackup";

interface Props {
  onSubmit: (password: string) => void;
  submitting: boolean;
}

const BackupPasswordForm = ({ onSubmit, submitting }: Props) => {
  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    onSubmit: ({ password }) => onSubmit(password),
    validate: ({ password, confirmPassword }) => {
      const errors = {};
      if (!password) errors.password = "Required";
      else if (password.length < 8)
        errors.password = "Must be at least 8 characters";

      if (!confirmPassword) errors.confirmPassword = "Required";
      else if (password !== confirmPassword)
        errors.confirmPassword = "Passwords don't match";

      return errors;
    },
    validateOnChange: false,
  });

  return (
    <Box>
      <FormControl
        isInvalid={formik.touched.password && !!formik.errors.password}
      >
        <Input
          type="password"
          placeholder="Password"
          value={formik.values.password}
          onChangeText={formik.handleChange("password")}
          onBlur={formik.handleBlur("password")}
          autoFocus
          size="lg"
        />
        <FormControl.ErrorMessage>
          {formik.errors.password}
        </FormControl.ErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={
          formik.touched.confirmPassword && !!formik.errors.confirmPassword
        }
      >
        <Input
          isDisabled={!isValidPassword(formik.values.password)}
          type="password"
          mt="3"
          placeholder="Confirm password"
          value={formik.values.confirmPassword}
          onChangeText={formik.handleChange("confirmPassword")}
          onBlur={formik.handleBlur("confirmPassword")}
          size="lg"
        />
        <FormControl.ErrorMessage>
          {formik.errors.confirmPassword}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button isLoading={submitting} mt="4" onPress={formik.handleSubmit}>
        Create backup
      </Button>
    </Box>
  );
};

export default BackupPasswordForm;
