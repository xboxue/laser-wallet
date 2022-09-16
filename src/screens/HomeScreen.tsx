import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  Actionsheet,
  Box,
  Button,
  ChevronDownIcon,
  Icon,
  IconButton,
  Pressable,
  Text,
} from "native-base";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { NavigationState, Route, TabView } from "react-native-tab-view";
import { useDispatch, useSelector } from "react-redux";
import CopyIconButton from "../components/CopyIconButton/CopyIconButton";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import TransactionHistory from "../components/TransactionHistory/TransactionHistory";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import WalletConnectPrompt from "../components/WalletConnectPrompt/WalletConnectPrompt";
import {
  selectVaultAddress,
  selectWalletAddress,
  selectWallets,
  setWalletAddress,
} from "../features/wallet/walletSlice";
import useWalletConnectSubscription from "../hooks/useWalletConnectSubscription";
import formatAddress from "../utils/formatAddress";

const routes = [
  { key: "first", title: "Tokens" },
  { key: "second", title: "Activity" },
];

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  const vaultAddress = useSelector(selectVaultAddress);
  const window = useWindowDimensions();
  const dispatch = useDispatch();
  const wallets = useSelector(selectWallets);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  useWalletConnectSubscription();

  if (!walletAddress) throw new Error();

  const tab = route?.params?.tab || 0;

  const renderTabBar = ({
    navigationState,
  }: {
    navigationState: NavigationState<Route>;
  }) => {
    return (
      <Box flexDir="row">
        {navigationState.routes.map((route, index) => (
          <Pressable
            flex={1}
            onPress={() => navigation.setParams({ tab: index })}
            key={route.key}
          >
            <Box
              borderColor={tab === index ? "gray.500" : "gray.100"}
              borderBottomWidth="3"
              alignItems="center"
              p="3"
            >
              <Text>{route.title}</Text>
            </Box>
          </Pressable>
        ))}
      </Box>
    );
  };

  const renderScene = ({ route }: { route: Route }) => {
    if (route.key === "first")
      return <TokenBalances walletAddress={walletAddress} onPress={() => {}} />;
    if (route.key === "second")
      return <TransactionHistory walletAddress={walletAddress} />;
  };

  return (
    <Box flex={1} safeAreaTop pt={6}>
      <Actionsheet
        isOpen={walletSheetOpen}
        onClose={() => setWalletSheetOpen(false)}
      >
        <Actionsheet.Content>
          {vaultAddress && (
            <Actionsheet.Item
              onPress={() => dispatch(setWalletAddress(vaultAddress))}
              _pressed={{ bgColor: "gray.200", rounded: "lg" }}
              rightIcon={
                walletAddress === vaultAddress ? (
                  <>
                    <Icon
                      as={<Ionicons name="ios-checkmark-circle" />}
                      size="6"
                      color="green.500"
                    />
                    <CopyIconButton ml="auto" value={vaultAddress} />
                  </>
                ) : (
                  <CopyIconButton value={vaultAddress} ml="auto" />
                )
              }
            >
              {`Vault (${formatAddress(vaultAddress)})`}
            </Actionsheet.Item>
          )}
          {wallets.slice(0, 5).map((wallet, index) => (
            <Actionsheet.Item
              key={wallet.address}
              onPress={() => dispatch(setWalletAddress(wallet.address))}
              _pressed={{ bgColor: "gray.200", rounded: "lg" }}
              endIcon={
                walletAddress === wallet.address ? (
                  <>
                    <Icon
                      as={<Ionicons name="ios-checkmark-circle" />}
                      size="6"
                      color="green.500"
                    />
                    <CopyIconButton ml="auto" value={wallet.address} />
                  </>
                ) : (
                  <CopyIconButton value={wallet.address} ml="auto" />
                )
              }
            >{`Wallet ${index + 1} (${formatAddress(
              wallet.address
            )})`}</Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
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
        <Button
          variant="outline"
          _text={{ color: "black", fontSize: "sm" }}
          rightIcon={<ChevronDownIcon size="3" color="black" />}
          alignSelf="flex-start"
          py="2"
          bgColor="gray.100"
          borderWidth="0"
          onPress={() => setWalletSheetOpen(true)}
          _pressed={{ bgColor: "gray.200" }}
        >
          {`${
            walletAddress === vaultAddress
              ? "Vault"
              : `Wallet ${
                  wallets.findIndex(
                    (wallet) => wallet.address === walletAddress
                  ) + 1
                }`
          } (${formatAddress(walletAddress)})`}
        </Button>
        <IconButton
          icon={<Icon as={Ionicons} name="qr-code-outline" />}
          onPress={() => navigation.navigate("QRCodeScan")}
        />
      </Box>
      <Box px="4" my="8" display="flex" flexDir="column" alignItems="center">
        <WalletBalance walletAddress={walletAddress} />
        <Button
          mt="5"
          onPress={() => navigation.navigate("SendAddress")}
          alignSelf="stretch"
        >
          Send
        </Button>
      </Box>
      <TabView
        navigationState={{ index: tab, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={(index) => navigation.setParams({ tab: index })}
        initialLayout={{ width: window.width }}
      />
      <WalletConnectPrompt walletAddress={walletAddress} />
    </Box>
  );
};

export default HomeScreen;
