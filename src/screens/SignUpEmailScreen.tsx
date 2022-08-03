import { useAuth, useSignUp } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text } from "native-base";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { setIsLaserGuardianEnabled } from "../features/guardians/guardiansSlice";

const SignUpEmailScreen = () => {
  const { isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
        dispatch(setIsLaserGuardianEnabled(true));
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
    onSubmit: (values) => {
      if (isSignedIn) return navigation.navigate("SignUpGuardians");
      verifyEmail(values.email);
    },
    validationSchema: yup.object().shape({
      email: yup.string().email("Invalid email").required("Required"),
    }),
    validateOnChange: false,
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
      <Button mt="4" onPress={formik.handleSubmit} isLoading={isLoading}>
        Next
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => {
          dispatch(setIsLaserGuardianEnabled(false));
          navigation.navigate("SignUpGuardians");
        }}
      >
        Skip
      </Button>
    </Box>
  );
};

export default SignUpEmailScreen;
