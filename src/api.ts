export { RouteBuilder } from "./route-builder";

import { spawn } from "child_process";
import { Express, NextFunction, Request, Response, Router } from "express";
import * as jsonServer from "json-server";

export class BogusApiServer {

    public get url(): string { return this.baseUrl; }
    private baseUrl: string;
    private listener: Express;
    private router: Router = Router();
    private middlewares: any;
    private serverInstance: any;
    private serverInstanceTitle: string;

    constructor() {
        this.serverInstanceTitle = this.generateRandomString();
        this.resetStupidBambooBreakingStuff();
    }

    private generateRandomString(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private resetStupidBambooBreakingStuff() {
        process.env.HTTPS_PROXY = "";
        process.env.HTTP_PROXY = "";
    }

    public async start(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.listener = jsonServer.create();

            this.middlewares = jsonServer.defaults();

            // Set default middlewares (logger, static, cors and no-cache)
            this.listener.use(this.middlewares);

            // To handle POST, PUT and PATCH you need to use a body-parser
            // You can use the one used by JSON Server
            this.listener.use(jsonServer.bodyParser);

            // Custom router with swappable insides
            this.listener.use((request: Request, response: Response, next: NextFunction) => {
                this.router(request, response, next);
            });

            this.serverInstance = this.listener.listen(0, () => {
                process.title = this.serverInstanceTitle;
                this.setBaseUrl();
                console.log(`Bogus JSON Server is running :: ${this.baseUrl}`);
                resolve();
            });
        });
    }

    private setBaseUrl() {
        this.baseUrl = `http://localhost:${this.serverInstance.address().port}`;
    }

    public async stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.serverInstance.close();

            const cmd = "pkill";
            const params = ["-SIGINT", this.serverInstanceTitle];

            const s = spawn(cmd, params, { stdio: "inherit" });
            s.on("close", (code) => {
                console.log(`Bogus JSON Server is down :: ${this.baseUrl}`);
                resolve();
            });
            s.on("error", (error) => {
                console.log(`Bogus JSON Server is down with error :: ${this.baseUrl}`);
                reject();
            });
        });
    }

    public setRouter(router: Router): void {
        if (router == null) { throw new Error("No router provided"); }
        this.router = router;
    }
}
