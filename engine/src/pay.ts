import Config from "./config.ts";

import { getCustomers, getCustomersNextPayment, pay } from "commons/services/cerberusPayService.ts"
import usersRepository from "./repositories/usersRepository.ts";
import { Status } from "commons/models/status.ts";
import sendMail from "./services/mailService.ts";
import automationsRepository from "./repositories/automationsRepository.ts";

async function executionCycle() {

    console.log("Executing the payment cycle...");

    const customers = await getCustomers();
    console.log(customers.length + " customers loaded!");

    for (const customerAddress of customers) {
        if(/^(0x0+)$/.test(customerAddress)) continue;

        const nextPayment = await getCustomersNextPayment(customerAddress);
        if(nextPayment > (Date.now() / 1000)) continue;

        let user;

        try {
            console.log("Charging customer " + customerAddress);
            await pay(customerAddress);
            user = await usersRepository.updateUserStatus(customerAddress, Status.ACTIVE);
            if(!user) continue;

            await automationsRepository.startAutomations(user.id);
        } catch(err) {
            user = await usersRepository.updateUserStatus(customerAddress, Status.BLOCKED);
            if(!user) continue;

            await automationsRepository.stopAutomations(user.id);

            await sendMail(user.email, "Cerberus - Account Blocked", `
                Hi, ${user.name}!

                Your account was blocked due to insufficient balance or allowance. Please, click in the link below (or copy-paste in the browser) to update your payment info:

                ${Config.SITE_URL}/pay/${user.address}

                See ya!

                Admin
            `);
        }
        
    }

    console.log(`Finished the payment cycle.`);

}

export default () => {
    
    setInterval(executionCycle, Config.CHARGE_INTERVAL);

    executionCycle();
    
    console.log("Ceberus pay started.");
}