import { useNavigation } from "@react-navigation/native";
import { ethers, providers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { LaserFactory } from "laser-sdk/src";
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
import { useDispatch, useSelector } from "react-redux";
import WalletBalance from "../components/WalletBalance/WalletBalance";
import {
  selectCallRequest,
  selectConnector,
  selectPeerMeta,
  selectPending,
} from "../features/walletConnect/walletConnectSlice";
import useSecureStore from "../hooks/useSecureStore";
import * as Clipboard from "expo-clipboard";
import {
  selectWalletAddress,
  setWalletAddress,
} from "../features/auth/authSlice";
import formatAddress from "../utils/formatAddress";
import Ionicons from "@expo/vector-icons/Ionicons";
import TokenBalances from "../components/TokenBalances/TokenBalances";

const ENTRY_POINT_GOERLI = "0x90f3E1105E63C877bF9587DE5388C23Cdb702c6B";
const FACTORY_GOERLI = "0x7c08F8821f00Be8A4d766bDF10d4E9cffAe04d13";

const LASER_GUARDIAN_ADDRESS = "0x0D073B061819d7B7E648d1bb34593c701FFaE666";

const HomeScreen = () => {
  const navigation = useNavigation();
  const storedWalletAddress = useSecureStore("walletAddress");
  const walletAddress = useSelector(selectWalletAddress);
  const connector = useSelector(selectConnector);
  const peerMeta = useSelector(selectPeerMeta);
  const pending = useSelector(selectPending);
  const callRequest = useSelector(selectCallRequest);
  const [deploying, setDeploying] = useState(false);
  const ownerAddress = useSecureStore("ownerAddress");
  const dispatch = useDispatch();

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

      const factory = new LaserFactory(
        new providers.AlchemyProvider(
          "goerli",
          "e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1"
        ),
        relayer,
        FACTORY_GOERLI
      );

      const balance = await factory.provider.getBalance(relayer.address);

      // We check that the signer has enough eth (at least 0.1).
      if (Number(ethers.utils.formatEther(balance)) < 0.01) {
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
      dispatch(setWalletAddress(walletAddress));
    } catch (error) {
      console.log(error);
    }
    setDeploying(false);
  };

  return (
    <Box>
      <Box p="4">
        {walletAddress || storedWalletAddress ? (
          <>
            <IconButton
              icon={<Icon as={Ionicons} name="qr-code-outline" />}
              onPress={() => {
                navigation.navigate("QRCodeScan");
              }}
            />
            <Pressable
              onPress={() =>
                Clipboard.setStringAsync(walletAddress || storedWalletAddress)
              }
            >
              {({ isPressed }) => (
                <Box
                  flexDirection="row"
                  alignItems="center"
                  opacity={isPressed ? 0.2 : 1}
                >
                  <Text mr="1">
                    {formatAddress(walletAddress || storedWalletAddress)}
                  </Text>
                  <Icon as={<Ionicons name="copy-outline" size={24} />} />
                </Box>
              )}
            </Pressable>

            <WalletBalance />
            <Button
              mt="4"
              mb="5"
              onPress={() => navigation.navigate("SendAddress")}
            >
              Send
            </Button>
            <TokenBalances
              walletAddress={walletAddress || storedWalletAddress}
            />
          </>
        ) : (
          <>
            {ownerAddress && (
              <Pressable onPress={() => Clipboard.setStringAsync(ownerAddress)}>
                {({ isPressed }) => (
                  <Text opacity={isPressed ? 0.2 : 1}>
                    Temporary screen! Deposit 0.01 ETH to {ownerAddress} to
                    deploy. Tap to copy.
                  </Text>
                )}
              </Pressable>
            )}
            <Button mt="4" onPress={deploy} isLoading={deploying}>
              Deploy smart contract
            </Button>
          </>
        )}
      </Box>
      {peerMeta && connector && pending && storedWalletAddress && (
        <Actionsheet isOpen onClose={() => connector.rejectSession()}>
          <Actionsheet.Content>
            <Text>{peerMeta.name} wants to connect</Text>
            <Text>{peerMeta.url}</Text>
            <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row" mt="4">
              <Button
                onPress={() =>
                  connector.approveSession({
                    accounts: [storedWalletAddress],
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
