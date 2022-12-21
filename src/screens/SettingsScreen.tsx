import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { Box, Icon, Switch } from "native-base";
import { Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SettingsItem from "../components/SettingsItem/SettingsItem";
import {
  selectIsDemoMode,
  setIsDemoMode,
} from "../features/wallet/walletSlice";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isDemoMode = useSelector(selectIsDemoMode);

  const options = [
    {
      title: "Account",
      icon: <Icon as={Ionicons} color="white" name="person" size="4" />,
      onPress: () => navigation.navigate("SettingsWalletRecovery"),
    },
    {
      title: "Contact us",
      icon: <Icon as={Ionicons} color="white" name="mail" size="5" />,
      onPress: () => Linking.openURL("mailto:haohao@laserwallet.io"),
    },
    {
      title: "Privacy policy",
      icon: (
        <Icon as={Ionicons} color="white" name="shield-checkmark" size="5" />
      ),
      onPress: () => Linking.openURL("https://laserwallet.io/privacy"),
    },
    {
      title: "Demo mode",
      icon: <Icon as={Ionicons} color="white" name="flash" size="5" />,
      rightComponent: (
        <Switch
          size="md"
          isChecked={isDemoMode}
          onToggle={() => dispatch(setIsDemoMode(!isDemoMode))}
        />
      ),
    },
  ];

  return (
    <Box>
      {options.map((props) => (
        <SettingsItem {...props} key={props.title} />
      ))}
    </Box>
  );
};

export default SettingsScreen;
