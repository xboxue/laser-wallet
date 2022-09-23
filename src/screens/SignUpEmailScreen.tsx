import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { ClerkAPIError, EmailCodeFactor } from "@clerk/types";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { setIsLaserGuardianEnabled } from "../features/guardians/guardiansSlice";

const SignUpEmailScreen = () => {
  const { isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
        if (clerkError) formik.setFieldError("email", clerkError.longMessage);
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

          formik.setFieldError("email", clerkError.longMessage);
        }
      },
      meta: { disableErrorToast: true },
    }
  );

  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit: (values) => {
      if (isSignedIn) return navigation.navigate("SignUpGuardians");
      signUpWithEmail(values.email);
    },
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
      <FormControl isInvalid={!!formik.errors.email}>
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
        <FormControl.ErrorMessage>
          {formik.errors.email}
        </FormControl.ErrorMessage>
      </FormControl>
      <Button
        mt="4"
        onPress={formik.handleSubmit}
        isLoading={isSigningUp || isSigningIn}
      >
        Next
      </Button>
      {/* <Button
        variant="subtle"
        mt="2"
        onPress={() => {
          dispatch(setIsLaserGuardianEnabled(false));
          navigation.navigate("SignUpGuardians");
        }}
      >
        Skip
      </Button> */}
    </Box>
  );
};

export default SignUpEmailScreen;
