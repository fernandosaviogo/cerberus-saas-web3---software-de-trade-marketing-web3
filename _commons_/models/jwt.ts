import { Status } from "./status.js";

export type JWT = {
    userId: string;
    address: string;
    name: string;
    planId: string;
    status: Status;
}