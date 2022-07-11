import { Actionsheet, Button, Image, Stack, Text } from "native-base";
import { IClientMeta, IJsonRpcRequest } from "@walletconnect/types";
import hexToAscii from "../../../utils/hexToAscii";
import { REQUEST_TYPES } from "../../../constants/walletConnect";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta: IClientMeta;
  callRequest: IJsonRpcRequest;
}

const WalletConnectRequestPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
  callRequest,
}: Props) => {
  return (
    <Actionsheet isOpen onClose={onClose}>
      <Actionsheet.Content>
        <Text>
          {peerMeta.name}: {callRequest.method}
        </Text>
        <Text>
          {callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA &&
            JSON.stringify(JSON.parse(callRequest.params[1]).message, null, 2)}
          {callRequest.method === REQUEST_TYPES.PERSONAL_SIGN &&
            hexToAscii(callRequest.params[0])}
        </Text>
        <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
        <Stack space="3" direction="row">
          <Button onPress={onApprove}>Approve</Button>
          <Button onPress={onReject}>Reject</Button>
        </Stack>
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default WalletConnectRequestPrompt;
