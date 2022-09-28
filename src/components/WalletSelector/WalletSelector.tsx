import Ionicons from "@expo/vector-icons/Ionicons";
import { Actionsheet, Button, ChevronDownIcon, Icon } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectVaultAddress,
  selectWalletAddress,
  selectWallets,
  setWalletAddress,
} from "../../features/wallet/walletSlice";
import formatAddress from "../../utils/formatAddress";
import CopyIconButton from "../CopyIconButton/CopyIconButton";

const WalletSelector = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const vaultAddress = useSelector(selectVaultAddress);
  const dispatch = useDispatch();
  const wallets = useSelector(selectWallets);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);

  return (
    <>
      <Actionsheet
        isOpen={walletSheetOpen}
        onClose={() => setWalletSheetOpen(false)}
      >
        <Actionsheet.Content>
          {vaultAddress && (
            <Actionsheet.Item
              onPress={() => dispatch(setWalletAddress(vaultAddress))}
              _pressed={{ bgColor: "gray.200", rounded: "lg" }}
              rightIcon={
                walletAddress === vaultAddress ? (
                  <>
                    <Icon
                      as={<Ionicons name="ios-checkmark-circle" />}
                      size="6"
                      color="green.500"
                    />
                    <CopyIconButton ml="auto" value={vaultAddress} />
                  </>
                ) : (
                  <CopyIconButton value={vaultAddress} ml="auto" />
                )
              }
            >
              {`Vault (${formatAddress(vaultAddress)})`}
            </Actionsheet.Item>
          )}
          {wallets.slice(0, 5).map((wallet, index) => (
            <Actionsheet.Item
              key={wallet.address}
              onPress={() => dispatch(setWalletAddress(wallet.address))}
              _pressed={{ bgColor: "gray.200", rounded: "lg" }}
              endIcon={
                walletAddress === wallet.address ? (
                  <>
                    <Icon
                      as={<Ionicons name="ios-checkmark-circle" />}
                      size="6"
                      color="green.500"
                    />
                    <CopyIconButton ml="auto" value={wallet.address} />
                  </>
                ) : (
                  <CopyIconButton value={wallet.address} ml="auto" />
                )
              }
            >{`Wallet ${index + 1} (${formatAddress(
              wallet.address
            )})`}</Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
      <Button
        variant="outline"
        _text={{ color: "black", fontSize: "sm" }}
        rightIcon={<ChevronDownIcon size="3" color="black" />}
        alignSelf="flex-start"
        py="2"
        bgColor="gray.100"
        borderWidth="0"
        onPress={() => setWalletSheetOpen(true)}
        _pressed={{ bgColor: "gray.200" }}
      >
        {`${
          walletAddress === vaultAddress
            ? "Vault"
            : `Wallet ${
                wallets.findIndex(
                  (wallet) => wallet.address === walletAddress
                ) + 1
              }`
        } (${formatAddress(walletAddress)})`}
      </Button>
    </>
  );
};

export default WalletSelector;
