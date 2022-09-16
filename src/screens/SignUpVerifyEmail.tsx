import { useClerk, useSignUp } from "@clerk/clerk-expo";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Box, Button, Input, Text } from "native-base";
import { useMutation } from "@tanstack/react-query";
import * as yup from "yup";

const SignUpVerifyEmailScreen = () => {
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const navigation = useNavigation();

  const { mutate: verifyCode, isLoading } = useMutation(
    async (code: string) => {
      if (!signUp) throw new Error();
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.verifications.emailAddress.status !== "verified") {
        throw new Error("Email verification failed");
      }
      return signUpAttempt;
    },

    {
      onSuccess: async (data) => {
        await clerk.setSession(data.createdSessionId);
        navigation.dispatch(StackActions.replace("SignUpGuardians"));
      },
      onError: (error) => {
        const clerkError = error?.errors?.[0];
        if (clerkError) formik.setFieldError("code", clerkError.longMessage);
      },
    }
  );

  const formik = useFormik({
    initialValues: { code: "" },
    onSubmit: (values) => verifyCode(values.code),
    validationSchema: yup.object().shape({
      code: yup.string().required("Required"),
    }),
    validateOnChange: false,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Verify your email</Text>
      <Text mb="4">
        Please enter the verification code we sent to your email.
      </Text>
      <Input
        placeholder="Code"
        value={formik.values.code}
        onChangeText={formik.handleChange("code")}
        onBlur={formik.handleBlur("code")}
        keyboardType="number-pad"
        autoFocus
        size="lg"
      />
      {formik.errors.code && <Text mt="1">{formik.errors.code}</Text>}
      <Button mt="4" onPress={formik.handleSubmit} isLoading={isLoading}>
        Next
      </Button>
    </Box>
  );
};

export default SignUpVerifyEmailScreen;
