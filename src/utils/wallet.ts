import { mnemonicToSeed } from "bip39";
import Wallet, { hdkey } from "ethereumjs-wallet";
import { utils } from "ethers";
import { ACCESS_CONTROL } from "react-native-keychain";

import { getItem, setItem } from "../services/keychain";

export const getPrivateKey = async (walletAddress: string) => {
  const privateKey = await getItem(`privateKey_${walletAddress}`);
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
      setItem(
        `privateKey_${wallet.getAddressString()}`,
        wallet.getPrivateKeyString(),
        { accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET }
      )
    );
    wallets.push({ address: wallet.getAddressString() });
  }
  const owner = Wallet.generate();
  await Promise.all([
    ...promises,
    setItem("ownerPrivateKey", owner.getPrivateKeyString(), {
      accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    }),
    setItem("seedPhrase", seedPhrase, {
      accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    }),
  ]);

  return { wallets, ownerAddress: owner.getAddressString() };
};
