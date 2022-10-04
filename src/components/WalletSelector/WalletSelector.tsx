import { Box, Button, ChevronDownIcon } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectVaultAddress,
  selectWalletAddress,
  selectWallets,
  setWalletAddress,
} from "../../features/wallet/walletSlice";
import formatAddress from "../../utils/formatAddress";
import AddressItem from "../AddressItem/AddressItem";
import BottomSheet from "../BottomSheet/BottomSheet";

const WalletSelector = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const vaultAddress = useSelector(selectVaultAddress);
  const dispatch = useDispatch();
  const wallets = useSelector(selectWallets);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);

  return (
    <>
      <BottomSheet
        isOpen={walletSheetOpen}
        onClose={() => setWalletSheetOpen(false)}
      >
        <Box p="2" py="4">
          {vaultAddress && (
            <AddressItem
              onPress={() => dispatch(setWalletAddress(vaultAddress))}
              selected={walletAddress === vaultAddress}
              address={vaultAddress}
              title={`Vault (${formatAddress(vaultAddress)})`}
            />
          )}
          {wallets.slice(0, 2).map((wallet, index) => (
            <AddressItem
              key={wallet.address}
              onPress={() => dispatch(setWalletAddress(wallet.address))}
              selected={walletAddress === wallet.address}
              address={wallet.address}
              title={`Wallet ${index + 1} (${formatAddress(wallet.address)})`}
            />
          ))}
        </Box>
      </BottomSheet>
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
