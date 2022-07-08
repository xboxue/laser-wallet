import { providers } from "ethers";

const isContractAddress = async (
  provider: providers.Provider,
  address: string
) => {
  const contractCode = await provider.getCode(address);
  return contractCode !== "0x";
};

export default isContractAddress;
