import { useNavigation } from "@react-navigation/native";
import { Box, Button, Image } from "native-base";
import logoVertical from "../../assets/logo-vertical.png";

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <Box flex="1" p="4" safeAreaBottom>
      <Box flex="1" justifyContent="center">
        <Image
          source={logoVertical}
          alt="logo"
          w="130"
          h="130"
          resizeMode="contain"
          alignSelf="center"
          mb="40"
        />
      </Box>
      <Button
        _text={{ fontSize: "lg" }}
        onPress={() => navigation.navigate("SignUpAccessCode")}
      >
        Create new wallet
      </Button>
      <Button
        _text={{ fontSize: "lg" }}
        variant="subtle"
        mt="4"
        // onPress={() =>
        //   navigation.navigate("SignUpAuth", {
        //     nextScreen: "RecoveryImportSeedPhrase",
        //   })
        // }
      >
        I already have a wallet
      </Button>
    </Box>
  );
};

export default StartScreen;
