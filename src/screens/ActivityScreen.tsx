import { useSelector } from "react-redux";
import TransactionHistory from "../components/TransactionHistory/TransactionHistory";
import { selectWalletAddress } from "../features/wallet/walletSlice";

const ActivityScreen = () => {
  const walletAddress = useSelector(selectWalletAddress);

  return <TransactionHistory walletAddress={walletAddress} />;
};

export default ActivityScreen;
