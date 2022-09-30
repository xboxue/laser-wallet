import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Button, Icon, IconButton } from "native-base";
import { useSelector } from "react-redux";
import TokenBalances from "../components/TokenBalances/TokenBalances";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import WalletConnectPrompt from "../components/WalletConnectPrompt/WalletConnectPrompt";
import WalletSelector from "../components/WalletSelector/WalletSelector";
import { selectWalletAddress } from "../features/wallet/walletSlice";
import useWalletConnectSubscription from "../hooks/useWalletConnectSubscription";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const walletAddress = useSelector(selectWalletAddress);
  useWalletConnectSubscription();

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
      {/* <TabView
        navigationState={{ index: tab, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={(index) => navigation.setParams({ tab: index })}
        initialLayout={{ width: window.width }}
      /> */}
      <TokenBalances walletAddress={walletAddress} onPress={() => {}} />
      <WalletConnectPrompt walletAddress={walletAddress} />
    </Box>
  );
};

export default HomeScreen;
