import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import CreatePasscodeContainer from "../components/CreatePasscodeContainer/CreatePasscodeContainer";

const SettingsPasscodeScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex={1} pb="4">
      <Box p="4">
        <Text variant="subtitle1">Enter your new passcode</Text>
      </Box>
      <CreatePasscodeContainer onSuccess={() => navigation.goBack()} />
    </Box>
  );
};

export default SettingsPasscodeScreen;
