import { BarCodeScanner, PermissionStatus } from "expo-barcode-scanner";
import { Box, Spinner } from "native-base";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

interface Props {
  onScan: (data: string) => void;
  connecting?: boolean;
}

const QRCodeScanner = ({ onScan, connecting = false }: Props) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === PermissionStatus.GRANTED);
    })();
  }, []);

  if (!hasPermission) return null;

  return (
    <Box bgColor="black" flex="1">
      {connecting && (
        <Spinner
          style={StyleSheet.absoluteFill}
          size="lg"
          margin="auto"
          zIndex="1"
        />
      )}
      <BarCodeScanner
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={StyleSheet.absoluteFill}
        onBarCodeScanned={({ data }) => onScan(data)}
      />
    </Box>
  );
};

export default QRCodeScanner;
