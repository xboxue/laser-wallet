import { Camera, PermissionStatus } from "expo-camera";
import { Box, Spinner } from "native-base";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

interface Props {
  onScan: (data: string) => void;
  connecting?: boolean;
}

const QRCodeScanner = ({ onScan, connecting = false }: Props) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
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
      <Camera
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        style={StyleSheet.absoluteFill}
        onBarCodeScanned={({ data }) => onScan(data)}
      />
    </Box>
  );
};

export default QRCodeScanner;
