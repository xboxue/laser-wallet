import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { BigNumber, ethers, utils } from "ethers";
import Constants from "expo-constants";
import { keyBy } from "lodash";
import { useToast } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { REQUEST_TYPES } from "../../constants/walletConnect";
import { selectChainId, setChainId } from "../../features/network/networkSlice";
import { addPendingTransaction } from "../../features/transactions/transactionsSlice";
import {
  selectOwnerPrivateKey,
  selectWallets,
  setWalletAddress,
} from "../../features/wallet/walletSlice";
import {
  selectCallRequest,
  selectConnectors,
  selectIsConnecting,
  selectSessionRequest,
  setCallRequest,
} from "../../features/walletConnect/walletConnectSlice";
import useLaser from "../../hooks/useLaser";
import { sendTransaction } from "../../services/wallet";
import ToastAlert from "../ToastAlert/ToastAlert";
import WalletConnectRequestPrompt from "./WalletConnectRequestPrompt/WalletConnectRequestPrompt";
import WalletConnectSessionPrompt from "./WalletConnectSessionPrompt/WalletConnectSessionPrompt";
import WalletConnectTransactionPrompt from "./WalletConnectTransactionPrompt/WalletConnectTransactionPrompt";
import * as SecureStore from "expo-secure-store";
import { useProvider } from "wagmi";

interface Props {
  walletAddress: string;
}

const WalletConnectPrompt = ({ walletAddress }: Props) => {
  const dispatch = useDispatch();

  const connectors = useSelector(selectConnectors);
  const sessionRequest = useSelector(selectSessionRequest);
  const callRequest = useSelector(selectCallRequest);
  const isConnecting = useSelector(selectIsConnecting);
  const chainId = useSelector(selectChainId);
  const toast = useToast();
  const provider = useProvider({ chainId });

  const getConnector = (peerId: string) => {
    return connectors.find((connector) => connector.peerId === peerId);
  };

  const { mutate: approveCallRequest, isLoading } = useMutation(
    async () => {
      if (!callRequest) throw new Error("No call request");

      const privateKey = await SecureStore.getItemAsync("privateKey", {
        requireAuthentication: true,
      });
      if (!privateKey) throw new Error("No private key");

      const connector = getConnector(callRequest.peerId);
      if (!connector) throw new Error("No connector");

      const owner = new ethers.Wallet(privateKey);

      if (
        callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA ||
        callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA_V4
      ) {
        return signTypedData({
          privateKey: ethers.utils.arrayify(privateKey),
          version: SignTypedDataVersion.V4,
          data: JSON.parse(callRequest.params[1]),
        });
      }
      if (callRequest.method === REQUEST_TYPES.PERSONAL_SIGN) {
        return owner.signMessage(utils.arrayify(callRequest.params[0]));
      }
      if (callRequest.method === REQUEST_TYPES.SEND_TRANSACTION) {
        const transaction = callRequest.params[0];
        const { hash } = await owner.connect(provider).sendTransaction({
          from: transaction.from,
          to: transaction.to,
          data: transaction.data,
          gasLimit: transaction.gas,
          value: transaction.value,
          nonce: transaction.nonce,
        });
        dispatch(addPendingTransaction({ ...transaction, hash }));
        return hash;
      }
      if (callRequest.method === REQUEST_TYPES.SIGN_TRANSACTION) {
        const transaction = callRequest.params[0];
        return owner.signTransaction({
          from: transaction.from,
          to: transaction.to,
          data: transaction.data,
          gasLimit: transaction.gas,
          value: transaction.value,
          nonce: transaction.nonce,
        });
      }
      if (callRequest.method === REQUEST_TYPES.SWITCH_ETHEREUM_CHAIN) {
        const id = parseInt(callRequest.params[0].chainId, 16);
        dispatch(setChainId(id));
        return null;
      }
      throw new Error("Unsupported method");
    },
    {
      onSuccess: (result) => {
        if (!callRequest) throw new Error("No call request");
        const connector = getConnector(callRequest.peerId);
        if (!connector) throw new Error("No connector");

        if (callRequest.method === REQUEST_TYPES.SEND_TRANSACTION) {
          toast.show({
            render: () => (
              <ToastAlert status="success" title="Transaction sent" />
            ),
          });
        } else if (callRequest.method === REQUEST_TYPES.SWITCH_ETHEREUM_CHAIN) {
          const id = parseInt(callRequest.params[0].chainId, 16);
          connector.updateSession({ accounts: [walletAddress], chainId: id });
        }

        connector.approveRequest({
          id: callRequest.id,
          result,
        });
        dispatch(setCallRequest(null));
      },
    }
  );

  const rejectCallRequest = () => {
    if (!callRequest) return;
    const connector = getConnector(callRequest.peerId);
    if (!connector) return dispatch(setCallRequest(null));

    connector.rejectRequest({
      id: callRequest.id,
      error: { message: "User rejected" },
    });
    dispatch(setCallRequest(null));
  };

  const approveSessionRequest = () => {
    if (!sessionRequest) return;
    const connector = getConnector(sessionRequest.peerId);
    if (!connector) return;

    connector.approveSession({
      accounts: [walletAddress],
      chainId,
    });
  };

  const rejectSessionRequest = () => {
    if (!sessionRequest) return;
    const connector = getConnector(sessionRequest.peerId);
    if (!connector) return;
    connector.rejectSession();
  };

  return (
    <>
      {(isConnecting || sessionRequest) && (
        <WalletConnectSessionPrompt
          onApprove={approveSessionRequest}
          onReject={rejectSessionRequest}
          onClose={rejectSessionRequest}
          peerMeta={sessionRequest?.peerMeta}
          isConnecting={isConnecting}
        />
      )}
      {callRequest && callRequest.method !== REQUEST_TYPES.SEND_TRANSACTION && (
        <WalletConnectRequestPrompt
          onApprove={approveCallRequest}
          onReject={rejectCallRequest}
          onClose={rejectCallRequest}
          peerMeta={callRequest.peerMeta}
          callRequest={callRequest}
        />
      )}
      {(callRequest?.method === REQUEST_TYPES.SEND_TRANSACTION ||
        callRequest?.method === REQUEST_TYPES.SIGN_TRANSACTION) && (
        <WalletConnectTransactionPrompt
          onApprove={approveCallRequest}
          onReject={rejectCallRequest}
          onClose={rejectCallRequest}
          peerMeta={callRequest.peerMeta}
          callRequest={callRequest}
          loading={isLoading}
        />
      )}
    </>
  );
};

export default WalletConnectPrompt;
