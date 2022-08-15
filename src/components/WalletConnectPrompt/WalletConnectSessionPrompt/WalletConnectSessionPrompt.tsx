import { IClientMeta } from "@walletconnect/types";
import {
  Actionsheet,
  Box,
  Button,
  Image,
  Link,
  Skeleton,
  Stack,
  Text,
} from "native-base";

interface Props {
  onClose: () => void;
  onReject: () => void;
  onApprove: () => void;
  peerMeta?: IClientMeta;
  isConnecting: boolean;
}

const WalletConnectSessionPrompt = ({
  onClose,
  onApprove,
  onReject,
  peerMeta,
  isConnecting,
}: Props) => {
  return (
    <Actionsheet isOpen onClose={onClose}>
      <Actionsheet.Content>
        {isConnecting && <Skeleton />}
        {peerMeta && (
          <Box w="100%" px="4" py="2">
            <Image
              source={{ uri: peerMeta.icons[0] }}
              alt="logo"
              size="10"
              mb="3"
              alignSelf="center"
            />
            <Text variant="subtitle1">{peerMeta.name} wants to connect</Text>
            <Link href={peerMeta.url}>{peerMeta.url}</Link>
            <Stack space="1" mt="4">
              <Button onPress={onApprove}>Approve</Button>
              <Button variant="subtle" onPress={onReject}>
                Reject
              </Button>
            </Stack>
          </Box>
        )}
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default WalletConnectSessionPrompt;
