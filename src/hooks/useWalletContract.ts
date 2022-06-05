import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import { Laser } from "laser-sdk";
import { useEffect, useState } from "react";

const useWalletContract = (functionName: keyof Laser) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const walletAddress = await SecureStore.getItemAsync("walletAddress");
        const ownerPrivateKey = await SecureStore.getItemAsync(
          "ownerPrivateKey"
        );
        if (!walletAddress || !ownerPrivateKey) throw new Error();

        const signer = new ethers.Wallet(ownerPrivateKey);
        const providerUrl = `https://eth-goerli.alchemyapi.io/v2/e_-Jn9f06JUc7TXmtPdwzkI2TNdvjri1`;

        const laser = new Laser(providerUrl, signer, walletAddress, "");
        const data = await (laser[functionName] as Function)();

        setData(data);
      } catch (error) {
        setError("Oops, something went wrong.");
      }
      setLoading(false);
    })();
  }, []);

  return { loading, error, data };
};

export default useWalletContract;
