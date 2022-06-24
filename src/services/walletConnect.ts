import WalletConnect from "@walletconnect/client";

interface ConnectOptions {
  uri: string;
  onSessionRequest: (payload: any) => void;
  onSessionUpdate: (payload: any) => void;
  onCallRequest: (payload: any) => void;
  onConnect: (payload: any) => void;
  onDisconnect: (payload: any) => void;
}

export const connect = async ({
  uri,
  onSessionRequest,
  onSessionUpdate,
  onCallRequest,
  onConnect,
  onDisconnect,
}: ConnectOptions) => {
  const connector = new WalletConnect({
    uri,
    clientMeta: {
      description: "WalletConnect Developer App",
      url: "https://walletconnect.org",
      icons: ["https://walletconnect.org/walletconnect-logo.png"],
      name: "WalletConnect",
    },
  });

  await connector.createSession();

  await new Promise<void>((resolve, reject) => {
    connector.on("session_request", (error, payload) => {
      if (error) reject(error);
      onSessionRequest(payload);
      resolve();
    });
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
