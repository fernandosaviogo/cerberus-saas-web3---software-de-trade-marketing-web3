import { network } from "hardhat";
import { formatEther, parseAbi, parseEther } from "viem";

const ABI_WETH = parseAbi([
  "function deposit() payable",
  "function balanceOf(address) view returns (uint256)",
]);
const WETH_MAINNET = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function main() {
  const { viem } = await network.create();
  const cerberusPay = await viem.deployContract("CerberusPay");
  const [walletClient] = await viem.getWalletClients();
  const account = walletClient.account;
  await cerberusPay.write.setAcceptedToken([WETH_MAINNET]);

  if (!account) {
    throw new Error("The selected network has no configured wallet account");
  }

  const txHash = await walletClient.writeContract({
    address: WETH_MAINNET,
    abi: ABI_WETH,
    functionName: "deposit",
    value: parseEther("10"),
  });
  await (await viem.getPublicClient()).waitForTransactionReceipt({ hash: txHash });

  console.log(`CerberusPay deployed to: ${cerberusPay.address}`);
  console.log(`Tx Deposit: ${txHash}`);

  const balance = await (await viem.getPublicClient()).readContract({
    address: WETH_MAINNET,
    abi: ABI_WETH,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log(`Weth balance: ${formatEther(balance)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});