import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { Icon, IconButton, Tooltip } from "native-base";
import { useState } from "react";

interface Props {
  value: string;
}

const CopyIconButton = ({ value }: Props) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Tooltip label="Copied" isOpen={tooltipOpen} hasArrow placement="top">
      <IconButton
        size="sm"
        variant="ghost"
        icon={<Icon as={<Ionicons name="copy-outline" />} />}
        onPress={() => {
          Clipboard.setStringAsync(value);
          setTooltipOpen(true);
          setTimeout(() => setTooltipOpen(false), 1000);
        }}
      />
    </Tooltip>
  );
};

export default CopyIconButton;
