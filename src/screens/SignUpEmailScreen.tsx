import { useSignUp } from "@clerk/clerk-react";
import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Box, Button, Input, Text } from "native-base";
import { useMutation } from "react-query";
import * as yup from "yup";

const SignUpEmailScreen = () => {
  const { signUp } = useSignUp();
  const navigation = useNavigation();

  const { mutate: verifyEmail, isLoading } = useMutation(
    async (email: string) => {
      if (!signUp) throw new Error();
      const signUpAttempt = await signUp.create({
        emailAddress: email,
      });
      return signUpAttempt.prepareEmailAddressVerification();
    },
    {
      onSuccess: () => {
        navigation.navigate("SignUpVerifyEmail");
      },
      onError: (error) => {
        const clerkError = error?.errors?.[0];
        if (clerkError) formik.setFieldError("email", clerkError.longMessage);
      },
    }
  );

  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit: (values) => verifyEmail(values.email),
    validationSchema: yup.object().shape({
      email: yup.string().email("Invalid email").required("Required"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Create account</Text>
      <Text mb="4">
        You'll be able to easily recover your wallet using your account.
      </Text>
      <Input
        placeholder="Email"
        value={formik.values.email}
        onChangeText={formik.handleChange("email")}
        onBlur={formik.handleBlur("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus
        size="lg"
      />
      {formik.errors.email && <Text mt="1">{formik.errors.email}</Text>}
      <Button mt="4" onPress={formik.handleSubmit} isLoading={isLoading}>
        Next
      </Button>
      <Button
        variant="ghost"
        mt="1"
        onPress={() => navigation.navigate("SignUpAuth")}
      >
        Skip
      </Button>
    </Box>
  );
};

export default SignUpEmailScreen;
