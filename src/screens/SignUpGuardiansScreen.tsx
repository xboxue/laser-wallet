import { useAuth } from "@clerk/clerk-react";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Avatar, Box, Button, Pressable, Text } from "native-base";
import { useSelector } from "react-redux";
import { selectGuardians } from "../features/guardians/guardiansSlice";
import formatAddress from "../utils/formatAddress";

const SignUpGuardiansScreen = () => {
  const navigation = useNavigation();
  const guardians = useSelector(selectGuardians);
  const { isSignedIn } = useAuth();

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Choose your guardians</Text>
        <Text mb="4">
          Guardians ensure you can recover your wallet in case your device is
          lost.
        </Text>
        <Pressable
          onPress={() =>
            navigation.navigate("SignUpGuardianDetails", {
              isLaserGuardian: true,
            })
          }
        >
          {({ isPressed }) => (
            <Box
              flexDirection="row"
              alignItems="center"
              mb="2"
              opacity={isPressed ? 0.3 : 1}
            >
              <Avatar>L</Avatar>
              <Box ml="3">
                <Text variant="subtitle1">
                  Laser Guardian {!isSignedIn && "(Disabled)"}
                </Text>
                <Text>
                  {formatAddress(
                    Constants.manifest?.extra?.laserGuardianAddress
                  )}
                </Text>
              </Box>
            </Box>
          )}
        </Pressable>
        {guardians.map((guardian) => (
          <Pressable
            onPress={() =>
              navigation.navigate("SignUpGuardianDetails", { guardian })
            }
            key={guardian.address}
          >
            {({ isPressed }) => (
              <Box
                flexDirection="row"
                alignItems="center"
                mb="2"
                opacity={isPressed ? 0.3 : 1}
              >
                <Avatar>{guardian.name[0]}</Avatar>
                <Box ml="3">
                  <Text variant="subtitle1">{guardian.name}</Text>
                  <Text>
                    {guardian.ensName || formatAddress(guardian.address)}
                  </Text>
                </Box>
              </Box>
            )}
          </Pressable>
        ))}
        <Button mt="4" onPress={() => navigation.navigate("SignUpAddGuardian")}>
          Add guardian
        </Button>
        <Button mt="4" onPress={() => navigation.navigate("SignUpBackup")}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpGuardiansScreen;
