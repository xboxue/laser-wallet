import { useNavigation } from "@react-navigation/native";
import { Box, Button, Image } from "native-base";
import logoVertical from "../../assets/logo-vertical.png";

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex={1} justifyContent="center" px="4" pb="20">
      <Image
        source={logoVertical}
        alt="logo"
        w="120"
        h="120"
        resizeMode="contain"
        alignSelf="center"
        mb="12"
      />
      <Button onPress={() => navigation.navigate("SignUpAuth")}>
        Create new wallet
      </Button>
      <Button
        variant="subtle"
        mt="2"
        onPress={() => navigation.navigate("RecoveryImportSeedPhrase")}
      >
        I already have a wallet
      </Button>
    </Box>
  );
};

export default StartScreen;
