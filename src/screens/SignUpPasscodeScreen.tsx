import { useNavigation } from "@react-navigation/native";
import { Box, Text } from "native-base";
import CreatePasscodeContainer from "../components/CreatePasscodeContainer/CreatePasscodeContainer";

const SignUpPasscodeScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex={1} pb="4">
      <Box p="4">
        <Text variant="subtitle1">Protect your wallet</Text>
        <Text>Enter a passcode to keep your wallet safe.</Text>
      </Box>
      <CreatePasscodeContainer
        onSuccess={() => navigation.navigate("SignUpBackup")}
      />
    </Box>
  );
};

export default SignUpPasscodeScreen;
