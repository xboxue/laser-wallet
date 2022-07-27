import WalletConnect from "@walletconnect/client";
import { IWalletConnectSession } from "@walletconnect/types";

interface ConnectOptions {
  uri?: string;
  session?: IWalletConnectSession;
}

interface SubscribeOptions {
  connector: WalletConnect;
  onSessionRequest: (payload: any) => void;
  onSessionUpdate: (payload: any) => void;
  onCallRequest: (payload: any) => void;
  onConnect: (payload: any) => void;
  onDisconnect: (payload: any) => void;
}

export const connect = ({ uri, session }: ConnectOptions) => {
  return new WalletConnect({
    uri,
    session,
    clientMeta: {
      description: "WalletConnect Developer App",
      url: "https://walletconnect.org",
      icons: ["https://walletconnect.org/walletconnect-logo.png"],
      name: "WalletConnect",
    },
  });
};

export const subscribe = ({
  connector,
  onSessionRequest,
  onSessionUpdate,
  onCallRequest,
  onConnect,
  onDisconnect,
}: SubscribeOptions) => {
  connector.on("session_request", (error, payload) => {
    if (error) throw error;
    onSessionRequest(payload);
  });

  connector.on("session_update", (error, payload) => {
    if (error) throw error;
    onSessionUpdate(payload);
  });

  connector.on("call_request", (error, payload) => {
    if (error) throw error;
    onCallRequest(payload);
  });

  connector.on("connect", (error, payload) => {
    if (error) throw error;
    onConnect(payload);
  });

  connector.on("disconnect", (error, payload) => {
    if (error) throw error;
    onDisconnect(payload);
  });
  return connector;
};
