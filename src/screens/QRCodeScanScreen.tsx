import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import QRCodeScanner from "../components/QRCodeScanner/QRCodeScanner";
import {
  addConnector,
  removeConnector,
  selectIsConnecting,
  setCallRequest,
  setIsConnecting,
  setSessionRequest,
} from "../features/walletConnect/walletConnectSlice";
import { connect, subscribe } from "../services/walletConnect";

const QRCodeScanScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isConnecting = useSelector(selectIsConnecting);

  const handleScan = async (uri: string) => {
    if (isConnecting) return;
    dispatch(setIsConnecting(true));

    const connector = connect(uri);
    subscribe({
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
      onConnect: () => dispatch(setSessionRequest(null)),
      onDisconnect: () => {
        dispatch(removeConnector(connector.peerId));
        dispatch(setSessionRequest(null));
      },
      onSessionUpdate: () => {},
    });

    dispatch(addConnector(connector));
    navigation.goBack();
  };

  return <QRCodeScanner onScan={handleScan} connecting={isConnecting} />;
};

export default QRCodeScanScreen;
