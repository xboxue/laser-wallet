import { isAddress } from "ethers/lib/utils";
import { useSelector } from "react-redux";
import { useEnsAvatar, useEnsName } from "wagmi";
import { selectChainId } from "../features/network/networkSlice";

const useEnsNameAndAvatar = (address: string) => {
  const chainId = useSelector(selectChainId);

  // Resolve address to ENS name if input is a valid address
  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address,
    enabled: isAddress(address),
    chainId,
  });

  // Fetch ENS avatar if address resolved to an ENS name
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    addressOrName: ensName as string,
    enabled: !!ensName,
    chainId,
  });

  return { ensAvatar, ensName, isLoading: ensNameLoading || ensAvatarLoading };
};

export default useEnsNameAndAvatar;
