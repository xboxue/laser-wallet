import { useQuery } from "@tanstack/react-query";
import { add, format, fromUnixTime } from "date-fns";
import { LaserWallet__factory } from "laser-sdk/dist/typechain";
import { Circle, Icon } from "native-base";
import { useSelector } from "react-redux";
import { useProvider } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import { selectVaultAddress } from "../features/wallet/walletSlice";
import Ionicons from "@expo/vector-icons/Ionicons";

const getNotifications = ({ vaultConfig }) => {
  const chainId = useSelector(selectChainId);
  const vaultAddress = useSelector(selectVaultAddress);
  const provider = useProvider({ chainId });

  if (!vaultAddress)
    return [
      {
        icon: (
          <Circle bg="gray.800" size="9">
            <Icon as={Ionicons} color="white" name="ios-arrow-up" size="5" />
          </Circle>
        ),
        title: "Activate vault",
        subtitle: "Secure your wallet with your vault.",
      },
    ];

  if (vaultConfig._isLocked)
    return [
      {
        title: "Vault is locked",
        subtitle: `Vault will be unlocked on ${format(
          add(fromUnixTime(vaultConfig.configTimestamp.toNumber()), {
            days: 2,
          }),
          "LLL d, h:mm a"
        )}`,
      },
    ];
};
