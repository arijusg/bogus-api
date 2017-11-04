export { RouteBuilder } from "./route-builder";

import { spawn } from "child_process";
import * as jsonServer from "json-server";
import { Express, NextFunction, Request, Response, Router } from "express";

import { RouteBuilder } from "./route-builder";

export class ApiServer {

    public get url(): string { return this.baseUrl; }
    private baseUrl: string;
    private listener: Express;
    private router: Router = Router();
    private middlewares: any;
    private serverInstance: any;
    private serverInstanceTitle: string;

    constructor(private port?: number) {
        this.serverInstanceTitle = this.generateRandomString();
        this.resetStupidAegonBambooBreakingStuff();
    }

    private generateRandomString(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private resetStupidAegonBambooBreakingStuff() {
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

            const p = this.port === undefined ? 0 : this.port;

            this.serverInstance = this.listener.listen(p, () => {
                process.title = this.serverInstanceTitle;
                this.setBaseUrl();
                console.log(`JSON Server is running :: ${this.baseUrl}`);
                resolve();
            });
        });
    }

    private setBaseUrl() {
        this.baseUrl = `http://localhost:${this.serverInstance.address().port}`;
    }

    public async stop(): Promise<void> {

        this.serverInstance.close();

        const cmd = "pkill";
        const params = ["-SIGINT", this.serverInstanceTitle];

        const s = spawn(cmd, params, { stdio: "inherit" });
        s.on("close", (code) => {
            console.log(`JSON Server is down :: ${this.baseUrl}`);
            return Promise.resolve();
        });
    }

    public setRouter(router: Router): void {
        if (router === undefined) { throw new Error("No router provided"); }
        this.router = router;
    }
}
