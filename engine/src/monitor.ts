import Config from "./config.ts";
import { getTopPools } from "commons/services/uniswapService.ts";
import poolsRepositores from "./repositories/poolsRepositores.ts";
import WSSInit from "./wss.ts";
import cerberusExecution from "./cerberus.ts";

const WSS = WSSInit();

async function excutionCycle() {

    const pages = Math.ceil(Config.POOL_COUNT / 1000);

    for (let i = 0; i < pages; i++) {
        const pools = await getTopPools(1000, i * 1000);
        console.log(`Loaded ${pools.length} pools...`);

        const bulkResult = [];
        for (const pool of pools) {
            const poolResult = await poolsRepositores.updatePrices(pool);
            if (!poolResult) continue;

            bulkResult.push(poolResult);

            cerberusExecution(poolResult, WSS);

            //console.log(`Price for ${poolResult.symbol} (${poolResult.fee / 10000}%) is ${Number(poolResult.price0).toFixed(3)}`);
        }

        WSS.broadcast({ event: "priceUpdate", data: bulkResult });
    }
}

export default () => {

    setInterval(excutionCycle, Config.MONITOR_INTERVAL);

    excutionCycle();

    console.log(`ceberus Monitor started.`);
}