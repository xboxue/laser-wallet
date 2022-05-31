import { useNavigation } from "@react-navigation/native";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { LaserFactory } from "laser-sdk/src";
import { Box, Button, Text } from "native-base";
import useSecureStore from "../hooks/useSecureStore";
import WalletBalance from "../components/WalletBalance/WalletBalance";

const ENTRY_POINT_ADDRESS = "0xcCed5B88f14f1e133680117d01dEFeB38fC9a5A3";
const LASER_GUARDIAN_ADDRESS = "0x0D073B061819d7B7E648d1bb34593c701FFaE666";

const HomeScreen = () => {
  const navigation = useNavigation();
  const walletAddress = useSecureStore("walletAddress");

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
        <Text variant="subtitle1"></Text>
        <Text>{walletAddress}</Text>
        {walletAddress ? (
          <>
            <WalletBalance />
          </>
        ) : (
          <Button mt="4" onPress={deploy}>
            Deploy smart contract
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HomeScreen;
