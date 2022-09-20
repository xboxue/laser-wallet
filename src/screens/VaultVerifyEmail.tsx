import { useAuth, useClerk, useSignIn } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { providers } from "ethers";
import { useFormik } from "formik";
import { Box, Button, FormControl, Input, Text, useToast } from "native-base";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import useSendVaultEth from "../hooks/useSendVaultEth";
import useSendVaultToken from "../hooks/useSendVaultToken";
import { ClerkAPIError } from "@clerk/types";

const VaultVerifyEmail = ({ route }) => {
  const clerk = useClerk();
  const navigation = useNavigation();
  const { signIn } = useSignIn();
  const toast = useToast();
  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();

  const onSuccess = (transaction: providers.TransactionResponse) => {
    toast.show({
      render: () => <ToastAlert status="success" title="Transaction sent" />,
    });
    dispatch(addPendingTransaction(transaction));
    navigation.navigate("Home", { tab: 1 });
  };

  const { mutate: sendEth, isLoading: isSendingEth } = useSendVaultEth({
    onSuccess,
  });
  const { mutate: sendToken, isLoading: isSendingToken } = useSendVaultToken({
    onSuccess,
  });
  const { amount, address: to, token } = route.params;

  const { mutate: verifyCode, isLoading } = useMutation(
    async (code: string) => {
      if (!signIn) throw new Error();
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (signInAttempt.status !== "complete") {
        throw new Error("Sign in failed");
      }
      return signInAttempt;
    },
    {
      onSuccess: async (data) => {
        await clerk.setSession(data.createdSessionId);
        if (token.isToken) sendToken({ to, amount, token });
        else sendEth({ to, amount });
      },
      onError: (error) => {
        const clerkError = error?.errors?.[0] as ClerkAPIError;
        if (clerkError) formik.setFieldError("code", clerkError.longMessage);
      },
      meta: { disableGlobalErrorHandler: true },
    }
  );

  const formik = useFormik({
    initialValues: { code: "" },
    onSubmit: (values) => {
      if (!isSignedIn) return verifyCode(values.code);

      if (token.isToken) sendToken({ to, amount, token });
      else sendEth({ to, amount });
    },
    validationSchema: yup.object().shape({
      code: yup.string().required("Required"),
    }),
    validateOnChange: false,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Confirm transaction</Text>
      <Text mb="4">
        Please enter the verification code we sent to your email.
      </Text>
      <FormControl isInvalid={!!formik.errors.code}>
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
        isLoading={isLoading || isSendingEth || isSendingToken}
      >
        Confirm
      </Button>
    </Box>
  );
};

export default VaultVerifyEmail;
