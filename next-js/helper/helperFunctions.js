import { SECONDS_PER_YEAR } from "./constants";
import { ethers } from "ethers";

/**
 * Calculates the APY from APR
 * @param {*} APR APR of the protocol
 * @returns APY in 2 decimal places
 */
export function calculateAPY(APR) {
  const apy = ((1 + APR / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1) * 100;
  return convertTo2Decimals(apy);
}

/**
 * Calculates all APY from a list of APR
 * @param {*} APRArray list containing APR of protocols
 * @returns list of APY in 2 decimal places
 */
export function calculateAPYArr(APRArray) {
  const arr = [];
  for (const apr of APRArray) {
    const formattedAPR = ethers.utils.formatUnits(apr, 18);
    const apy = calculateAPY(formattedAPR);
    arr.push(convertTo2Decimals(apy));
  }
  return arr;
}

/**
 * Convert a number to 2 decimal place
 * @param {*} numToBeConverted
 * @returns number in 2 decimal place
 */
export function convertTo2Decimals(numToBeConverted) {
  return numToBeConverted.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
}
