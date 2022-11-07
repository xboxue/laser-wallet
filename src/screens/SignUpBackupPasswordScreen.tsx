import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useState } from "react";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";

const SignUpBackupPasswordScreen = () => {
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: { password: "" },
    onSubmit: ({ password }) =>
      navigation.navigate("SignUpConfirmPassword", { password }),
    validate: ({ password, confirmPassword }) => {
      const errors = {};
      if (!password) errors.password = "Required";
      else if (password.length < 8)
        errors.password = "Must be at least 8 characters";

      return errors;
    },
    validateOnChange: false,
  });

  return (
    <Box p="4" height="100%">
      <Text variant="h4" mb="1">
        Create backup password
      </Text>
      <Text fontSize="lg" mb="10">
        We encrypt your backup so that only you can restore your wallet. Do not
        lose this password.
      </Text>
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />

      <FormControl
        isInvalid={formik.touched.password && !!formik.errors.password}
        flex={1}
      >
        <Input
          placeholder="Password"
          value={formik.values.password}
          onChangeText={formik.handleChange("password")}
          onBlur={formik.handleBlur("password")}
          type="password"
          autoFocus
        />
        <FormControl.ErrorMessage>
          {formik.errors.password}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button _text={{ fontSize: "xl" }} onPress={formik.handleSubmit}>
        Next
      </Button>
    </Box>
  );
};

export default SignUpBackupPasswordScreen;
