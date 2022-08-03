import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { ethers, utils } from "ethers";
import Constants from "expo-constants";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
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

const GAS_LIMIT = 300000;

const WalletConnectPrompt = ({ walletAddress }: Props) => {
  const dispatch = useDispatch();

  const connectors = useSelector(selectConnectors);
  const sessionRequest = useSelector(selectSessionRequest);
  const callRequest = useSelector(selectCallRequest);
  const ownerPrivateKey = useSelector(selectOwnerPrivateKey);
  const isConnecting = useSelector(selectIsConnecting);
  const chainId = useSelector(selectChainId);
  const laser = useLaser();

  const getConnector = (peerId: string) => {
    return connectors.find((connector) => connector.peerId === peerId);
  };

  const { mutate: approveCallRequest, isLoading } = useMutation(
    async () => {
      if (!ownerPrivateKey || !callRequest) throw new Error("No call request");
      const connector = getConnector(callRequest.peerId);
      if (!connector) throw new Error("No connector");

      const owner = new ethers.Wallet(ownerPrivateKey);
      let result;

      if (
        callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA ||
        callRequest.method === REQUEST_TYPES.SIGN_TYPED_DATA_V4
      ) {
        result = signTypedData({
          privateKey: ethers.utils.arrayify(ownerPrivateKey),
          version: SignTypedDataVersion.V4,
          data: JSON.parse(callRequest.params[1]),
        });
      }

      if (callRequest.method === REQUEST_TYPES.PERSONAL_SIGN) {
        result = await owner.signMessage(utils.arrayify(callRequest.params[0]));
      }

      if (callRequest.method === REQUEST_TYPES.SEND_TRANSACTION) {
        const { to, value = 0, data } = callRequest.params[0];

        const { nonce } = await laser.getWalletState();
        const transaction = await laser.signTransaction(
          {
            to,
            callData: data,
            value,
            txInfo: {
              maxFeePerGas: 0,
              maxPriorityFeePerGas: 0,
              gasLimit: GAS_LIMIT,
              relayer: Constants.manifest?.extra?.relayerAddress,
            },
          },
          nonce
        );
        const hash = await sendTransaction({
          sender: walletAddress,
          transaction,
          chainId,
        });
        dispatch(addPendingTransaction({ ...transaction, hash }));
        result = hash;
      }

      if (callRequest.method === REQUEST_TYPES.SIGN_TRANSACTION) {
        const { to, value = 0, data } = callRequest.params[0];

        const { nonce } = await laser.getWalletState();
        result = await laser.signTransaction(
          {
            to,
            callData: data,
            value,
            txInfo: {
              maxFeePerGas: 0,
              maxPriorityFeePerGas: 0,
              gasLimit: GAS_LIMIT,
              relayer: Constants.manifest?.extra?.relayerAddress,
            },
          },
          nonce
        );
      }

      if (!result) throw new Error("Unsupported method");
      connector.approveRequest({
        id: callRequest.id,
        result,
      });
    },
    {
      onSuccess: () => {
        dispatch(setCallRequest(null));
      },
    }
  );

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
          loading={isLoading}
        />
      )}
    </>
  );
};

export default WalletConnectPrompt;
