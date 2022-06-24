import { ethers } from "ethers";
import { Actionsheet, Button, Image, Stack, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { selectOwnerPrivateKey } from "../../features/auth/authSlice";
import {
  selectCallRequest,
  selectConnector,
  selectPending,
  setCallRequest,
} from "../../features/walletConnect/walletConnectSlice";

interface Props {
  walletAddress: string;
}

const WalletConnectPrompt = ({ walletAddress }: Props) => {
  const connector = useSelector(selectConnector);
  const pending = useSelector(selectPending);
  const callRequest = useSelector(selectCallRequest);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const dispatch = useDispatch();

  return (
    <>
      {connector?.peerMeta && pending && (
        <Actionsheet isOpen onClose={() => connector.rejectSession()}>
          <Actionsheet.Content>
            <Text>{connector.peerMeta.name} wants to connect</Text>
            <Text>{connector.peerMeta.url}</Text>
            <Image source={{ uri: connector.peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row" mt="4">
              <Button
                onPress={() =>
                  connector.approveSession({
                    accounts: [walletAddress],
                    chainId: 5,
                  })
                }
              >
                Approve
              </Button>
              <Button onPress={() => connector.rejectSession()}>Reject</Button>
            </Stack>
          </Actionsheet.Content>
        </Actionsheet>
      )}
      {callRequest && connector?.peerMeta && (
        <Actionsheet isOpen onClose={() => {}}>
          <Actionsheet.Content>
            <Text>
              {connector.peerMeta.name}: {callRequest.method}
            </Text>
            <Text>
              {callRequest.method === "eth_signTypedData" &&
                JSON.stringify(
                  JSON.parse(callRequest.params[1]).message,
                  null,
                  2
                )}
            </Text>
            <Image source={{ uri: connector.peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row">
              <Button
                onPress={async () => {
                  const owner = new ethers.Wallet(ownerPrivateKey);
                  const { types, domain, message } = JSON.parse(
                    callRequest.params[1]
                  );
                  const result = await owner._signTypedData(
                    domain,
                    types,
                    message
                  );

                  connector.approveRequest({
                    id: callRequest.id,
                    result,
                  });
                  dispatch(setCallRequest(null));
                }}
              >
                Approve
              </Button>
              <Button
                onPress={() => {
                  connector.rejectRequest({
                    id: callRequest.id,
                    error: { message: "User rejected" },
                  });
                  dispatch(setCallRequest(null));
                }}
              >
                Reject
              </Button>
            </Stack>
          </Actionsheet.Content>
        </Actionsheet>
      )}
    </>
  );
};

export default WalletConnectPrompt;
