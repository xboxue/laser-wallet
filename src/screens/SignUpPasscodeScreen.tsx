import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";

const SignUpPasscodeScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <Text>Laser Wallet</Text>
    </Box>
  );
};

export default SignUpPasscodeScreen;
