import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError, EmailCodeFactor } from "@clerk/types";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import * as yup from "yup";

const RecoverySignInScreen = () => {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const navigation = useNavigation();

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
      onSuccess: () => navigation.navigate("RecoveryVerifyEmail"),
      onError: (error) => {
        const clerkError = error?.errors?.[0] as ClerkAPIError;
        if (clerkError) formik.setFieldError("email", clerkError.longMessage);
      },
      meta: { disableErrorToast: true },
    }
  );

  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit: (values) => {
      if (isSignedIn) return navigation.navigate("RecoveryAccountVaults");
      signInWithEmail(values.email);
    },
    validationSchema: yup.object().shape({
      email: yup.string().email("Invalid email").required("Required"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Enter your email</Text>
      <Text mb="4">
        This must match the email address used to secure your existing vault.
      </Text>
      <FormControl isInvalid={formik.touched.email && !!formik.errors.email}>
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
      <Button mt="4" onPress={formik.handleSubmit} isLoading={isSigningIn}>
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

export default RecoverySignInScreen;
