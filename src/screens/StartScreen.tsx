import { useNavigation } from "@react-navigation/native";
import { Box, Button, Text } from "native-base";

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex={1} justifyContent="center" px="4">
      <Text variant="h4" textAlign="center" mb="5">
        Laser Wallet
      </Text>
      <Button onPress={() => navigation.navigate("SignUpEmail")}>
        Create new wallet
      </Button>
      <Button variant="ghost" mt="2">
        I already have a wallet
      </Button>
    </Box>
  );
};

export default StartScreen;
