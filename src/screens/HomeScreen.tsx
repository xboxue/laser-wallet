import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Button, Icon, IconButton, Stack, Text } from "native-base";
import { useSelector } from "react-redux";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import WalletConnectPrompt from "../components/WalletConnectPrompt/WalletConnectPrompt";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import usePendingTxSubscription from "../hooks/usePendingTxSubscription";
import useWalletConnectSubscription from "../hooks/useWalletConnectSubscription";
import formatAddress from "../utils/formatAddress";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  // usePendingTxSubscription();

  return (
    <Box flex={1} safeAreaTop pt={6}>
      <Box
        flexDir="row"
        justifyContent="space-between"
        px="1"
        alignItems="flex-start"
      >
        <IconButton
          icon={<Icon as={Ionicons} name="settings-outline" />}
          onPress={() => navigation.navigate("Settings")}
        />
      </Box>
      <Box px="4" my="8" display="flex" flexDir="column" alignItems="center">
        <WalletBalance walletAddress={walletAddress} />

        <Box flexDirection="row" alignItems="center">
          <Text mr="1">{formatAddress(walletAddress)}</Text>
          <CopyIconButton value={walletAddress} />
        </Box>
        <Stack direction="row" space={5}>
          <Button
            mt="5"
            onPress={() => navigation.navigate("SendAddress")}
            flex={1}
            rounded="full"
          >
            Buy
          </Button>
          <Button
            mt="5"
            onPress={() => navigation.navigate("SendAddress")}
            flex={1}
            rounded="full"
          >
            Send
          </Button>
        </Stack>
      </Box>
      <TokenBalances walletAddress={walletAddress} onPress={() => {}} />
      <WalletConnectPrompt walletAddress={walletAddress} />
    </Box>
  );
};

export default HomeScreen;
