import { assert } from "chai";
import { CoreOptions, post, RequestCallback, RequestResponse } from "request";

import { ApiServer, NextFunction, Request, Response, Router } from "./api";

describe("Hello you", () => {
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

        const callPost = new Promise<RequestResponse>((resolve, reject) => {
            const options: CoreOptions = {
                auth: {
                    password,
                    sendImmediately: true,
                    username,
                },
                json: {},
            };

            post(absoluteUrl, options, (error, response, body) => {
                resolve(response);
            });
        });

        const result = await callPost as RequestResponse;

        assert.deepEqual(result.body, { hello: "me" });
    });
});
