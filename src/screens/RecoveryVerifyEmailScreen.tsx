import { StackActions, useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import { useDispatch } from "react-redux";
import EmailCodeForm from "../components/EmailCodeForm.tsx/EmailCodeForm";
import { setEmail } from "../features/wallet/walletSlice";

const RecoveryVerifyEmailScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  return (
    <Box p="4">
      <Text variant="subtitle1">Verify your email</Text>
      <Text mb="4">
        Please enter the verification code we sent to your email.
      </Text>
      <EmailCodeForm
        onSubmit={async (email) => {
          dispatch(setEmail(email));
          navigation.dispatch(
            StackActions.replace("RecoveryAccountVaults", route.params)
          );
        }}
      />
    </Box>
  );
};

export default RecoveryVerifyEmailScreen;
