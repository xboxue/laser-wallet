import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { LaserFactory } from "laser-sdk";
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
import { useState } from "react";
import { useSelector } from "react-redux";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import {
  selectConnector,
  selectPeerMeta,
  selectPending,
} from "../features/walletConnect/walletConnectSlice";
import useSecureStore from "../hooks/useSecureStore";

const ENTRY_POINT_GOERLI = "0x90f3E1105E63C877bF9587DE5388C23Cdb702c6B";
const FACTORY_GOERLI = "0x7c08F8821f00Be8A4d766bDF10d4E9cffAe04d13";

const LASER_GUARDIAN_ADDRESS = "0x0D073B061819d7B7E648d1bb34593c701FFaE666";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSecureStore("walletAddress");
  const connector = useSelector(selectConnector);
  const peerMeta = useSelector(selectPeerMeta);
  const pending = useSelector(selectPending);
  const [deploying, setDeploying] = useState(false);

  const deploy = async () => {
    try {
      setDeploying(true);
      const recoveryWalletAddress = await SecureStore.getItemAsync(
        "recoveryWalletAddress"
      );
      const ownerAddress = await SecureStore.getItemAsync("ownerAddress");
      const ownerPrivateKey = await SecureStore.getItemAsync("ownerPrivateKey");
      if (!ownerAddress || !ownerPrivateKey || !recoveryWalletAddress)
        throw new Error();

      const relayer = new ethers.Wallet(ownerPrivateKey);
      const signer = new ethers.Wallet(ownerPrivateKey);
      const providerUrl = `https://eth-goerli.alchemyapi.io/v2/e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1`;
      const goerliChainId = 5;

      const factory = new LaserFactory(
        providerUrl,
        goerliChainId,
        relayer,
        FACTORY_GOERLI
      );

      const balance = await factory.provider.getBalance(relayer.address);

      // We check that the signer has enough eth (at least 0.1).
      if (Number(ethers.utils.formatEther(balance)) < 0.05) {
        throw new Error(
          `Not enough balance: ${ethers.utils.formatEther(balance)} ETH`
        );
      }

      const walletAddress = await factory.createProxyWithCreate2(
        ownerAddress,
        recoveryWalletAddress,
        [LASER_GUARDIAN_ADDRESS],
        ENTRY_POINT_GOERLI
      );
      await SecureStore.setItemAsync("walletAddress", walletAddress);
    } catch (error) {
      console.log(error);
    }
    setDeploying(false);
  };

  return (
    <Box>
      <Box p="4">
        {walletAddress ? (
          <>
            <IconButton
              icon={<Icon as={Ionicons} name="qr-code-outline" />}
              onPress={() => {
                navigation.navigate("QRCodeScan");
              }}
            />
            <Text>{walletAddress}</Text>
            <WalletBalance />
            <Button onPress={() => navigation.navigate("SendAddress")}>
              Send
            </Button>
          </>
        ) : (
          <Button mt="4" onPress={deploy} isLoading={deploying}>
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
