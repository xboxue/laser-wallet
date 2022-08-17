import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import { selectChainId } from "../../features/network/networkSlice";
import { Transaction } from "../../services/etherscan";
import decodeEtherscanTxData from "../../utils/decodeTransactionData";
import TokenTransactionItem from "../TokenTransactionItem/TokenTransactionItem";
import WalletTransactionItem from "../WalletTransactionItem/WalletTransactionItem";

interface Props {
  transaction: Transaction;
}

const TransactionItemContainer = ({ transaction }: Props) => {
  const chainId = useSelector(selectChainId);
  const navigation = useNavigation();
  const provider = useProvider({ chainId });

  const { data: txData } = useQuery(["txData", transaction.hash], () =>
    decodeEtherscanTxData(provider, transaction)
  );
  if (!txData) return null;

  if (
    txData.type === TRANSACTION_TYPES.TOKEN_APPROVE ||
    txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER
  ) {
    return (
      <TokenTransactionItem
        txData={txData}
        onPress={() =>
          navigation.navigate("TransactionDetails", { transaction })
        }
      />
    );
  }

  return (
    <WalletTransactionItem
      txData={txData}
      onPress={() => navigation.navigate("TransactionDetails", { transaction })}
    />
  );
};

export default TransactionItemContainer;
