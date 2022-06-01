import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import NumberPad from "../components/NumberPad/NumberPad";
import useWalletContract from "../hooks/useWalletContract";

const SendAmountScreen = () => {
  const navigation = useNavigation();
  const {
    data: balance,
    loading,
    error,
  } = useWalletContract("getBalanceInEth");
  const [amount, setAmount] = useState("");

  return (
    <Box flex="1">
      <Box p="4" flex="1">
        <Text variant="subtitle1">Choose amount</Text>
        <Text variant="h4" mt="2">
          {amount || "0"}
        </Text>
        <Text>ETH balance: {balance}</Text>
        <Button mt="5" onPress={() => navigation.navigate("SendConfirm")}>
          Next
        </Button>
      </Box>
      <NumberPad
        isDecimal
        onChange={(value) => {
          if (value === "backspace") {
            setAmount(amount.slice(0, amount.length - 1));
          } else if (value === "clear") {
            setAmount("");
          } else if (value === "0") {
            if (amount === "0") return;
            else setAmount(amount.concat(value));
          } else if (value === ".") {
            if (amount.indexOf(".") !== -1) {
              return;
            } else if (!amount) {
              setAmount("0.");
            } else {
              setAmount(amount.concat(value));
            }
          } else {
            if (amount === "0") setAmount(value);
            else setAmount(amount.concat(value));
          }
        }}
      />
    </Box>
  );
};

export default SendAmountScreen;
