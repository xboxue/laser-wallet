import { mnemonicToSeed } from "bip39";
import Wallet, { hdkey } from "ethereumjs-wallet";
import { utils } from "ethers";
import { ACCESSIBLE, ACCESS_CONTROL } from "react-native-keychain";

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
  for (let i = 0; i < 5; i++) {
    const wallet = hdwallet
      .derivePath(utils.defaultPath)
      .deriveChild(i)
      .getWallet();

    await setItem(
      `privateKey_${wallet.getAddressString()}`,
      wallet.getPrivateKeyString(),
      {
        accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
    );
    wallets.push({ address: wallet.getAddressString() });
  }
  const owner = Wallet.generate();

  await setItem("ownerPrivateKey", owner.getPrivateKeyString(), {
    accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await setItem("seedPhrase", seedPhrase, {
    accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return { wallets, ownerAddress: owner.getAddressString() };
};
