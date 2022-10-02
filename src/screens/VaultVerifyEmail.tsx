import { useNavigation } from "@react-navigation/native";
import { providers } from "ethers";
import { Box, Text, useToast } from "native-base";
import { useDispatch } from "react-redux";
import EmailCodeForm from "../components/EmailCodeForm.tsx/EmailCodeForm";
import ToastAlert from "../components/ToastAlert/ToastAlert";
import { addPendingTransaction } from "../features/transactions/transactionsSlice";
import useSendVaultEth from "../hooks/useSendVaultEth";
import useSendVaultToken from "../hooks/useSendVaultToken";

const VaultVerifyEmail = ({ route }) => {
  const navigation = useNavigation();
  const toast = useToast();
  const dispatch = useDispatch();
  const { amount, address: to, token } = route.params;

  const onSend = (transaction: providers.TransactionResponse) => {
    toast.show({
      render: () => <ToastAlert status="success" title="Transaction sent" />,
      duration: 2000,
    });
    dispatch(addPendingTransaction(transaction));
    navigation.navigate("Activity");
  };

  const { mutate: sendEth, isLoading: isSendingEth } = useSendVaultEth({
    onSuccess: onSend,
  });
  const { mutate: sendToken, isLoading: isSendingToken } = useSendVaultToken({
    onSuccess: onSend,
  });

  return (
    <Box p="4">
      <Text variant="subtitle1">Confirm transaction</Text>
      <Text mb="4">
        Please enter the verification code we sent to your email.
      </Text>
      <EmailCodeForm
        onSubmit={() => {
          if (token.isToken) sendToken({ to, amount, token });
          else sendEth({ to, amount });
        }}
        isSubmitting={isSendingEth || isSendingToken}
      />
    </Box>
  );
};

export default VaultVerifyEmail;
