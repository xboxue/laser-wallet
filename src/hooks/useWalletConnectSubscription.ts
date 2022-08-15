import WalletConnect from "@walletconnect/client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addConnector,
  addSession,
  removeConnector,
  removeSession,
  selectSessions,
  setCallRequest,
  setIsConnecting,
  setSessionRequest,
} from "../features/walletConnect/walletConnectSlice";
import {
  connect,
  subscribe as subscribeConnector,
} from "../services/walletConnect";

const useWalletConnectSubscription = (enabled = true) => {
  const sessions = useSelector(selectSessions);
  const dispatch = useDispatch();

  const subscribe = (connector: WalletConnect) => {
    return subscribeConnector({
      connector,
      onSessionRequest: (payload) => {
        dispatch(setSessionRequest(payload.params[0]));
        dispatch(setIsConnecting(false));
      },
      onCallRequest: (payload) =>
        dispatch(
          setCallRequest({
            ...payload,
            peerId: connector.peerId,
            peerMeta: connector.peerMeta,
          })
        ),
      onConnect: () => {
        dispatch(setSessionRequest(null));
        dispatch(addSession(connector.session));
      },
      onDisconnect: () => {
        dispatch(removeSession(connector.peerId));
        dispatch(removeConnector(connector.peerId));
        dispatch(setSessionRequest(null));
      },
      onSessionUpdate: () => {},
    });
  };

  useEffect(() => {
    if (enabled) {
      for (const session of sessions) {
        const connector = connect({ session });
        subscribe(connector);
        dispatch(addConnector(connector));
      }
    }
  }, [enabled]);

  return { subscribe };
};

export default useWalletConnectSubscription;
