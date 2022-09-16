import { useClerk, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import { Box, Button, Input, Text, useToast } from "native-base";
import { useMutation } from "@tanstack/react-query";
import * as yup from "yup";
import { providers } from "ethers";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import { useDispatch } from "react-redux";
import useSendEth from "../hooks/useSendEth";
import useSendToken from "../hooks/useSendToken";
import { Laser } from "laser-sdk";
import useSendVaultEth from "../hooks/useSendVaultEth";
import useSendVaultToken from "../hooks/useSendVaultToken";

const VaultVerifyEmail = ({ route }) => {
  const clerk = useClerk();
  const navigation = useNavigation();
  const { signIn } = useSignIn();
  const toast = useToast();
  const dispatch = useDispatch();

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
      // if (!signIn) throw new Error();
      // const signInAttempt = await signIn.attemptFirstFactor({
      //   strategy: "email_code",
      //   code,
      // });
      // if (signInAttempt.status !== "complete") {
      //   throw new Error("Sign in failed");
      // }
      // return signInAttempt;
    },
    {
      onSuccess: async (data) => {
        // await clerk.setSession(data.createdSessionId);
        if (token.isToken) sendToken({ to, amount, token });
        else sendEth({ to, amount });

        // navigation.dispatch(StackActions.replace("SignUpGuardians"));
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
      <Text variant="subtitle1">Confirm transaction</Text>
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
