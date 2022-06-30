import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Circle, Icon, Pressable, Text } from "native-base";

const SettingsNetworkScreen = () => {
  const navigation = useNavigation();
  const options = [
    {
      title: "Ethereum",
      //   icon: <Icon as={Ionicons} color="white" name="planet-outline" size="5" />,
      //   onPress: () => navigation.navigate("SettingsNetwork"),
    },
    {
      title: "Goerli",
      //   icon: (
      //     <Icon
      //       as={Ionicons}
      //       color="white"
      //       name="cloud-upload-outline"
      //       size="5"
      //     />
      //   ),
    },
  ];
  return (
    <Box>
      {options.map(({ title, icon, onPress }) => (
        <Pressable onPress={onPress} key={title}>
          {({ isPressed }) => (
            <Box
              px="4"
              py="3"
              flexDir="row"
              alignItems="center"
              opacity={isPressed ? "0.2" : "1"}
            >
              {/* <Circle bg="black" size="40px">
                {icon}
              </Circle> */}
              <Text variant="subtitle1" ml="3">
                {title}
              </Text>
            </Box>
          )}
        </Pressable>
      ))}
    </Box>
  );
};

export default SettingsNetworkScreen;
