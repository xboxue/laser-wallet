import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import {
  Actionsheet,
  Box,
  Button,
  Icon,
  IconButton,
  Image,
  Pressable,
  Stack,
  Text,
} from "native-base";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { NavigationState, Route, TabView } from "react-native-tab-view";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import TransactionHistory from "../components/TransactionHistory/TransactionHistory";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import { selectWalletAddress } from "../features/auth/authSlice";
import {
  selectCallRequest,
  selectConnector,
  selectPeerMeta,
  selectPending,
} from "../features/walletConnect/walletConnectSlice";
import formatAddress from "../utils/formatAddress";

const routes = [
  { key: "first", title: "Tokens" },
  { key: "second", title: "Activity" },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);

  const connector = useSelector(selectConnector);
  const peerMeta = useSelector(selectPeerMeta);
  const pending = useSelector(selectPending);
  const callRequest = useSelector(selectCallRequest);

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
      return (
        <Box p="3">
          <TokenBalances walletAddress={walletAddress} onPress={() => {}} />
        </Box>
      );
    if (route.key === "second")
      return (
        <Box p="3">
          <TransactionHistory walletAddress={walletAddress} />
        </Box>
      );
  };

  return (
    <Box flex={1}>
      <Box p="4">
        <IconButton
          icon={<Icon as={Ionicons} name="qr-code-outline" />}
          onPress={() => {
            navigation.navigate("QRCodeScan");
          }}
        />
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
      {peerMeta && connector && pending && walletAddress && (
        <Actionsheet isOpen onClose={() => connector.rejectSession()}>
          <Actionsheet.Content>
            <Text>{peerMeta.name} wants to connect</Text>
            <Text>{peerMeta.url}</Text>
            <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row" mt="4">
              <Button
                onPress={() =>
                  connector.approveSession({
                    accounts: [walletAddress],
                    chainId: 5,
                  })
                }
              >
                Approve
              </Button>
              <Button onPress={() => connector.rejectSession()}>Reject</Button>
            </Stack>
          </Actionsheet.Content>
        </Actionsheet>
      )}
      {callRequest && peerMeta && (
        <Actionsheet isOpen onClose={() => {}}>
          <Actionsheet.Content>
            <Text>
              {peerMeta.name}: {callRequest.method}
            </Text>
            <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row">
              <Button onPress={() => {}}>Approve</Button>
              <Button onPress={() => {}}>Reject</Button>
            </Stack>
          </Actionsheet.Content>
        </Actionsheet>
      )}
    </Box>
  );
};

export default HomeScreen;
