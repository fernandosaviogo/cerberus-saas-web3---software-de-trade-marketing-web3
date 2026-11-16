import Config from "./config.ts";

import type Pool from "commons/models/pool.ts";
import automationsRepository from "./repositories/automationsRepository.ts";
import type Automation from "commons/models/automation.ts";
import usersRepository from "./repositories/usersRepository.ts";
import { swap } from "commons/services/uniswapService.ts";
import sendMail from "./services/mailService.ts";
import tradesRepository from "./repositories/tradesRepository.ts";
import type { CerberusWSS } from "./wss.ts";

function evalCondition(automation: Automation, pool: Pool): boolean {
    const condition = automation.isOpened ? automation.closeCondition : automation.openCondition;
    if (!condition) false;

    const ifCondition = `pool.${condition?.field}${condition?.operator}${condition?.value}`;
    console.log("Condition: " + ifCondition);

    return Function("pool", "return " + ifCondition)(pool);
}

export default async (pool: Pool, WSS: CerberusWSS): Promise<void> => {
    const automations = await automationsRepository.searchAutomations(pool.id);
    if (!automations || !automations.length) return;

    console.log(`${automations.length} atuomations found`);

    automations.map(async (automation) => {

        const isValid = evalCondition(automation, pool);
        if (!isValid) return;

        console.log(`${automation.name} fired!`);

        const user = await usersRepository.getUserById(automation.userId);
        if (!user || !user.privateKey) return;

        console.log(`${user.email} will swap.`);

        try {
            const swapResult = await swap(user, automation, pool);
            if (!swapResult) return;

            if (!swapResult.amountOut)
                automation.nextAmount = swapResult.amountOut;

            let trade;
            if(automation.isOpened){
                trade = await tradesRepository.closeTrade(automation.userId, automation.id!, swapResult);
                automation.tradeCount = automation.tradeCount ? automation.tradeCount + 1 : 1;
                if (trade?.pnl !== undefined)
                    automation.pnl = automation.pnl ? automation.pnl + trade.pnl : trade.pnl;
            }
            else {
                trade = await tradesRepository.addTrade({
                    automationId: automation.id!,
                    userId: automation.userId,
                    openAmountIn: swapResult.amountIn,
                    openAmountOut: swapResult.amountOut,
                    openPrice: swapResult.price
                })
            }

            WSS.direct(automation.userId, {
                type: "success",
                trade
            });
            
            automation.isOpened = !automation.isOpened;

        } catch (err: any) {
            console.error(`Cannot swap. AutomationId: ${automation.id}`);
            automation.isActive = false;

            WSS.direct(automation.userId, {
                type: "error",
                text: err.message
            });

            await sendMail(user.email, "Cerberus - Automation Error", `
                            Hi, ${user.name}!
            
                            Your automation was stopped due to a swap error.

                            ${err.message}

                            See ya!
            
                            Admin
                        `);
        }

        await automationsRepository.updateAutomation(automation);
    })
}