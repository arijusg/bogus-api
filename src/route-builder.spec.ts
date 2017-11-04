import { assert } from "chai";

import { RouteBuilder } from "./route-builder";

import { CoreOptions, post, RequestCallback, RequestResponse } from "request";
import { ApiServer, NextFunction, Request, Response, Router } from "./api";

// apiServer.buildRouter()
// .withHeadaer(key, value)
// .withHeader(key, value)
// .withBody(body),
// .withUrl(url)
// .withPost() //Last one so canno be chained

describe("Router Builder", () => {
    before(async () => {
        this.apiServer = new ApiServer();
        await this.apiServer.start();
    });

    after(async () => {
        await this.apiServer.stop();
    });

    this.callPost = (url: string, body, headers: {[name: string]: string}) => {
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
        const builder = new RouteBuilder();
        const route = builder.post();
        this.apiServer.swapRouter(route);

        const defaultBody = { bogus: "api" };
        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}`;
        const result = await callPost(absoluteUrl, defaultBody) as RequestResponse;
        assert.deepEqual(result.body, defaultBody);
    });

    it("returns custom body", async () => {
        const body = { custom: "api" };

        const builder = new RouteBuilder();
        const route = builder.withResponseBody(body).post();
        this.apiServer.swapRouter(route);

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}`;

        const result = await callPost(absoluteUrl, {}) as RequestResponse;

        assert.deepEqual(result.body, body);
    });

    it("returns fail on responseBody on expected requestBody mismatch", async () => {
        const requestBody = { request: "body" };
        const body = { custom: "api" };

        const builder = new RouteBuilder();
        const route = builder
            .withRequestBody(requestBody)
            .withResponseBody(body)
            .post();
        this.apiServer.swapRouter(route);

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}`;

        const result = await callPost(absoluteUrl, { different: "requestBody" }) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Requested body did not match");
    });

    it("returns ok on responseBody on expected requestBody", async () => {
        const requestBody = { request: "body" };
        const responseBody = { custom: "api" };

        const builder = new RouteBuilder();
        const route = builder
            .withRequestBody(requestBody)
            .withResponseBody(responseBody)
            .post();
        this.apiServer.swapRouter(route);

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}`;

        const result = await callPost(absoluteUrl, requestBody) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

    it("returns fail on url mismatch", async () => {
        const responseBody = { message: "world" };
        const builder = new RouteBuilder();
        const route = builder
            .withResponseBody(responseBody)
            .post();
        this.apiServer.swapRouter(route);

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}/badUrl`;

        const result = await callPost(absoluteUrl, { different: "requestBody" }) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Not Found");
    });

    it("should match url", async () => {
        const url = "/hello";
        const responseBody = { custom: "api" };

        const builder = new RouteBuilder();
        const route = builder
            .withUrl(url)
            .withResponseBody(responseBody)
            .post();
        this.apiServer.swapRouter(route);

        const callPost = this.callPost as (url: string, body) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}${url}`;

        const result = await callPost(absoluteUrl, {}) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

    it("should fail on missing header", async () => {
        const responseBody = { custom: "api" };

        const builder = new RouteBuilder();
        const route = builder
            .withHeader({ key: "header", value: "headerValue" })
            .withResponseBody(responseBody)
            .post();
        this.apiServer.swapRouter(route);

        const absoluteUrl = `${this.apiServer.baseUrl}`;
        const callPost = this.callPost as (url: string, body) => Promise<RequestResponse>;
        const result = await callPost(absoluteUrl, {}) as RequestResponse;

        assert.equal(result.statusCode, 404);
        assert.equal(result.statusMessage, "Requested header was not found");
    });

    it("should match headers wip", async () => {
        const url = "/hello";
        const responseBody = { custom: "api" };

        const builder = new RouteBuilder();
        const route = builder
            .withUrl(url)
            .withHeader({key: "h1", value: "val1"})
            .withHeader({key: "h2", value: "val2"})
            .withResponseBody(responseBody)
            .post();
        this.apiServer.swapRouter(route);

        const callPost = this.callPost as (url: string, body, headers) => Promise<any>;
        const absoluteUrl = `${this.apiServer.baseUrl}${url}`;

        const result = await callPost(absoluteUrl, {}, {h1: "val1", h2: "val2"}) as RequestResponse;

        assert.equal(result.statusCode, 200);
        assert.deepEqual(result.body, responseBody);
    });

});
