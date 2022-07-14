import { ethers, utils } from "ethers";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { REQUEST_TYPES } from "../../constants/walletConnect";
import { selectOwnerPrivateKey } from "../../features/auth/authSlice";
import { selectChainId } from "../../features/network/networkSlice";
import { addPendingTransaction } from "../../features/transactions/transactionsSlice";
import {
  selectCallRequest,
  selectConnector,
  selectPending,
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
  const connector = useSelector(selectConnector);
  const pending = useSelector(selectPending);
  const callRequest = useSelector(selectCallRequest);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const chainId = useSelector(selectChainId);
  const provider = useProvider({ chainId });
  const laser = useLaser();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const approveRequest = async () => {
    if (!ownerPrivateKey || !callRequest || !connector) return;

    const owner = new ethers.Wallet(ownerPrivateKey);

    if (
      callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA ||
      callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA_V4
    ) {
      const { types, domain, message } = JSON.parse(callRequest.params[1]);
      const result = await owner._signTypedData(domain, types, message);

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
  };

  const rejectRequest = () => {
    if (!callRequest || !connector) return;

    connector.rejectRequest({
      id: callRequest.id,
      error: { message: "User rejected" },
    });
    dispatch(setCallRequest(null));
  };

  return (
    <>
      {pending && connector?.peerMeta && (
        <WalletConnectSessionPrompt
          onApprove={() =>
            connector.approveSession({
              accounts: [walletAddress],
              chainId,
            })
          }
          onReject={() => connector.rejectSession()}
          onClose={() => connector.rejectSession()}
          peerMeta={connector.peerMeta}
        />
      )}
      {callRequest &&
        callRequest.method !== REQUEST_TYPES.SEND_TRANSACTION &&
        connector?.peerMeta && (
          <WalletConnectRequestPrompt
            onApprove={approveRequest}
            onReject={rejectRequest}
            onClose={rejectRequest}
            peerMeta={connector.peerMeta}
            callRequest={callRequest}
          />
        )}
      {callRequest?.method === REQUEST_TYPES.SEND_TRANSACTION &&
        connector?.peerMeta && (
          <WalletConnectTransactionPrompt
            onApprove={approveRequest}
            onReject={rejectRequest}
            onClose={rejectRequest}
            peerMeta={connector.peerMeta}
            callRequest={callRequest}
            loading={loading}
          />
        )}
    </>
  );
};

export default WalletConnectPrompt;
