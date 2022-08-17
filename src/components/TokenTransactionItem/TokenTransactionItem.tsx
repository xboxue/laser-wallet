import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "@uniswap/default-token-list";
import { ethers } from "ethers";
import { keyBy } from "lodash";
import { Circle, Icon, Image, Spinner } from "native-base";
import ethIcon from "../../../assets/eth-icon.png";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";
import TransactionItem from "../TransactionItem/TransactionItem";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import { useSelector } from "react-redux";

interface Props {
  txData: any;
  onPress: () => void;
  isPending?: boolean;
}

const tokensByAddress = keyBy(tokens, (token) => token.address.toLowerCase());

const TokenTransactionItem = ({
  txData,
  onPress,
  isPending = false,
}: Props) => {
  const walletAddress = useSelector(selectWalletAddress);

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

  return (
    <TransactionItem
      onPress={onPress}
      icon={renderTokenIcon()}
      title={renderTokenTitle()}
      subtitle={renderTokenSubtitle()}
      amount={renderTokenAmount()}
      timestamp={txData.timestamp}
    />
  );
};

export default TokenTransactionItem;
