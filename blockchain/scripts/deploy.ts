import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();
  const cerberusPay = await viem.deployContract("CerberusPay");

  console.log(`CerberusPay deployed to: ${cerberusPay.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});