import { assert } from "chai";

import { RouteBuilder } from "./route-builder";

import { CoreOptions, get, post, put, RequestCallback, RequestResponse } from "request";
import { BogusApiServer } from "./api";

describe("Router Builder", () => {

    const apiServer = new BogusApiServer();

    before(async () => {
        await apiServer.start();
    });

    after(async () => {
        await apiServer.stop();
    });

    const callPost = (url: string, body, headers?: { [name: string]: string }) => {
        return new Promise<RequestResponse>((resolve, reject) => {
            const options: CoreOptions = {
                headers,
                json: body,
            };

            post(url, options, (error, response) => {
                resolve(response);
            });
        });
    };

    const callPut = (url: string, body, headers?: { [name: string]: string }) => {
        return new Promise<RequestResponse>((resolve, reject) => {
            const options: CoreOptions = {
                headers,
                json: body,
            };

            put(url, options, (error, response) => {
                resolve(response);
            });
        });
    };

    const callGet = (url: string, headers?: { [name: string]: string }) => {
        return new Promise<RequestResponse>((resolve, reject) => {
            const options: CoreOptions = {
                headers,
                json: {},
            };

            get(url, options, (error, response, body) => {
                resolve(response);
            });
        });
    };

    it("should return request body as response body by default", async () => {
        apiServer.setRouter(
            new RouteBuilder()
                .post(),
        );

        const defaultBody = { bogus: "api" };
        const result = await callPost(apiServer.url, defaultBody) as RequestResponse;
        assert.deepEqual(result.body, defaultBody);
    });

    it("should return specified response body", async () => {
        const body = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withResponseBody(body)
                .post(),
        );

        const result = await callPost(apiServer.url, {}) as RequestResponse;

        assert.deepEqual(result.body, body);
    });

    it("should return specified response body for get", async function() {
        this.timeout(30000);

        const body = { custom: "api" };
        const url = "/haha";
        apiServer.setRouter(
            new RouteBuilder()
                .withUrl(url)
                .withResponseBody(body)
                .get(),
        );

        const result = await callGet(`${apiServer.url}${url}`) as RequestResponse;

        assert.deepEqual(result.body, body);
    });

    it("should return specified response body for put", async () => {
        const body = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withResponseBody(body)
                .put(),
        );

        const result = await callPut(apiServer.url, {}) as RequestResponse;

        assert.deepEqual(result.body, body);
    });

    it("should return specified response status code", async () => {
        const responseStatusCode = 204;
        apiServer.setRouter(
            new RouteBuilder()
                .withResponseStatusCode(responseStatusCode)
                .post(),
        );

        const result = await callPost(apiServer.url, {}) as RequestResponse;

        assert.equal(result.statusCode, responseStatusCode);
    });

    it("should fail on missing body", async () => {
        const requestBody = { request: "body" };
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withRequestBody(requestBody)
                .withResponseBody(responseBody)
                .post(),
        );

        const result = await callPost(apiServer.url, { different: "requestBody" }) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Requested body did not match");
    });

    it("should match request body", async () => {
        const requestBody = { request: "body" };
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withRequestBody(requestBody)
                .withResponseBody(responseBody)
                .post(),
        );

        const result = await callPost(apiServer.url, requestBody) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

    it("returns fail on missing url", async () => {
        const responseBody = { message: "world" };

        apiServer.setRouter(
            new RouteBuilder()
                .withResponseBody(responseBody)
                .post(),
        );

        const result = await callPost(`${apiServer.url}/badUrl`, { different: "requestBody" }) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Not Found");
    });

    it("should match url", async () => {
        const url = "/hello";
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withUrl(url)
                .withResponseBody(responseBody)
                .post(),
        );

        const result = await callPost(`${apiServer.url}${url}`, {}) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

    it("should fail on missing header", async () => {
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withHeader({ key: "header", value: "headerValue" })
                .withResponseBody(responseBody)
                .post(),
        );

        const result = await callPost(apiServer.url, {}) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Requested header was not found");
    });

    it("should match headers", async () => {
        const url = "/hello";
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withUrl(url)
                .withHeader({ key: "h1", value: "val1" })
                .withHeader({ key: "h2", value: "val2" })
                .withResponseBody(responseBody)
                .post(),
        );

        const result = await callPost(`${apiServer.url}${url}`, {}, { h1: "val1", h2: "val2" }) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

});
