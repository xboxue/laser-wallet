import { Box, Modal, Text } from "native-base";
import { Pressable } from "react-native";

interface Props {
  isOpen: boolean;
  title: string | null;
  subtitle: string | null;
  onClose: () => void;
}

const ErrorDialog = ({ isOpen, title, subtitle, onClose }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content bgColor="gray.800">
        <Box p="8">
          <Text textAlign="center" variant="h6" mb="1">
            {title}
          </Text>
          <Text textAlign="center" color="text.300" fontSize="md">
            {subtitle}
          </Text>
        </Box>
        <Pressable onPress={onClose}>
          {({ pressed }) => (
            <Box
              p="4"
              borderTopWidth="0.5"
              borderColor="gray.600"
              bgColor={pressed ? "gray.700" : undefined}
            >
              <Text textAlign="center" variant="subtitle1" fontWeight="600">
                OK
              </Text>
            </Box>
          )}
        </Pressable>
      </Modal.Content>
    </Modal>
  );
};

export default ErrorDialog;
