import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Input } from "native-base";
import { useRef } from "react";
import * as yup from "yup";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";

const SignUpAccessCodeScreen = () => {
  const navigation = useNavigation();
  const ref = useRef();

  const formik = useFormik({
    initialValues: { accessCode: "" },
    onSubmit: async (values) => {
      navigation.navigate("SignUpEmail");
    },
    validationSchema: yup.object().shape({
      accessCode: yup
        .string()
        .required("Access code is required")
        .equals(["demo"], "Invalid access code"),
    }),
    validateOnChange: false,
  });

  return (
    <SignUpLayout
      title="Enter access code"
      subtitle="Laser is currently in private beta. Join the waitlist to get early access."
      onNext={formik.handleSubmit}
      isDisabled={!formik.values.accessCode}
      hasInput
    >
      <ErrorDialog
        isOpen={!!formik.errors.accessCode}
        onClose={() => formik.setErrors({})}
        title="Access code is invalid."
        subtitle={formik.errors.accessCode}
      />
      <Input
        placeholder="Access code"
        value={formik.values.accessCode}
        onChangeText={formik.handleChange("accessCode")}
        onBlur={formik.handleBlur("accessCode")}
        autoCapitalize="none"
        ref={ref}
        onLayout={() => ref.current?.focus()}
      />
    </SignUpLayout>
  );
};

export default SignUpAccessCodeScreen;
