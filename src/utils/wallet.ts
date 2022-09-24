import { mnemonicToSeed } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import { utils } from "ethers";
import * as SecureStore from "expo-secure-store";

export const createWallets = async (seedPhrase: string) => {
  const seed = await mnemonicToSeed(seedPhrase);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const privateKeys: Record<string, string> = {};
  const wallets = [];
  for (let i = 0; i < 10; i++) {
    const wallet = hdwallet
      .derivePath(utils.defaultPath)
      .deriveChild(i)
      .getWallet();
    privateKeys[wallet.getAddressString()] = wallet.getPrivateKeyString();
    wallets.push({ address: wallet.getAddressString() });
  }
  await SecureStore.setItemAsync("seedPhrase", seedPhrase);
  await SecureStore.setItemAsync("privateKeys", JSON.stringify(privateKeys));
  return wallets;
};
