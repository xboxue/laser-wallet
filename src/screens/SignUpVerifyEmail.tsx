import { useClerk, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { setEmail } from "../features/wallet/walletSlice";
import { ClerkAPIError } from "@clerk/types";

const SignUpVerifyEmailScreen = ({ route }) => {
  const { isSignUp } = route.params;
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const clerk = useClerk();

  const { mutate: verifySignInCode, isLoading: isVerifyingSignIn } =
    useMutation(
      async (code: string) => {
        if (!signIn) throw new Error();
        const signInAttempt = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (signInAttempt.status !== "complete") {
          throw new Error("Email verification failed");
        }
        await clerk.setSession(signInAttempt.createdSessionId);
        return signInAttempt;
      },
      {
        onSuccess: async (data) => {
          dispatch(setEmail(data.identifier));
          navigation.dispatch(StackActions.replace("VaultBackup"));
        },
        onError: (error) => {
          const clerkError = error?.errors?.[0] as ClerkAPIError;
          if (clerkError) formik.setFieldError("code", clerkError.longMessage);
        },
        meta: { disableErrorToast: true },
      }
    );

  const { mutate: verifySignUpCode, isLoading: isVerifyingSignUp } =
    useMutation(
      async (code: string) => {
        if (!signUp) throw new Error();
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code,
        });

        if (signUpAttempt.verifications.emailAddress.status !== "verified") {
          throw new Error("Email verification failed");
        }
        await clerk.setSession(signUpAttempt.createdSessionId);
        return signUpAttempt;
      },
      {
        onSuccess: async (data) => {
          dispatch(setEmail(data.emailAddress));
          navigation.dispatch(StackActions.replace("VaultBackup"));
        },
        onError: (error) => {
          const clerkError = error?.errors?.[0] as ClerkAPIError;
          if (clerkError) formik.setFieldError("code", clerkError.longMessage);
        },
        meta: { disableErrorToast: true },
      }
    );

  const formik = useFormik({
    initialValues: { code: "" },
    onSubmit: (values) => {
      if (isSignUp) return verifySignUpCode(values.code);
      verifySignInCode(values.code);
    },
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
      <FormControl isInvalid={formik.touched.code && !!formik.errors.code}>
        <Input
          placeholder="Code"
          value={formik.values.code}
          onChangeText={formik.handleChange("code")}
          onBlur={formik.handleBlur("code")}
          keyboardType="number-pad"
          autoFocus
          size="lg"
        />
        <FormControl.ErrorMessage>
          {formik.errors.code}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button
        mt="4"
        onPress={formik.handleSubmit}
        isLoading={isVerifyingSignIn || isVerifyingSignUp}
      >
        Next
      </Button>
    </Box>
  );
};

export default SignUpVerifyEmailScreen;
