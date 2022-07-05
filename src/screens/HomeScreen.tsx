import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Box, Button, Icon, IconButton, Pressable, Text } from "native-base";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { NavigationState, Route, TabView } from "react-native-tab-view";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import TransactionHistory from "../components/TransactionHistory/TransactionHistory";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import WalletConnectPrompt from "../components/WalletConnectPrompt/WalletConnectPrompt";
import { selectWalletAddress } from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";
import formatAddress from "../utils/formatAddress";

const routes = [
  { key: "first", title: "Tokens" },
  { key: "second", title: "Activity" },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);

  const [tab, setTab] = useState(0);
  const window = useWindowDimensions();

  if (!walletAddress) return <Text>Error</Text>;

  const renderTabBar = ({
    navigationState,
  }: {
    navigationState: NavigationState<Route>;
  }) => {
    return (
      <Box flexDir="row">
        {navigationState.routes.map((route, index) => (
          <Pressable flex={1} onPress={() => setTab(index)} key={route.key}>
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
    <Box flex={1}>
      <Box flexDir="row" justifyContent="space-between" px="1">
        <IconButton
          icon={<Icon as={Ionicons} name="settings-outline" />}
          onPress={() => {
            navigation.navigate("Settings");
          }}
        />
        <IconButton
          icon={<Icon as={Ionicons} name="qr-code-outline" />}
          onPress={() => {
            navigation.navigate("QRCodeScan");
          }}
        />
      </Box>
      <Box p="4">
        <Pressable onPress={() => Clipboard.setStringAsync(walletAddress)}>
          {({ isPressed }) => (
            <Box
              flexDirection="row"
              alignItems="center"
              opacity={isPressed ? 0.2 : 1}
            >
              <Text mr="1">{formatAddress(walletAddress)}</Text>
              <Icon as={<Ionicons name="copy-outline" size={24} />} />
            </Box>
          )}
        </Pressable>

        <WalletBalance walletAddress={walletAddress} />
        <Button
          mt="4"
          mb="5"
          onPress={() => navigation.navigate("SendAddress")}
        >
          Send
        </Button>
      </Box>
      <TabView
        navigationState={{ index: tab, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setTab}
        initialLayout={{ width: window.width }}
      />
      <WalletConnectPrompt walletAddress={walletAddress} />
    </Box>
  );
};

export default HomeScreen;
