import { utils } from "ethers";

// Source: https://github.com/ChainSafe/web3.js/blob/1.x/packages/web3-utils/src/index.js
const hexToAscii = (hex: string) => {
  if (!utils.isHexString(hex))
    throw new Error("The parameter must be a valid HEX string.");

  var str = "";
  var i = 0,
    l = hex.length;
  if (hex.substring(0, 2) === "0x") {
    i = 2;
  }
  for (; i < l; i += 2) {
    var code = parseInt(hex.slice(i, i + 2), 16);
    str += String.fromCharCode(code);
  }

  return str;
};

export default hexToAscii;
