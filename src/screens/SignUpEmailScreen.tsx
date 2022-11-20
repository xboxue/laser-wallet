import { useAuth, useSignIn, useSignUp, useUser } from "@clerk/clerk-expo";
import { ClerkAPIError, EmailCodeFactor } from "@clerk/types";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Input } from "native-base";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import SignUpLayout from "../components/SignUpLayout/SignUpLayout";
import { setIsLaserGuardianEnabled } from "../features/guardians/guardiansSlice";

const SignUpEmailScreen = () => {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const { mutate: signInWithEmail, isLoading: isSigningIn } = useMutation(
    async (email: string) => {
      if (!signIn) throw new Error();

      const signInAttempt = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = signInAttempt.supportedFirstFactors.find(
        ({ strategy }) => strategy === "email_code"
      ) as EmailCodeFactor;

      await signInAttempt.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      });
    },
    {
      onSuccess: () => {
        dispatch(setIsLaserGuardianEnabled(true));
        navigation.navigate("SignUpVerifyEmail", { isSignUp: false });
      },
      onError: (error) => {
        const clerkError = error?.errors?.[0] as ClerkAPIError;
        if (clerkError?.longMessage) setError(clerkError.longMessage);
      },
      meta: { disableErrorToast: true },
    }
  );

  const { mutate: signUpWithEmail, isLoading: isSigningUp } = useMutation(
    async (email: string) => {
      if (!signUp) throw new Error();
      const signUpAttempt = await signUp.create({
        emailAddress: email,
      });
      return signUpAttempt.prepareEmailAddressVerification();
    },
    {
      onSuccess: () => {
        dispatch(setIsLaserGuardianEnabled(true));
        navigation.navigate("SignUpVerifyEmail", { isSignUp: true });
      },
      onError: (error, email) => {
        const clerkError = error?.errors?.[0] as ClerkAPIError;
        if (clerkError) {
          if (clerkError.code === "form_identifier_exists")
            return signInWithEmail(email);

          if (clerkError.longMessage) setError(clerkError.longMessage);
        }
      },
      meta: { disableErrorToast: true },
    }
  );

  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit: async (values) => {
      if (isSignedIn && user) {
        if (user.primaryEmailAddress?.emailAddress !== values.email) {
          await signOut();
        } else {
          dispatch(setIsLaserGuardianEnabled(true));
          return navigation.navigate("SignUpAddOwner");
        }
      }
      signUpWithEmail(values.email);
    },
    validationSchema: yup.object().shape({
      email: yup.string().email("Invalid email").required("Required"),
    }),
    validateOnMount: true,
  });

  return (
    <SignUpLayout
      title="Enter your email"
      subtitle="We use your email for 2-step verification when you withdraw from your account."
      onNext={formik.handleSubmit}
      isLoading={isSigningUp || isSigningIn}
      isDisabled={!formik.isValid}
    >
      <ErrorDialog
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Your email address couldn't be added."
        subtitle={error}
      />
      <Input
        placeholder="Email Address"
        value={formik.values.email}
        onChangeText={formik.handleChange("email")}
        onBlur={formik.handleBlur("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus
      />
    </SignUpLayout>
  );
};

export default SignUpEmailScreen;
