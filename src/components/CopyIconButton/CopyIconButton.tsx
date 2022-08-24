import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { Icon, IconButton, Tooltip, useToast } from "native-base";
import { useState } from "react";
import ToastAlert from "../ToastAlert/ToastAlert";

interface Props {
  value: string;
}

const CopyIconButton = ({ value }: Props) => {
  const toast = useToast();

  return (
    <IconButton
      size="sm"
      variant="ghost"
      icon={<Icon as={<Ionicons name="copy-outline" />} />}
      onPress={() => {
        Clipboard.setStringAsync(value);
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Copied to clipboard" />
          ),
          duration: 2000,
        });
      }}
    />
  );
};

export default CopyIconButton;
