import { useNavigation } from "@react-navigation/native";
import { Box, Button, ScrollView, Stack, Text } from "native-base";
import { useSelector } from "react-redux";
import CollectibleGrid from "../components/CollectibleGrid/CollectibleGrid";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import usePendingTxSubscription from "../hooks/usePendingTxSubscription";
import formatAddress from "../utils/formatAddress";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);

  usePendingTxSubscription();

  return (
    <ScrollView flex={1} pt="12" px="4">
      {/* <Box
        flexDir="row"
        justifyContent="space-between"
        px="1"
        alignItems="flex-start"
      >
        <IconButton
          icon={<Icon as={Ionicons} name="settings-outline" />}
          onPress={() => navigation.navigate("Settings")}
        />
      </Box> */}
      <Text variant="h4" fontWeight="500" mb="6">
        Your assets
      </Text>
      <Box p="6" bgColor="#4F5AFF33">
        <WalletBalance walletAddress={walletAddress} />

        <Text color="#FFFFFFB2" mt="2">
          Address
        </Text>
        <Box flexDirection="row" alignItems="center">
          <Text>{formatAddress(walletAddress)}</Text>
          {/* <CopyIconButton value={walletAddress} /> */}
        </Box>
        <Stack direction="row" space={2} mt="4">
          <Button
            onPress={() => navigation.navigate("SendAddress")}
            flex={1}
            rounded="full"
          >
            Buy
          </Button>
          <Button
            onPress={() => navigation.navigate("SendAddress")}
            flex={1}
            rounded="full"
          >
            Send
          </Button>
        </Stack>
      </Box>
      <Box flexDir="row" justifyContent="space-between" mt="6" mb="1">
        <Text variant="subtitle1">Coins</Text>
        <Text>View all</Text>
      </Box>
      <TokenBalances walletAddress={walletAddress} />
      <Box flexDir="row" justifyContent="space-between" mt="6" mb="1">
        <Text variant="subtitle1">Collectibles</Text>
        <Text>View all</Text>
      </Box>
      <Box mx="-1" flex="1">
        <CollectibleGrid walletAddress={walletAddress} />
      </Box>
    </ScrollView>
  );
};

export default HomeScreen;
