import { assert } from "chai";
import { CoreOptions, post, RequestCallback } from "request";

import { ApiServer, NextFunction, Request, Response, Router } from "./api";

describe("Hello you wip", () => {
    before(async () => {
        this.apiServer = new ApiServer();
        await this.apiServer.start();
    });

    after(async () => {
        await this.apiServer.stop();
    });

    it("succeeds -> should use correct auth headers", async () => {
        const url = "/heloo";
        const absoluteUrl = `${this.apiServer.baseUrl}${url}`;
        const username = "Batman";
        const password = "Superman stinks";
        const authType = "Basic";
        const authHeader = `${authType} ${Buffer.from(`${username}:${password}`).toString("base64")}`;

        const customRouter = Router()
            .post(url, (request: Request, response: Response, next: NextFunction) => {
                const expectedAuthHeader = authHeader;
                const actualAuthHeader = request.headers.authorization;

                if (expectedAuthHeader === actualAuthHeader) {
                    response.json({ hello: "me" });
                }
                next();
            });

        this.apiServer.swapRouter(customRouter);

        // Client

        const callPost = new Promise<any>((resolve, reject) => {
            const options: CoreOptions = {
                auth: {
                    password,
                    sendImmediately: true,
                    username,
                },
                json: {},
            };

            post(absoluteUrl, options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                } else {
                    const msg = `Status Code: ${response.statusCode}, message: ${response.body}, error: ${error}`;
                    reject(msg);
                }
            });
        });

        const result = await callPost;

        assert.deepEqual(result, { hello: "me" });
    });
});
