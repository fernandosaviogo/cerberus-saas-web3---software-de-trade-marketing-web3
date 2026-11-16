import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { configVariable, defineConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: "0.8.34",
      },
      production: {
        version: "0.8.34",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    mainnetFork: {
      type: "edr-simulated",
      chainType: "l1",
      forking: {
        url: configVariable("RPC_URL"),
      },
    },
    infura: {
      type: "http",
      chainType: "l1",
      url: configVariable("INFURA_URL"),
      accounts: [configVariable("SECRET")],
    },
    local: {
      type: "http",
      chainType: "l1",
      chainId: 31337,
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    }
  },

  verify: {
    etherscan: {
      apiKey: configVariable("API_KEY"),
    },
  }
});
