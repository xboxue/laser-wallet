import { useSelector } from "react-redux";
import { useEnsAddress, useEnsAvatar } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";
import isEnsDomain from "../utils/isEnsDomain";

const useEnsAddressAndAvatar = (ensName: string) => {
  const chainId = useSelector(selectChainId);

  // Resolve ENS name to address
  const { data: address, isLoading: addressLoading } = useEnsAddress({
    name: ensName,
    chainId,
    enabled: isEnsDomain(ensName),
  });

  // Fetch ENS avatar
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: ensName,
    chainId,
    enabled: isEnsDomain(ensName),
  });

  return { address, ensAvatar, isLoading: addressLoading || ensAvatarLoading };
};

export default useEnsAddressAndAvatar;
