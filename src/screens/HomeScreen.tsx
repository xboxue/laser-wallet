import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Button, Icon, IconButton, Pressable, Text } from "native-base";
import { useWindowDimensions } from "react-native";
import { NavigationState, Route, TabView } from "react-native-tab-view";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import TransactionHistory from "../components/TransactionHistory/TransactionHistory";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import WalletConnectPrompt from "../components/WalletConnectPrompt/WalletConnectPrompt";
import WalletSelector from "../components/WalletSelector/WalletSelector";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import useWalletConnectSubscription from "../hooks/useWalletConnectSubscription";

const routes = [
  { key: "first", title: "Tokens" },
  { key: "second", title: "Activity" },
];

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  const window = useWindowDimensions();
  useWalletConnectSubscription();

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
        <WalletSelector />
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
