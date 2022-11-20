import { useClerk, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Input } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import { setEmail } from "../features/wallet/walletSlice";

const SignUpVerifyEmailScreen = ({ route }) => {
  const { isSignUp } = route.params;
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);

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
          navigation.dispatch(StackActions.replace("SignUpAddOwner"));
        },
        onError: (error) => {
          const clerkError = error?.errors?.[0] as ClerkAPIError;
          if (clerkError?.longMessage) setError(clerkError.longMessage);
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
          navigation.dispatch(StackActions.replace("SignUpAddOwner"));
        },
        onError: (error) => {
          const clerkError = error?.errors?.[0] as ClerkAPIError;
          if (clerkError?.longMessage) setError(clerkError.longMessage);
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
    validateOnMount: true,
  });

  return (
    <SignUpLayout
      title="Enter your confirmation code"
      subtitle="Please enter the confirmation code we sent to your email."
      onNext={formik.handleSubmit}
      isLoading={isVerifyingSignIn || isVerifyingSignUp}
      isDisabled={!formik.isValid}
    >
      <ErrorDialog
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Your email address couldn't be verified."
        subtitle={error}
      />
      <Input
        placeholder="Confirmation Code"
        value={formik.values.code}
        onChangeText={formik.handleChange("code")}
        onBlur={formik.handleBlur("code")}
        keyboardType="number-pad"
        autoFocus
      />
    </SignUpLayout>
  );
};

export default SignUpVerifyEmailScreen;
