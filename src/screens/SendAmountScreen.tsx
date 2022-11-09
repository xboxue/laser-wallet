import { useNavigation } from "@react-navigation/native";
import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { Box, Button, Icon, Text } from "native-base";
import { useState } from "react";
import NumberPad from "../components/NumberPad/NumberPad";
import useExchangeRates from "../hooks/useExchangeRates";
import formatAmount from "../utils/formatAmount";
import Ionicons from "@expo/vector-icons/Ionicons";

const SendAmountScreen = ({ route }) => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("0");
  const { token } = route.params;
  const { data: exchangeRates } = useExchangeRates();

  return (
    <Box flex="1">
      <Box
        px="4"
        py="8"
        flexDir="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Button variant="subtle">
          <Icon
            as={<Ionicons name="md-swap-vertical" />}
            color="white"
            size="md"
          />
        </Button>
        <Box alignItems="center">
          <Text variant="h2" mt="2">
            {amount} {token.symbol}
          </Text>
          <Text color="#FFFFFFB2" fontSize="lg">
            ${(parseFloat(amount) * exchangeRates.USD).toFixed(2)}
          </Text>
        </Box>
        <Button variant="subtle">Max</Button>
      </Box>
      <Box flexDir="row" justifyContent="space-between" flex="1" p="4">
        <Text variant="subtitle1">Available Balance</Text>
        <Text variant="subtitle1">
          {formatEther(token.balance)} {token.symbol}
        </Text>
      </Box>
      <Button
        mt="5"
        onPress={() =>
          navigation.navigate("Preview", {
            ...route.params,
            amount,
          })
        }
        isDisabled={
          !amount ||
          BigNumber.from(parseUnits(amount, token.decimals)).gt(token.balance)
        }
      >
        Next
      </Button>
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
