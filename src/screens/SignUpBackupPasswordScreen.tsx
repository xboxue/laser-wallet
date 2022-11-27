import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Input } from "native-base";
import { useRef, useState } from "react";
import * as yup from "yup";
import EnableICloudPrompt from "../components/EnableICloudPrompt/EnableICloudPrompt";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";

const SignUpBackupPasswordScreen = () => {
  const [iCloudPromptOpen, setICloudPromptOpen] = useState(false);
  const navigation = useNavigation();
  const ref = useRef();

  const formik = useFormik({
    initialValues: { password: "" },
    onSubmit: ({ password }) =>
      navigation.navigate("SignUpConfirmPassword", {
        password,
      }),
    validationSchema: yup.object().shape({
      password: yup
        .string()
        .min(8, "Must be at least 8 characters")
        .required("Required"),
    }),
    validateOnMount: true,
  });

  return (
    <SignUpLayout
      title="Create backup password"
      subtitle="We encrypt your backup so that only you can restore your wallet. Do not lose this password."
      isDisabled={!formik.isValid}
      onNext={formik.handleSubmit}
    >
      <EnableICloudPrompt
        open={iCloudPromptOpen}
        onClose={() => setICloudPromptOpen(false)}
      />
      <Input
        placeholder="Password"
        value={formik.values.password}
        onChangeText={formik.handleChange("password")}
        onBlur={formik.handleBlur("password")}
        type="password"
        autoFocus
        ref={ref}
        onLayout={() => ref.current?.focus()}
      />
    </SignUpLayout>
  );
};

export default SignUpBackupPasswordScreen;
