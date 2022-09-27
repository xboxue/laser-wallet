import { generateMnemonic, mnemonicToSeed } from "bip39";
import Wallet, { hdkey } from "ethereumjs-wallet";
import { utils } from "ethers";
import * as SecureStore from "expo-secure-store";

export const getPrivateKey = async (walletAddress: string) => {
  const privateKey = await SecureStore.getItemAsync(
    `privateKey_${walletAddress}`,
    { requireAuthentication: true }
  );
  if (!privateKey) throw new Error("No private key");
  return privateKey;
};

export const createWallets = async (seedPhrase: string) => {
  const seed = await mnemonicToSeed(seedPhrase);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallets = [];
  const promises = [];
  for (let i = 0; i < 10; i++) {
    const wallet = hdwallet
      .derivePath(utils.defaultPath)
      .deriveChild(i)
      .getWallet();
    promises.push(
      SecureStore.setItemAsync(
        `privateKey_${wallet.getAddressString()}`,
        wallet.getPrivateKeyString()
      )
    );
    wallets.push({ address: wallet.getAddressString() });
  }
  await Promise.all(promises);

  const owner = Wallet.generate();
  await SecureStore.setItemAsync(
    "ownerPrivateKey",
    owner.getPrivateKeyString()
  );

  await SecureStore.setItemAsync("seedPhrase", seedPhrase);
  return { wallets, ownerAddress: owner.getAddressString() };
};
