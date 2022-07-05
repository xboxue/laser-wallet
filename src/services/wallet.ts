import axios from "axios";
import Constants from "expo-constants";

type CreateWalletOptions = {
  chainId: number;
  ownerAddress: string;
  recoveryOwnerAddress: string;
  guardians: string[];
};

export const createWallet = async ({
  chainId,
  ownerAddress,
  recoveryOwnerAddress,
  guardians,
}: CreateWalletOptions) => {
  const { data } = await axios.post(
    `${Constants.manifest?.extra?.relayerUrl}/wallets`,
    {
      chainId,
      ownerAddress,
      recoveryOwnerAddress,
      guardians,
    }
  );

  if (!data.walletAddress) throw new Error("Wallet creation failed");

  return data.walletAddress;
};
