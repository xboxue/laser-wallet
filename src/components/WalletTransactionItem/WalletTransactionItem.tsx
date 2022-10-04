import Ionicons from "@expo/vector-icons/Ionicons";
import { format, isToday } from "date-fns";
import { Circle, Icon, Image, Spinner, Text } from "native-base";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import ethIcon from "../../../assets/eth-icon.png";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import TokenItem from "../TokenItem/TokenItem";

interface Props {
  txData: any;
  onPress: () => void;
}

const titles = {
  [TRANSACTION_TYPES.CONTRACT_INTERACTION]: "Contract Interaction",
  [TRANSACTION_TYPES.DEPLOY_CONTRACT]: "Contract Deployment",
  [TRANSACTION_TYPES.DEPLOY_WALLET]: "Activate vault",
};

const WalletTransactionItem = ({ txData, onPress }: Props) => {
  const walletAddress = useSelector(selectWalletAddress);

  const renderIcon = useCallback(() => {
    if (!txData.receipt)
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
  }, [txData]);

  const renderTitle = useCallback(() => {
    if (txData.type === TRANSACTION_TYPES.SEND) {
      if (isEqualCaseInsensitive(txData.from.address, walletAddress))
        return "Send ETH";
      return "Receive ETH";
    }

    return titles[txData.type];
  }, [txData]);

  const renderSubtitle = useCallback(() => {
    if (txData.type === TRANSACTION_TYPES.DEPLOY_WALLET) {
      if (!txData.receipt) return "Pending";

      return format(
        txData.timestamp,
        isToday(txData.timestamp) ? "h:mm a" : "LLL d"
      );
    }

    if (isEqualCaseInsensitive(txData.from.address, walletAddress))
      return `To: ${txData.to.ensName || formatAddress(txData.to.address)}`;

    return `From: ${txData.from.ensName || formatAddress(txData.from.address)}`;
  }, [txData]);

  const renderAmount = useCallback(() => {
    if (txData.value.isZero()) return "0 ETH";
    if (isEqualCaseInsensitive(txData.from.address, walletAddress))
      return `-${formatAmount(txData.value)} ETH`;

    return <Text color="success.600">+{formatAmount(txData.value)} ETH</Text>;
  }, [txData]);

  return (
    <TokenItem
      onPress={onPress}
      icon={renderIcon()}
      title={renderTitle()}
      subtitle={renderSubtitle()}
      rightText={renderAmount()}
    />
  );
};

export default WalletTransactionItem;
