import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import QRCodeScanner from "../components/QRCodeScanner/QRCodeScanner";
import {
  addConnector,
  selectIsConnecting,
  setIsConnecting,
} from "../features/walletConnect/walletConnectSlice";
import useWalletConnectSubscription from "../hooks/useWalletConnectSubscription";
import { connect } from "../services/walletConnect";

const QRCodeScanScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isConnecting = useSelector(selectIsConnecting);
  const { subscribe } = useWalletConnectSubscription(false);

  const handleScan = async (uri: string) => {
    if (isConnecting) return;
    dispatch(setIsConnecting(true));

    const connector = connect({ uri });
    subscribe(connector);
    dispatch(addConnector(connector));
    navigation.goBack();
  };

  return <QRCodeScanner onScan={handleScan} connecting={isConnecting} />;
};

export default QRCodeScanScreen;
