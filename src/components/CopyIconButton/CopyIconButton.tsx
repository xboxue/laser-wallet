import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import { Icon, IconButton, IIconButtonProps, useToast } from "native-base";
import ToastAlert from "../ToastAlert/ToastAlert";

interface Props extends IIconButtonProps {
  value: string;
}

const CopyIconButton = ({ value, ...props }: Props) => {
  const toast = useToast();

  return (
    <IconButton
      size="xs"
      variant="unstyled"
      icon={<Icon as={<Feather name="copy" />} color="white" />}
      onPress={() => {
        Clipboard.setStringAsync(value);
        toast.show({
          render: () => (
            <ToastAlert status="success" title="Copied to clipboard" />
          ),
          duration: 2000,
        });
      }}
      {...props}
    />
  );
};

export default CopyIconButton;
