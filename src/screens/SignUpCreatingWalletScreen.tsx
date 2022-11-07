import { Box, Spinner, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import { setWalletAddress } from "../features/wallet/walletSlice";
import useWaitForTransaction from "../hooks/useWaitForTransaction";

const SignUpCreatingWalletScreen = ({ route }) => {
  const chainId = useSelector(selectChainId);
  const dispatch = useDispatch();
  const { hash, safeAddress } = route.params;

  useWaitForTransaction({
    hash,
    chainId,
    onSuccess: () => {
      dispatch(setWalletAddress(safeAddress));
      dispatch(setIsAuthenticated(true));
    },
  });

  return (
    <Box justifyContent="center" alignItems="center" h="100%">
      <Box mb={10}>
        <Spinner size="lg" mb="10" />
        <Text variant="h4" textAlign="center">
          Hold on
        </Text>
        <Text fontSize="lg" textAlign="center">
          We're creating your wallet
        </Text>
      </Box>
    </Box>
  );
};

export default SignUpCreatingWalletScreen;
