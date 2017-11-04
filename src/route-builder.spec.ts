import { assert } from "chai";

import { RouteBuilder } from "./route-builder";

import { CoreOptions, post, RequestCallback, RequestResponse } from "request";
import { ApiServer } from "./api";

describe("Router Builder", () => {

    const apiServer = new ApiServer();

    before(async () => {
        await apiServer.start();
    });

    after(async () => {
        await apiServer.stop();
    });

    this.callPost = (url: string, body, headers: { [name: string]: string }) => {
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

    it("returns request body as default", async () => {
        apiServer.setRouter(
            new RouteBuilder()
                .post(),
        );

        const defaultBody = { bogus: "api" };
        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${apiServer.url}`;
        const result = await callPost(absoluteUrl, defaultBody) as RequestResponse;
        assert.deepEqual(result.body, defaultBody);
    });

    it("returns custom body", async () => {
        const body = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withResponseBody(body)
                .post(),
        );

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${apiServer.url}`;

        const result = await callPost(absoluteUrl, {}) as RequestResponse;

        assert.deepEqual(result.body, body);
    });

    it("returns fail on responseBody on expected requestBody mismatch", async () => {
        const requestBody = { request: "body" };
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withRequestBody(requestBody)
                .withResponseBody(responseBody)
                .post(),
        );

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${apiServer.url}`;

        const result = await callPost(absoluteUrl, { different: "requestBody" }) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Requested body did not match");
    });

    it("returns ok on responseBody on expected requestBody", async () => {
        const requestBody = { request: "body" };
        const responseBody = { custom: "api" };

        apiServer.setRouter(
            new RouteBuilder()
                .withRequestBody(requestBody)
                .withResponseBody(responseBody)
                .post(),
        );

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${apiServer.url}`;

        const result = await callPost(absoluteUrl, requestBody) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

    it("returns fail on url mismatch", async () => {
        const responseBody = { message: "world" };

        apiServer.setRouter(
            new RouteBuilder()
                .withResponseBody(responseBody)
                .post(),
        );

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${apiServer.url}/badUrl`;

        const result = await callPost(absoluteUrl, { different: "requestBody" }) as RequestResponse;

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

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${apiServer.url}${url}`;

        const result = await callPost(absoluteUrl, {}) as RequestResponse;

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

        const absoluteUrl = `${apiServer.url}`;
        const callPost = this.callPost as (url: string, body) => Promise<RequestResponse>;
        const result = await callPost(absoluteUrl, {}) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Requested header was not found");
    });

    it("should match headers wip", async () => {
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

        const callPost = this.callPost as (url: string, body, headers) => Promise<any>;
        const absoluteUrl = `${apiServer.url}${url}`;

        const result = await callPost(absoluteUrl, {}, { h1: "val1", h2: "val2" }) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

});
