import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { REQUEST_TYPES } from "../../constants/walletConnect";
import { selectChainId } from "../../features/network/networkSlice";
import { addPendingTransaction } from "../../features/transactions/transactionsSlice";
import { selectOwnerPrivateKey } from "../../features/wallet/walletSlice";
import {
  selectCallRequest,
  selectConnectors,
  selectIsConnecting,
  selectSessionRequest,
  setCallRequest,
} from "../../features/walletConnect/walletConnectSlice";
import useLaser from "../../hooks/useLaser";
import { sendTransaction } from "../../services/wallet";
import WalletConnectRequestPrompt from "./WalletConnectRequestPrompt/WalletConnectRequestPrompt";
import WalletConnectSessionPrompt from "./WalletConnectSessionPrompt/WalletConnectSessionPrompt";
import WalletConnectTransactionPrompt from "./WalletConnectTransactionPrompt/WalletConnectTransactionPrompt";

interface Props {
  walletAddress: string;
}

const WalletConnectPrompt = ({ walletAddress }: Props) => {
  const dispatch = useDispatch();

  const connectors = useSelector(selectConnectors);
  const sessionRequest = useSelector(selectSessionRequest);
  const callRequest = useSelector(selectCallRequest);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const isConnecting = useSelector(selectIsConnecting);
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const laser = useLaser();
  const [loading, setLoading] = useState(false);

  const getConnector = (peerId: string) => {
    return connectors.find((connector) => connector.peerId === peerId);
  };

  const approveCallRequest = async () => {
    if (!ownerPrivateKey || !callRequest) return;
    const connector = getConnector(callRequest.peerId);
    if (!connector) return;

    const owner = new ethers.Wallet(ownerPrivateKey);

    if (
      callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA ||
      callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA_V4
    ) {
      const result = signTypedData({
        privateKey: ethers.utils.arrayify(ownerPrivateKey),
        version: SignTypedDataVersion.V4,
        data: JSON.parse(callRequest.params[1]),
      });

      connector.approveRequest({
        id: callRequest.id,
        result,
      });
      dispatch(setCallRequest(null));
    }

    if (callRequest.method === REQUEST_TYPES.PERSONAL_SIGN) {
      const result = await owner.signMessage(
        utils.arrayify(callRequest.params[0])
      );

      connector.approveRequest({
        id: callRequest.id,
        result,
      });
      dispatch(setCallRequest(null));
    }

    if (callRequest.method === REQUEST_TYPES.SEND_TRANSACTION) {
      setLoading(true);
      const { to, value = 0, data } = callRequest.params[0];

      const feeData = await provider.getFeeData();
      try {
        const transaction = await laser.sendTransaction(to, data, value, {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          gasTip: 30000,
        });
        const { hash } = await sendTransaction({
          sender: walletAddress,
          transaction,
          chainId,
        });
        dispatch(addPendingTransaction({ ...transaction, hash }));
        connector.approveRequest({
          id: callRequest.id,
          result: hash,
        });
        dispatch(setCallRequest(null));
      } finally {
        setLoading(false);
      }
    }

    if (callRequest.method === REQUEST_TYPES.SIGN_TRANSACTION) {
      setLoading(true);
      const { to, value = 0, data } = callRequest.params[0];
      const feeData = await provider.getFeeData();

      try {
        const transaction = await laser.sendTransaction(to, data, value, {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          gasTip: 30000,
        });
        connector.approveRequest({
          id: callRequest.id,
          result: transaction,
        });
        dispatch(setCallRequest(null));
      } finally {
        setLoading(false);
      }
    }
  };

  const rejectCallRequest = () => {
    if (!callRequest) return;
    const connector = getConnector(callRequest.peerId);
    if (!connector) return;

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
          loading={loading}
        />
      )}
    </>
  );
};

export default WalletConnectPrompt;
