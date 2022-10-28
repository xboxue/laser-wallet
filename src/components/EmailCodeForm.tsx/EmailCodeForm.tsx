import { useAuth, useClerk, useSignIn, useUser } from "@clerk/clerk-expo";
import { SignInResource } from "@clerk/types";
import { ClerkAPIError } from "@clerk/types";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Button, FormControl, Input } from "native-base";
import * as yup from "yup";

interface Props {
  onSubmit: (email: string) => void;
  isSubmitting?: boolean;
}

const EmailCodeForm = ({ onSubmit, isSubmitting = false }: Props) => {
  const { signIn } = useSignIn();
  const clerk = useClerk();
  const { isSignedIn, user } = useUser();

  const { mutate: verifyCode, isLoading: isVerifying } = useMutation(
    async (code: string) => {
      if (isSignedIn && user.primaryEmailAddress?.emailAddress)
        return user.primaryEmailAddress.emailAddress;
      if (!signIn) throw new Error();
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (signInAttempt.status !== "complete")
        throw new Error("Email verification failed");

      await clerk.setSession(signInAttempt.createdSessionId);
      return signInAttempt.identifier;
    },
    {
      onSuccess: onSubmit,
      onError: (error) => {
        const clerkError = error?.errors?.[0] as ClerkAPIError;
        if (clerkError) formik.setFieldError("code", clerkError.longMessage);
      },
      meta: { disableErrorToast: true },
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
    <>
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
        onPress={() => formik.handleSubmit()}
        isLoading={isVerifying || isSubmitting}
      >
        Confirm
      </Button>
    </>
  );
};

export default EmailCodeForm;
