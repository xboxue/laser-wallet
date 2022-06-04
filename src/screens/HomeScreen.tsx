import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { LaserFactory } from "laser-sdk/src";
import {
  Actionsheet,
  Box,
  Button,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from "native-base";
import useSecureStore from "../hooks/useSecureStore";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPending,
  selectConnector,
  selectPeerMeta,
  setConnector,
} from "../features/walletConnect/walletConnectSlice";

const ENTRY_POINT_ADDRESS = "0xcCed5B88f14f1e133680117d01dEFeB38fC9a5A3";
const LASER_GUARDIAN_ADDRESS = "0x0D073B061819d7B7E648d1bb34593c701FFaE666";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSecureStore("walletAddress");
  const connector = useSelector(selectConnector);
  const peerMeta = useSelector(selectPeerMeta);
  const pending = useSelector(selectPending);

  const deploy = async () => {
    const ownerAddress = await SecureStore.getItemAsync("ownerAddress");
    const ownerPrivateKey = await SecureStore.getItemAsync("ownerPrivateKey");
    if (!ownerAddress || !ownerPrivateKey) throw new Error();

    const signer = new ethers.Wallet(ownerPrivateKey);
    const providerUrl = `https://eth-goerli.alchemyapi.io/v2/e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1`;
    const goerliChainId = 5;

    const factory = new LaserFactory(providerUrl, goerliChainId, signer);

    const balance = await factory.provider.getBalance(signer.address);

    // We check that the signer has enough eth (at least 0.1).
    if (Number(ethers.utils.formatEther(balance)) < 0.1) {
      throw new Error(
        `Not enough balance: ${ethers.utils.formatEther(balance)} ETH`
      );
    }

    try {
      const walletAddress = await factory.createProxyWithCreate2(
        ownerAddress,
        [LASER_GUARDIAN_ADDRESS],
        ENTRY_POINT_ADDRESS
      );
      await SecureStore.setItemAsync("walletAddress", walletAddress);
    } catch (error) {
      throw new Error(`Error with createProxy ${error}`);
    }
  };

  return (
    <Box>
      <Box p="4">
        <IconButton
          icon={<Icon as={Ionicons} name="qr-code-outline" />}
          onPress={() => {
            navigation.navigate("QRCodeScan");
          }}
        />
        <Text variant="subtitle1"></Text>
        <Text>{walletAddress}</Text>
        {walletAddress ? (
          <>
            <WalletBalance />
            <Button onPress={() => navigation.navigate("SendAddress")}>
              Send
            </Button>
          </>
        ) : (
          <Button mt="4" onPress={deploy}>
            Deploy smart contract
          </Button>
        )}
      </Box>
      {peerMeta && connector && pending && walletAddress && (
        <Actionsheet isOpen onClose={() => connector.rejectSession()}>
          <Actionsheet.Content>
            <Text>{peerMeta.name} wants to connect</Text>
            <Text>{peerMeta.url}</Text>
            <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row">
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
    </Box>
  );
};

export default HomeScreen;
