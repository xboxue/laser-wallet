import Ionicons from "@expo/vector-icons/Ionicons";
import { Circle, Icon, Image, Spinner } from "native-base";
import { useSelector } from "react-redux";
import ethIcon from "../../../assets/eth-icon.png";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import TransactionItem from "../TransactionItem/TransactionItem";

interface Props {
  txData: any;
  onPress: () => void;
  isPending?: boolean;
}

const titles = {
  [TRANSACTION_TYPES.CONTRACT_INTERACTION]: "Contract Interaction",
  [TRANSACTION_TYPES.DEPLOY_CONTRACT]: "Contract Deployment",
  [TRANSACTION_TYPES.SEND]: "Send",
  [TRANSACTION_TYPES.DEPLOY_WALLET]: "Activate wallet",
};

const WalletTransactionItem = ({
  txData,
  onPress,
  isPending = false,
}: Props) => {
  const walletAddress = useSelector(selectWalletAddress);

  const renderIcon = () => {
    if (isPending)
      return (
        <Circle bg="gray.800" size="9">
          <Spinner color="white" />
        </Circle>
      );

    if (txData.isError)
      return (
        <Circle borderColor="red.500" borderWidth="2" size="9">
          <Icon
            as={<Ionicons name="ios-arrow-up" />}
            size="4"
            color="red.500"
          />
        </Circle>
      );

    if (txData.type === TRANSACTION_TYPES.DEPLOY_WALLET)
      return (
        <Circle bg="gray.800" size="9">
          <Icon as={<Ionicons name="flash-outline" />} size="4" color="white" />
        </Circle>
      );

    if (txData.type === TRANSACTION_TYPES.CONTRACT_INTERACTION)
      return (
        <Circle bg="gray.800" size="9">
          <Icon as={<Ionicons name="ios-list" />} size="4" color="white" />
        </Circle>
      );

    if (txData.type === TRANSACTION_TYPES.SEND) {
      return (
        <Circle bg="gray.800" size="9">
          <Icon
            as={
              isEqualCaseInsensitive(txData.from.address, walletAddress) ? (
                <Ionicons name="ios-arrow-up" />
              ) : (
                <Ionicons name="ios-arrow-down" />
              )
            }
            size="4"
            color="white"
          />
        </Circle>
      );
    }

    return <Image source={ethIcon} size="9" alt="Ethereum icon" />;
  };

  const renderTitle = () => {
    if (txData.type === TRANSACTION_TYPES.SEND) {
      if (isEqualCaseInsensitive(txData.from.address, walletAddress))
        return "Send";
      return "Receive";
    }

    return titles[txData.type];
  };

  const renderSubtitle = () => {
    if (txData.type === TRANSACTION_TYPES.DEPLOY_WALLET) return;

    if (isEqualCaseInsensitive(txData.from.address, walletAddress))
      return `To: ${txData.to.ensName || formatAddress(txData.to.address)}`;

    return `From: ${txData.from.ensName || formatAddress(txData.from.address)}`;
  };

  const renderAmount = () => {
    if (txData.type === TRANSACTION_TYPES.DEPLOY_WALLET)
      return `${formatAmount(txData.gasFee)} ETH`;

    return `${formatAmount(txData.value)} ETH`;
  };

  return (
    <TransactionItem
      onPress={onPress}
      icon={renderIcon()}
      title={renderTitle()}
      subtitle={renderSubtitle()}
      amount={renderAmount()}
      timestamp={txData.timestamp}
    />
  );
};

export default WalletTransactionItem;
