import Config from "./config.ts";
import type { IncomingMessage } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import type { JWT } from "commons/models/jwt.ts"

let wss : CerberusWSS;

const whitelist = Config.CORS_ORIGIN.split(",");

class CerberusWS extends WebSocket {
    id: string;

    constructor(address: string) {
        super(address);
        this.id = "";
    }
}

export class CerberusWSS extends WebSocketServer {
    isConnected(userId: string) : boolean {
        if(!this.clients || !this.clients.size) return false;
        return ([...this.clients] as CerberusWS[]).some(c => c.id === userId) ;
    }

    getConnections() : string[] {
        if(!this.clients || !this.clients.size) return [];
        return ([...this.clients] as CerberusWS[]).map(c => c.id);
    }

    direct(userId: string, jsonObj: Object) {
        console.log("Sending direct message to " + userId);
        if(!this.clients || !this.clients.size) return;
        ([...this.clients] as CerberusWS[]).forEach(client => {
            if(client.id === userId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(jsonObj));
                return;
            }
        })
    }

    broadcast(jsonObj : Object) {
        if(!this.clients || !this.clients.size) return;
        ([...this.clients] as CerberusWS[]).forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(jsonObj));
                return;
            }
        })
    }
}

function corsValidation(origin: string | undefined) {
    return whitelist[0] === "*" || whitelist.includes(origin || "");
}

export default () : CerberusWSS => {
    if(wss) return wss;

    wss = new CerberusWSS({
        port: Number(process.env.WS_PORT),
    })

    wss.on("connection", (ws: CerberusWS, req: IncomingMessage) => {
        if(!req.url || !req.headers.origin || !corsValidation(req.headers.origin)) 
            throw new Error("WebSocket connection rejected due to CORS policy.");

        const token = req.url.split("token=")[1];
        if(!token) throw new Error("WebSocket connection rejected due to invalid token.");

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWT;
        if(!decoded || !decoded.userId && !wss.isConnected(decoded.userId)) throw new Error("WebSocket connection rejected due to invalid token.");
        
        ws.id = decoded.userId; // Implementar segurança
        ws.on("message", (data) => console.log(data));
        ws.on("error", (err) => console.log(err));
        console.log("ws.onConnection" + req.url);
    })

    console.log(`Cerberus WebSocket Server is running.`);
    return wss;
}