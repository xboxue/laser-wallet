import { useNavigation } from "@react-navigation/native";
import { TRANSACTION_TYPES } from "../../constants/transactions";
import TokenTransactionItem from "../TokenTransactionItem/TokenTransactionItem";
import WalletTransactionItem from "../WalletTransactionItem/WalletTransactionItem";

interface Props {
  txData: any;
}

const TransactionItemContainer = ({ txData }: Props) => {
  const navigation = useNavigation();

  if (
    txData.type === TRANSACTION_TYPES.TOKEN_APPROVE ||
    txData.type === TRANSACTION_TYPES.TOKEN_TRANSFER
  ) {
    return (
      <TokenTransactionItem
        txData={txData}
        onPress={() => navigation.navigate("TransactionDetails", { txData })}
      />
    );
  }

  return (
    <WalletTransactionItem
      txData={txData}
      onPress={() => navigation.navigate("TransactionDetails", { txData })}
    />
  );
};

export default TransactionItemContainer;
