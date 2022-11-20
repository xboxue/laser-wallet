import { useNavigation } from "@react-navigation/native";
import {
  Box,
  Button,
  Icon,
  ScrollView,
  Stack,
  Text,
  useToast,
} from "native-base";
import { useSelector } from "react-redux";
import CollectibleGrid from "../components/CollectibleGrid/CollectibleGrid";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import useCollectibles from "../hooks/useCollectibles";
import usePendingTxSubscription from "../hooks/usePendingTxSubscription";
import formatAddress from "../utils/formatAddress";
import Feather from "@expo/vector-icons/Feather";
import { Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import ToastAlert from "../components/ToastAlert/ToastAlert";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  const { data } = useCollectibles(walletAddress);
  const toast = useToast();

  usePendingTxSubscription();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 40,
        paddingHorizontal: 16,
      }}
    >
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
        <Pressable
          onPress={() => {
            Clipboard.setStringAsync(walletAddress);
            toast.show({
              render: () => (
                <ToastAlert status="success" title="Copied to clipboard" />
              ),
              duration: 2000,
            });
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <Text>{formatAddress(walletAddress)}</Text>
            <Icon size="xs" as={<Feather name="copy" />} color="white" ml="1" />
          </Box>
        </Pressable>
        <Stack direction="row" space={2} mt="4">
          <Button
            onPress={() => navigation.navigate("SendAddress")}
            flex={1}
            rounded="full"
          >
            Buy
          </Button>
          <Button
            onPress={() => navigation.navigate("Choose Recipient")}
            flex={1}
            rounded="full"
          >
            Send
          </Button>
        </Stack>
      </Box>
      <Box flexDir="row" justifyContent="space-between" mt="6" mb="1">
        <Text variant="subtitle1">Coins</Text>
        <Pressable onPress={() => navigation.navigate("TokenBalances")}>
          <Text>View all</Text>
        </Pressable>
      </Box>
      <TokenBalances walletAddress={walletAddress} limit={4} />
      {!!data?.pages?.[0].results.length && (
        <>
          <Box flexDir="row" justifyContent="space-between" mt="6" mb="1">
            <Text variant="subtitle1">Collectibles</Text>
            <Pressable onPress={() => navigation.navigate("Collectibles")}>
              <Text>View all</Text>
            </Pressable>
          </Box>
          <Box mx="-1" flex="1">
            <CollectibleGrid walletAddress={walletAddress} limit={3} />
          </Box>
        </>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
