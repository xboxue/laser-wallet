import { Wallet } from "ethers";
import { Laser } from "laser-sdk";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import {
  selectOwnerPrivateKey,
  selectWalletAddress,
} from "../features/auth/authSlice";
import { selectChainId } from "../features/network/networkSlice";

const useLaser = () => {
  const chainId = useSelector(selectChainId);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const walletAddress = useSelector(selectWalletAddress);

  const provider = useProvider({ chainId });

  const owner = new Wallet(ownerPrivateKey);
  return new Laser(provider, owner, walletAddress);
};

export default useLaser;
