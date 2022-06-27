import axios from "axios";
import { ethers, utils } from "ethers";
import { Laser } from "laser-sdk";
import { Actionsheet, Button, Image, Stack, Text } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { selectOwnerPrivateKey } from "../../features/auth/authSlice";
import {
  selectCallRequest,
  selectConnector,
  selectPending,
  setCallRequest,
} from "../../features/walletConnect/walletConnectSlice";
import hexToAscii from "../../utils/hexToAscii";
import Constants from "expo-constants";

interface Props {
  walletAddress: string;
}

const WalletConnectPrompt = ({ walletAddress }: Props) => {
  const connector = useSelector(selectConnector);
  const pending = useSelector(selectPending);
  const callRequest = useSelector(selectCallRequest);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const provider = useProvider({ chainId: 5 });
  const dispatch = useDispatch();

  if (!ownerPrivateKey) return null;

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
              {callRequest.method === "personal_sign" &&
                hexToAscii(callRequest.params[0])}
            </Text>
            <Image source={{ uri: connector.peerMeta.icons[0] }} alt="logo" />
            <Stack space="3" direction="row">
              <Button
                onPress={async () => {
                  const owner = new ethers.Wallet(ownerPrivateKey);

                  if (callRequest.method === "eth_signTypedData") {
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
                  }

                  if (callRequest.method === "personal_sign") {
                    const result = await owner.signMessage(
                      utils.arrayify(callRequest.params[0])
                    );

                    connector.approveRequest({
                      id: callRequest.id,
                      result,
                    });
                    dispatch(setCallRequest(null));
                  }

                  if (callRequest.method === "eth_sendTransaction") {
                    const laser = new Laser(provider, owner, walletAddress);
                    const { to, value = 0, data } = callRequest.params[0];

                    const feeData = await provider.getFeeData();
                    try {
                      const transaction = await laser.sendTransaction(
                        to,
                        data,
                        value,
                        {
                          maxFeePerGas: feeData.maxFeePerGas,
                          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                          gasTip: 30000,
                        }
                      );
                      const { data: txData } = await axios.post(
                        `${Constants.manifest?.extra?.relayerUrl}/transactions`,
                        { transaction, sender: walletAddress }
                      );
                      connector.approveRequest({
                        id: callRequest.id,
                        result: txData.hash,
                      });
                      dispatch(setCallRequest(null));
                    } catch (error) {
                      console.log(error);
                    }
                  }
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
