import { Actionsheet, Button, Image, Stack, Text } from "native-base";
import { IClientMeta, IJsonRpcRequest } from "@walletconnect/types";
import hexToAscii from "../../../utils/hexToAscii";
import { REQUEST_TYPES } from "../../../constants/walletConnect";
import { allChains, useProvider } from "wagmi";
import { useSelector } from "react-redux";
import { selectChainId } from "../../../features/network/networkSlice";
import BottomSheet from "../../BottomSheet/BottomSheet";
import { ScrollView } from "react-native-gesture-handler";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta: IClientMeta;
  callRequest: IJsonRpcRequest;
  isLoading: boolean;
}

const WalletConnectRequestPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
  callRequest,
  isLoading,
}: Props) => {
  const chain = allChains.find(
    (chain) => chain.id === parseInt(callRequest.params[0].chainId, 16)
  )?.name;

  return (
    <BottomSheet isOpen onClose={onClose}>
      <Stack space="4" width="100%" p="4">
        <Image
          source={{ uri: peerMeta.icons[0] }}
          alt="logo"
          size="10"
          alignSelf="center"
        />
        <Text variant="subtitle1">
          {`${peerMeta.name}: ${
            callRequest.method === REQUEST_TYPES.SWITCH_ETHEREUM_CHAIN
              ? `Switch to ${chain} network?`
              : "Signature request"
          }`}
        </Text>
        <ScrollView style={{ maxHeight: 300 }}>
          <Text>
            {(callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA ||
              callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA_V4) &&
              JSON.stringify(
                JSON.parse(callRequest.params[1]).message,
                null,
                2
              )}
            {callRequest.method === REQUEST_TYPES.PERSONAL_SIGN &&
              hexToAscii(callRequest.params[0])}
            {callRequest.method === REQUEST_TYPES.SWITCH_ETHEREUM_CHAIN &&
              `This will switch the active wallet to your wallet on ${chain}.`}
          </Text>
        </ScrollView>
        <Stack space="2">
          <Button onPress={onApprove} isLoading={isLoading}>
            Approve
          </Button>
          <Button variant="subtle" onPress={onReject}>
            Reject
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
};

export default WalletConnectRequestPrompt;
