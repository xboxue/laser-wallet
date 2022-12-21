import { BigNumberish } from "ethers";
import { formatUnits } from "ethers/lib/utils";

interface FormatOptions extends Intl.NumberFormatOptions {
  decimals?: number;
}

const formatAmount = (amount: BigNumberish, options: FormatOptions = {}) => {
  const { decimals = 18, ...rest } = options;

  return new Intl.NumberFormat("en", rest).format(
    parseFloat(formatUnits(amount, decimals))
  );
};

export default formatAmount;
