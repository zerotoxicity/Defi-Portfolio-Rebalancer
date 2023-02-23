import { SECONDS_PER_YEAR } from "./constants";
import { ethers } from "ethers";

export function calculateAPY(APR) {
  const apy = ((1 + APR / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1) * 100;
  return convertTo2Decimals(apy);
}

export function calculateAPYArr(APRArray) {
  const arr = [];
  for (const apr of APRArray) {
    const formattedAPR = ethers.utils.formatUnits(apr, 18);
    const apy = calculateAPY(formattedAPR);
    arr.push(convertTo2Decimals(apy));
  }
  return arr;
}

export function convertTo2Decimals(numToBeConverted) {
  return numToBeConverted.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
}
