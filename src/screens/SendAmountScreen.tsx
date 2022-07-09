import { useNavigation } from "@react-navigation/native";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { round } from "lodash";
import { Box, Button, Text } from "native-base";
import { useState } from "react";
import NumberPad from "../components/NumberPad/NumberPad";

const SendAmountScreen = ({ route }) => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("0");
  const { token } = route.params;

  return (
    <Box flex="1">
      <Box p="4" flex="1">
        <Text variant="subtitle1">Choose amount</Text>
        <Text variant="h4" mt="2">
          {amount}
        </Text>
        <Text>
          {token.symbol} balance: {round(token.balance, 4)}
        </Text>
        <Button
          mt="5"
          onPress={() =>
            navigation.navigate("SendConfirm", {
              ...route.params,
              amount,
            })
          }
          isDisabled={
            !amount ||
            BigNumber.from(parseEther(amount)).gt(parseEther(token.balance))
          }
        >
          Next
        </Button>
      </Box>
      <NumberPad
        isDecimal
        onChange={(value) => {
          if (value === "backspace") {
            if (amount.length === 1) setAmount("0");
            else setAmount(amount.slice(0, amount.length - 1));
          } else if (value === "clear") {
            setAmount("0");
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
