import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Badge, Box, Button, Circle, Icon, Pressable, Text } from "native-base";
import { useSelector } from "react-redux";
import {
  selectGuardians,
  selectIsLaserGuardianEnabled,
} from "../features/guardians/guardiansSlice";
import formatAddress from "../utils/formatAddress";

const SignUpGuardiansScreen = () => {
  const navigation = useNavigation();
  const guardians = useSelector(selectGuardians);
  const isLaserGuardianEnabled = useSelector(selectIsLaserGuardianEnabled);

  return (
    <Box>
      <Box p="4">
        <Text variant="subtitle1">Choose your guardians</Text>
        <Text mb="4">
          Guardians are wallets that can start your wallet recovery in case your
          device is lost.
        </Text>
        <Pressable
          onPress={() => navigation.navigate("SignUpLaserGuardianDetails")}
        >
          {({ isPressed }) => (
            <Box
              flexDirection="row"
              alignItems="center"
              mb="1"
              opacity={isPressed ? 0.3 : 1}
            >
              <Circle bg="gray.800" size="9">
                <Icon
                  as={<Ionicons name="mail-outline" />}
                  size="4"
                  color="white"
                />
              </Circle>
              <Box ml="3">
                <Box flexDir="row" alignItems="center">
                  <Text variant="subtitle1" mr="2">
                    Email
                  </Text>
                  {isLaserGuardianEnabled ? (
                    <Badge
                      _text={{ fontSize: "xs" }}
                      colorScheme="success"
                      rounded="md"
                    >
                      Enabled
                    </Badge>
                  ) : (
                    <Badge
                      _text={{ fontSize: "xs" }}
                      colorScheme="danger"
                      rounded="md"
                    >
                      Disabled
                    </Badge>
                  )}
                </Box>
                <Text>Recover your wallet with your email</Text>
              </Box>
            </Box>
          )}
        </Pressable>
        {guardians.map((guardian) => (
          <Pressable
            onPress={() =>
              navigation.navigate("SignUpGuardianDetails", { guardian })
            }
            key={guardian.id}
          >
            {({ isPressed }) => (
              <Box
                flexDirection="row"
                alignItems="center"
                py="1"
                opacity={isPressed ? 0.3 : 1}
              >
                <Circle bg="gray.800" size="9">
                  <Icon
                    as={<Ionicons name="person-outline" />}
                    size="4"
                    color="white"
                  />
                </Circle>
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
        <Button
          mt="4"
          variant="subtle"
          onPress={() => navigation.navigate("SignUpAddGuardian")}
        >
          Add guardian
        </Button>
        <Button
          mt="2"
          onPress={() => navigation.navigate("SignUpBackup")}
          isDisabled={!guardians.length && !isLaserGuardianEnabled}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default SignUpGuardiansScreen;
