import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
      <Text>Laser Wallet</Text>
      <Button onPress={() => navigation.navigate("SignUpPasscode")}>
        Create new wallet
      </Button>
      <Button>I already have a wallet</Button>
    </Box>
  );
};

export default StartScreen;
