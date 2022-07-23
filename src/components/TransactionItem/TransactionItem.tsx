import { tokens } from "@uniswap/default-token-list";
import { format, fromUnixTime, isToday } from "date-fns";
import { keyBy } from "lodash";
import { Box, Image, Pressable, Text } from "native-base";
import { useSelector } from "react-redux";
import { useEnsName } from "wagmi";
import ethIcon from "../../../assets/eth-icon.png";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import { selectWalletAddress } from "../../features/wallet/walletSlice";
import { Transaction } from "../../services/etherscan";
import formatAddress from "../../utils/formatAddress";
import formatAmount from "../../utils/formatAmount";
import isEqualCaseInsensitive from "../../utils/isEqualCaseInsensitive";

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

const TransactionItem = ({ transaction }: Props) => {
  const walletAddress = useSelector(selectWalletAddress);
  const chainId = useSelector(selectChainId);

  const isToken = !!transaction.tokenName;
  const tokenUri = tokensByAddress[
    transaction.contractAddress
  ]?.logoURI?.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  const date = fromUnixTime(parseInt(transaction.timeStamp));
  const isIncoming = isEqualCaseInsensitive(transaction.to, walletAddress);

  const { data: ensName } = useEnsName({
    address: isIncoming ? transaction.from : transaction.to,
    chainId,
  });

  const renderTitle = (transaction: Transaction) => {
    // ERC20 transfer
    if (transaction.tokenSymbol) {
      if (isIncoming) return `Receive ${transaction.tokenSymbol}`;
      return `Send ${transaction.tokenSymbol}`;
    }

    // Receive ETH
    if (isIncoming) return "Receive";

    return titles[transaction.type];
  };

  return (
    <Pressable>
      <Box flexDirection="row" alignItems="center" py="2">
        <Image
          source={isToken && tokenUri ? { uri: tokenUri } : ethIcon}
          size="9"
          alt="Ethereum icon"
        />
        <Box ml="3">
          <Text variant="subtitle1">{renderTitle(transaction)}</Text>
          <Text>
            {format(date, isToday(date) ? "h:mm a" : "LLL d")} ·{" "}
            {isIncoming
              ? `From: ${ensName || formatAddress(transaction.from)}`
              : `To: ${ensName || formatAddress(transaction.to)}`}
          </Text>
        </Box>
        <Text variant="subtitle1" ml="auto">
          {formatAmount(transaction.value, {
            decimals: transaction.tokenDecimal,
          })}{" "}
          {transaction.tokenSymbol || "ETH"}
        </Text>
      </Box>
    </Pressable>
  );
};

export default TransactionItem;
