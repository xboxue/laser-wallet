import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Icon } from "native-base";
import SettingsItem from "../components/SettingsItem/SettingsItem";

const SettingsScreen = () => {
  const navigation = useNavigation();

  const options = [
    {
      title: "Network",
      icon: <Icon as={Ionicons} color="white" name="planet-outline" size="5" />,
      onPress: () => navigation.navigate("SettingsNetwork"),
    },
    {
      title: "App security",
      icon: (
        <Icon as={Ionicons} color="white" name="settings-outline" size="5" />
      ),
      onPress: () => navigation.navigate("SettingsSecurity"),
    },
    {
      title: "Wallet recovery",
      icon: <Icon as={Ionicons} color="white" name="md-refresh" size="5" />,
      onPress: () => navigation.navigate("SettingsWalletRecovery"),
    },
    // {
    //   title: "Account",
    //   icon: (
    //     <Icon
    //       as={Ionicons}
    //       color="white"
    //       name="person-circle-outline"
    //       size="5"
    //     />
    //   ),
    // },
  ];

  return (
    <Box>
      {options.map(({ title, icon, onPress }) => (
        <SettingsItem title={title} icon={icon} onPress={onPress} key={title} />
      ))}
    </Box>
  );
};

export default SettingsScreen;
