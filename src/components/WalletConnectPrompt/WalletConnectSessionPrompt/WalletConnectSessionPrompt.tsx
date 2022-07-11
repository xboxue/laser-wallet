import { Actionsheet, Button, Image, Stack, Text } from "native-base";
import { IClientMeta } from "@walletconnect/types";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta: IClientMeta;
}

const WalletConnectSessionPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
}: Props) => {
  return (
    <Actionsheet isOpen onClose={onClose}>
      <Actionsheet.Content>
        <Text>{peerMeta.name} wants to connect</Text>
        <Text>{peerMeta.url}</Text>
        <Image source={{ uri: peerMeta.icons[0] }} alt="logo" />
        <Stack space="3" direction="row" mt="4">
          <Button onPress={onApprove}>Approve</Button>
          <Button onPress={onReject}>Reject</Button>
        </Stack>
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default WalletConnectSessionPrompt;
