import Wallet from "ethereumjs-wallet";
import { Box } from "native-base";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BackupPasswordForm from "../components/BackupPasswordForm/BackupPasswordForm";
import { DEFAULT_CHAIN } from "../constants/chains";
import { selectGuardians } from "../features/guardians/guardiansSlice";
import {
  addWallet,
  setOwnerAddress,
  setOwnerPrivateKey,
  setRecoveryOwnerAddress,
  setRecoveryOwnerPrivateKey,
  setWalletAddress,
} from "../features/wallet/walletSlice";
import { createWallet } from "../services/wallet";

const SignUpBackupPasswordScreen = () => {
  const [loading, setLoading] = useState(false);
  const guardians = useSelector(selectGuardians);
  const dispatch = useDispatch();

  const handleSubmit = async (password: string) => {
    try {
      setLoading(true);
      const owner = Wallet.generate();
      const recoveryOwner = Wallet.generate();

      const walletAddress = await createWallet({
        chainId: DEFAULT_CHAIN,
        guardians: guardians.map((guardian) => guardian.address),
        ownerAddress: owner.getAddressString(),
        recoveryOwnerAddress: recoveryOwner.getAddressString(),
      });

      // TODO: Fix
      // await createBackup(
      //   recoveryOwner.getPrivateKeyString(),
      //   password,
      //   recoveryOwner.getAddressString()
      // );

      dispatch(setOwnerAddress(owner.getAddressString()));
      dispatch(setOwnerPrivateKey(owner.getPrivateKeyString()));
      dispatch(setRecoveryOwnerAddress(recoveryOwner.getAddressString()));
      dispatch(setRecoveryOwnerPrivateKey(recoveryOwner.getPrivateKeyString()));
      dispatch(setWalletAddress(walletAddress));
      dispatch(addWallet({ address: walletAddress, chainId: DEFAULT_CHAIN }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="4">
      <BackupPasswordForm onSubmit={handleSubmit} submitting={loading} />
    </Box>
  );
};

export default SignUpBackupPasswordScreen;
