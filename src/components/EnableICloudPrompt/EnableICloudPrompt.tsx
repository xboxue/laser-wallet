import { Actionsheet, Box, Button, Stack, Text } from "native-base";
import BottomSheet from "../BottomSheet/BottomSheet";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EnableICloudPrompt = ({ open, onClose }: Props) => {
  return (
    <BottomSheet isOpen={open} onClose={onClose}>
      <Box p="4">
        <Text variant="subtitle1" mb="1">
          Backup your recovery key
        </Text>
        <Text mb="3">
          Please sign in to iCloud to save an encrypted copy of your recovery
          key.
        </Text>
        <Stack space="2" px="1" mb="5">
          <Text variant="subtitle2">1. Open Settings app</Text>
          <Text variant="subtitle2">2. Sign in to iCloud</Text>
          <Text variant="subtitle2">3. Turn on iCloud Drive</Text>
        </Stack>
        <Button onPress={onClose}>Done</Button>
      </Box>
    </BottomSheet>
  );
};

export default EnableICloudPrompt;
