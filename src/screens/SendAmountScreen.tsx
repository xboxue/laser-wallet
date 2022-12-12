import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { BigNumber, constants } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { floor } from "lodash";
import { Box, Button, Icon, Skeleton, Text } from "native-base";
import { useState } from "react";
import { useSelector } from "react-redux";
import NumberPad from "../components/NumberPad/NumberPad";
import { WETH_CONTRACT } from "../constants/contracts";
import { selectChainId } from "../features/network/networkSlice";
import { getTokenMetadata } from "../services/nxyz";
import formatAmount from "../utils/formatAmount";

const SendAmountScreen = ({ route }) => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("0");
  const { token } = route.params;
  const chainId = useSelector(selectChainId);
  const [isUSDInput, setIsUSDInput] = useState(false);

  const { data: tokenMetadata, isLoading: tokenMetadataLoading } = useQuery(
    ["tokenMetadata", token.contractAddress, chainId],
    () =>
      getTokenMetadata(
        [
          token.contractAddress === constants.AddressZero
            ? WETH_CONTRACT
            : token.contractAddress,
        ],
        chainId
      ),
    { select: ([data]) => data }
  );

  return (
    <Box flex="1" safeAreaBottom>
      <Box p="4" pt="0" flex="1">
        <Box
          flexDir="row"
          alignItems="center"
          justifyContent="space-between"
          h="180"
        >
          <Button
            variant="subtle"
            onPress={() => {
              if (!tokenMetadata?.currentPrice?.fiat) return;
              if (isUSDInput) {
                setIsUSDInput(false);
                setAmount(
                  floor(
                    parseFloat(
                      formatUnits(
                        parseUnits(amount, 2 + token.decimals).div(
                          tokenMetadata.currentPrice.fiat[0].value
                        ),
                        token.decimals
                      )
                    ),
                    6
                  ).toString()
                );
              } else {
                setIsUSDInput(true);
                setAmount(
                  floor(
                    parseFloat(
                      formatUnits(
                        parseUnits(amount, token.decimals).mul(
                          tokenMetadata.currentPrice.fiat[0].value
                        ),
                        token.decimals + 2
                      )
                    ),
                    2
                  ).toString()
                );
              }
            }}
          >
            <Icon
              as={<Ionicons name="md-swap-vertical" />}
              color="white"
              size="md"
            />
          </Button>
          <Box alignItems="center">
            <Box flexDir="row" alignItems="baseline">
              {isUSDInput ? (
                <Text
                  variant={
                    amount.length > 8 ? "h4" : amount.length > 4 ? "h3" : "h2"
                  }
                >
                  $
                  {Intl.NumberFormat("en", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: amount.split(".")[1]?.length,
                  }).format(parseFloat(amount))}
                  {amount.endsWith(".") && "."}
                </Text>
              ) : (
                <>
                  <Text
                    variant={
                      amount.length > 8 ? "h4" : amount.length > 4 ? "h3" : "h2"
                    }
                  >
                    {Intl.NumberFormat("en", {
                      maximumFractionDigits: 6,
                      minimumFractionDigits: amount.split(".")[1]?.length,
                    }).format(amount)}
                    {amount.endsWith(".") && "."}
                  </Text>
                  <Text variant="h5" ml="2">
                    {token.symbol}
                  </Text>
                </>
              )}
            </Box>
            {tokenMetadataLoading ? (
              <Skeleton height="5" width="16" />
            ) : isUSDInput ? (
              <Text color="text.300" fontSize="lg">
                {formatAmount(
                  parseUnits(amount, 2 + token.decimals).div(
                    tokenMetadata.currentPrice.fiat[0].value
                  ),
                  { decimals: token.decimals }
                )}{" "}
                {token.symbol}
              </Text>
            ) : (
              tokenMetadata?.currentPrice?.fiat && (
                <Text color="text.300" fontSize="lg">
                  {formatAmount(
                    parseUnits(amount, token.decimals).mul(
                      tokenMetadata.currentPrice.fiat[0].value
                    ),
                    {
                      decimals: token.decimals + 2,
                      style: "currency",
                      currency: "USD",
                    }
                  )}
                </Text>
              )
            )}
          </Box>
          <Button
            variant="subtle"
            py="2"
            onPress={() => {
              if (isUSDInput) {
                setAmount(token.fiat?.[0].tokenValue.toString());
              } else {
                setAmount(token.tokenValue.toString());
              }
            }}
          >
            Max
          </Button>
        </Box>
        <Box flexDir="row" justifyContent="space-between" flex="1">
          <Text variant="subtitle1">Available Balance</Text>
          <Box alignItems="flex-end">
            <Text variant="subtitle1">
              {token.pretty} {token.symbol}
            </Text>
            {token.fiat && (
              <Text color="text.300">${token.fiat?.[0].pretty}</Text>
            )}
          </Box>
        </Box>
        <Button
          mt="5"
          onPress={() =>
            navigation.navigate("Preview", {
              ...route.params,
              amount: isUSDInput
                ? formatAmount(
                    parseUnits(amount, 2 + token.decimals).div(
                      tokenMetadata.currentPrice.fiat[0].value
                    ),
                    { decimals: token.decimals }
                  )
                : amount,
              amountUSD: !tokenMetadata?.currentPrice.fiat
                ? null
                : isUSDInput
                ? Intl.NumberFormat("en", {
                    style: "currency",
                    currency: "USD",
                  }).format(parseFloat(amount))
                : formatAmount(
                    parseUnits(amount, token.decimals).mul(
                      tokenMetadata.currentPrice.fiat[0].value
                    ),
                    {
                      decimals: token.decimals + 2,
                      currency: "USD",
                      style: "currency",
                    }
                  ),
            })
          }
          isDisabled={
            !amount ||
            (isUSDInput &&
              parseUnits(amount, 2 + token.decimals)
                .div(tokenMetadata.currentPrice.fiat[0].value)
                .gt(token.value)) ||
            (!isUSDInput &&
              BigNumber.from(parseUnits(amount, token.decimals)).gt(
                token.value
              ))
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
          } else if (
            amount.length >= 12 ||
            amount.split(".")[1]?.length >= 6 ||
            (isUSDInput && amount.split(".")[1]?.length >= 2)
          ) {
            return;
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
