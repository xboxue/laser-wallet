import { providers } from "ethers";
import Constants from "expo-constants";

type WaitForTransactionOptions = {
  hash: string;
  chainId: number;
  confirmations?: number;
};

const waitForTransaction = async ({
  hash,
  chainId,
  confirmations = 1,
}: WaitForTransactionOptions) => {
  const provider = new providers.InfuraProvider(
    chainId,
    Constants.manifest?.extra?.infuraApiKey
  );

  while (true) {
    const { broadcasts } = await provider.send("relay_getTransactionStatus", [
      hash,
    ]);

    if (!broadcasts) continue;
    for (const broadcast of broadcasts) {
      const receipt = await provider.getTransactionReceipt(broadcast.ethTxHash);
      if (receipt?.confirmations > confirmations) return receipt;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export default waitForTransaction;
