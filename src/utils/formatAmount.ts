import { BigNumberish } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { round } from "lodash";

interface FormatOptions {
  decimals?: number;
  precision?: number;
}

const formatAmount = (amount: BigNumberish, options: FormatOptions = {}) => {
  const { decimals = 18, precision = 4 } = options;
  return round(parseFloat(formatUnits(amount, decimals)), precision);
};

export default formatAmount;
