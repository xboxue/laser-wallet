import { Wallet } from "ethers";
import { LaserFactory } from "laser-sdk";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { selectOwnerPrivateKey } from "../features/wallet/walletSlice";

const useLaserFactory = (chainId: number) => {
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const owner = new Wallet(ownerPrivateKey);
  const provider = useProvider({ chainId });

  return new LaserFactory(provider, owner);
};

export default useLaserFactory;
