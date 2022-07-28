import { Actionsheet, Box, Button, Stack, Text } from "native-base";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EnableICloudPrompt = ({ open, onClose }: Props) => {
  return (
    <Actionsheet isOpen={open} onClose={onClose}>
      <Actionsheet.Content>
        <Box p="2">
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
      </Actionsheet.Content>
    </Actionsheet>
  );
};

export default EnableICloudPrompt;
