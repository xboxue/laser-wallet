import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useDispatch } from "react-redux";
import QRCodeScanner from "../components/QRCodeScanner/QRCodeScanner";
import {
  setCallRequest,
  setConnector,
  setPeerMeta,
  setPending,
} from "../features/walletConnect/walletConnectSlice";
import { connect } from "../services/walletConnect";

const QRCodeScanScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [connecting, setConnecting] = useState(false);

  const handleScan = async (uri: string) => {
    if (connecting) return;
    setConnecting(true);

    const connector = await connect({
      uri,
      onSessionRequest: (payload) => dispatch(setPending(true)),
      onCallRequest: (payload) => dispatch(setCallRequest(payload)),
      onConnect: () => dispatch(setPending(false)),
      onDisconnect: () => {
        dispatch(setConnector(null));
        dispatch(setPending(false));
      },
      onSessionUpdate: () => {},
    });

    dispatch(setConnector(connector));

    navigation.goBack();
    setConnecting(false);
  };

  return <QRCodeScanner onScan={handleScan} connecting={connecting} />;
};

export default QRCodeScanScreen;
