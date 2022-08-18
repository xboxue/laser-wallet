import { ethers } from "ethers";
import { Badge, Box, Stack, Text } from "native-base";
import formatAddress from "../../../utils/formatAddress";
import formatAmount from "../../../utils/formatAmount";
import { IClientMeta } from "@walletconnect/types";

interface Props {
  txData: any;
  gasFee: React.ReactNode;
  peerMeta: IClientMeta;
}

const WalletConnectApprovePrompt = ({ txData, gasFee, peerMeta }: Props) => {
  return (
    <Stack space="4">
      <Text variant="subtitle1">
        {peerMeta.name}: Give permission to access your {txData.tokenSymbol}?
      </Text>
      <Box
        flexDir="row"
        alignItems="center"
        justifyContent="space-between"
        h="5"
      >
        <Text variant="subtitle2">Approved amount:</Text>
        <Text variant="subtitle2">
          {ethers.constants.MaxUint256.eq(txData.args.amount) ? (
            <Badge _text={{ fontSize: "sm" }} colorScheme="danger">
              Unlimited
            </Badge>
          ) : (
            `${formatAmount(txData.args.amount, {
              decimals: txData.tokenDecimals,
            })} ${txData.tokenSymbol}`
          )}
        </Text>
      </Box>

      <Box flexDir="row" justifyContent="space-between" h="5">
        <Text variant="subtitle2">Granted to:</Text>
        <Text variant="subtitle2">
          {txData.args.spender.ensName ||
            formatAddress(txData.args.spender.address)}
        </Text>
      </Box>
      <Box flexDirection="row" justifyContent="space-between" h="6">
        <Text variant="subtitle2">Network fee (estimate)</Text>
        {gasFee}
      </Box>
    </Stack>
  );
};

export default WalletConnectApprovePrompt;
