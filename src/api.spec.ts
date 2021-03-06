import { assert } from "chai";
import { CoreOptions, post, RequestResponse } from "request";

import { BogusApiServer, RouteBuilder } from "./api";

describe("Api Server", () => {
    const apiServer = new BogusApiServer();

    before(async () => {
        await apiServer.start();
    });

    after(async () => {
        await apiServer.stop();
    });

    it("should match route url and header", async () => {
        const url = "/heloo";
        const absoluteUrl = `${apiServer.url}${url}`;
        const username = "Batman";
        // tslint:disable-next-line:no-hardcoded-credentials
        const password = "Superman stinks";
        const authType = "Basic";
        // tslint:disable-next-line:no-nested-template-literals
        const authHeader = `${authType} ${Buffer.from(`${username}:${password}`).toString("base64")}`;

        apiServer.setRouter(
            new RouteBuilder()
                .withUrl(url)
                .withHeader({ key: "authorization", value: authHeader })
                .withResponseBody({ hello: "me" })
                .post(),
        );

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

        const result = await callPost;

        assert.deepEqual(result.body, { hello: "me" });
    });

    it("should throw if router not provided", () => {
        assert.throws(() => {
            apiServer.setRouter(null as any);
        }, "No router provided");
    });
});
