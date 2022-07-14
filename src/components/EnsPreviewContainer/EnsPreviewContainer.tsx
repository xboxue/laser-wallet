import { isAddress } from "ethers/lib/utils";
import { Skeleton } from "native-base";
import useEnsAddressAndAvatar from "../../hooks/useEnsAddressAndAvatar";
import AddressOrEnsPreviewItem from "../AddressOrEnsPreviewItem/AddressOrEnsPreviewItem";

interface Props {
  ensName: string;
  onPress?: (address: string, ensName?: string) => void;
  errorComponent: React.ReactNode;
}

const EnsPreviewContainer = ({ ensName, onPress, errorComponent }: Props) => {
  const { address, ensAvatar, isLoading } = useEnsAddressAndAvatar(ensName);
  if (isLoading) return <Skeleton />;
  if (!address || !isAddress(address)) return <>{errorComponent}</>;

  return (
    <AddressOrEnsPreviewItem
      address={address}
      ensName={ensName}
      ensAvatar={ensAvatar as string}
      onPress={onPress}
    />
  );
};

export default EnsPreviewContainer;
