import WalletConnect from "@walletconnect/client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import QRCodeScanner from "../components/QRCodeScanner/QRCodeScanner";
import {
  setCallRequest,
  setConnected,
  setConnector,
  setPeerMeta,
  setPending,
} from "../features/walletConnect/walletConnectSlice";
import { IClientMeta } from "@walletconnect/types";
import { useNavigation } from "@react-navigation/native";

const QRCodeScanScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [connecting, setConnecting] = useState(false);

  const connect = async (uri: string) => {
    if (connecting) return;
    setConnecting(true);
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

    const peerMeta = await new Promise<IClientMeta>((resolve, reject) => {
      connector.on("session_request", (error, payload) => {
        if (error) reject(error);

        const { peerMeta } = payload.params[0];
        resolve(peerMeta);
      });
    });

    subscribe(connector);

    dispatch(setPeerMeta(peerMeta));
    dispatch(setConnector(connector));
    dispatch(setPending(true));

    navigation.goBack();
    setConnecting(false);
  };

  const subscribe = (connector: WalletConnect) => {
    connector.on("session_update", (error) => {
      console.log("EVENT", "session_update");

      if (error) {
        throw error;
      }
    });

    connector.on("call_request", async (error, payload) => {
      if (error) throw error;

      dispatch(setCallRequest(payload));
    });

    connector.on("connect", (error, payload) => {
      if (error) throw error;

      dispatch(setConnector(connector));
      dispatch(setPending(false));
    });

    connector.on("disconnect", (error, payload) => {
      if (error) throw error;
      dispatch(setConnector(null));
      dispatch(setPending(false));
    });
  };

  return <QRCodeScanner onScan={connect} connecting={connecting} />;
};

export default QRCodeScanScreen;
