import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { tokens } from "@uniswap/default-token-list";
import { fromUnixTime } from "date-fns";
import { ethers } from "ethers";
import { keyBy } from "lodash";
import { Circle, Icon, Image } from "native-base";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import { Transaction } from "../../services/etherscan";
import decodeTransactionData from "../../utils/decodeTransactionData";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import TransactionItem from "../TransactionItem/TransactionItem";

const titles = {
  [TRANSACTION_TYPES.CONTRACT_INTERACTION]: "Contract Interaction",
  [TRANSACTION_TYPES.DEPLOY_CONTRACT]: "Contract Deployment",
  [TRANSACTION_TYPES.SEND]: "Send",
  [TRANSACTION_TYPES.TOKEN_APPROVE]: "Approve",
  [TRANSACTION_TYPES.TOKEN_SET_APPROVAL_FOR_ALL]: "Set Approval for All",
  [TRANSACTION_TYPES.TOKEN_SAFE_TRANSFER_FROM]: "Safe Transfer From",
  [TRANSACTION_TYPES.TOKEN_TRANSFER]: "Transfer",
  [TRANSACTION_TYPES.TOKEN_TRANSFER_FROM]: "Transfer From",
};

const tokensByAddress = keyBy(tokens, (token) => token.address.toLowerCase());

interface Props {
  transaction: Transaction;
}

const TransactionItemContainer = ({ transaction }: Props) => {
  const walletAddress = useSelector(selectWalletAddress);
  const chainId = useSelector(selectChainId);
  const navigation = useNavigation();
  const provider = useProvider({ chainId });

  const { data: txData } = useQuery(["txData", transaction.hash], () =>
    decodeTransactionData(provider, transaction)
  );
  if (!txData) return null;

  const renderTokenTitle = () => {
    if (txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER) {
      if (isEqualCaseInsensitive(txData.args.recipient.address, walletAddress))
        `Receive ${txData.tokenSymbol}`;

      return `Send ${txData.tokenSymbol}`;
    }

    if (txData.type === TRANSACTION_TYPES.TOKEN_APPROVE)
      return `Approve ${txData.tokenSymbol}`;
  };

  const renderTokenSubtitle = () => {
    const { recipient, spender } = txData.args;

    if (txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER) {
      if (isEqualCaseInsensitive(recipient.address, walletAddress))
        return `From: ${
          txData.from.ensName || formatAddress(txData.from.address)
        }`;

      return `To: ${recipient.ensName || formatAddress(recipient.address)}`;
    }

    if (txData.type === TRANSACTION_TYPES.TOKEN_APPROVE) {
      return `For: ${spender.ensName || formatAddress(spender.address)}`;
    }
  };

  const renderTokenAmount = () => {
    if (ethers.constants.MaxUint256.eq(txData.args.amount)) return "Unlimited";

    return `${formatAmount(txData.args.amount, {
      decimals: txData.tokenDecimals,
    })} ${txData.tokenSymbol}`;
  };

  const renderTokenIcon = () => {
    if (transaction.isError === "1")
      return (
        <Circle borderColor="red.500" borderWidth="2" size="9">
          <Icon
            as={<Ionicons name="ios-arrow-up" />}
            size="4"
            color="red.500"
          />
        </Circle>
      );

    const tokenUri = tokensByAddress[
      txData.contractAddress.toLowerCase()
    ]?.logoURI?.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");

    return (
      <Image
        source={tokenUri ? { uri: tokenUri } : ethIcon}
        fallbackSource={ethIcon}
        size="9"
        alt="Token icon"
      />
    );
  };

  const renderIcon = () => {
    if (transaction.isError === "1")
      return (
        <Circle borderColor="red.500" borderWidth="2" size="9">
          <Icon
            as={<Ionicons name="ios-arrow-up" />}
            size="4"
            color="red.500"
          />
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

  if (
    (txData.type === TRANSACTION_TYPES.TOKEN_APPROVE ||
      txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER) &&
    txData.args
  ) {
    return (
      <TransactionItem
        onPress={() =>
          navigation.navigate("TransactionDetails", { transaction })
        }
        icon={renderTokenIcon()}
        title={renderTokenTitle()}
        subtitle={renderTokenSubtitle()}
        amount={renderTokenAmount()}
        timestamp={fromUnixTime(parseInt(transaction.timeStamp, 10))}
      />
    );
  }

  return (
    <TransactionItem
      onPress={() => navigation.navigate("TransactionDetails", { transaction })}
      icon={renderIcon()}
      title={renderTitle()}
      subtitle={
        isEqualCaseInsensitive(txData.from.address, walletAddress)
          ? `To: ${txData.to.ensName || formatAddress(txData.to.address)}`
          : `From: ${txData.from.ensName || formatAddress(txData.from.address)}`
      }
      amount={`${formatAmount(txData.value)} ETH`}
      timestamp={fromUnixTime(parseInt(transaction.timeStamp, 10))}
    />
  );
};

export default TransactionItemContainer;
