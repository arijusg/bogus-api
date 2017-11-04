import { NextFunction, Request, Response, Router } from "express";
import { BogusApiServer } from "./api";

export class RouteBuilder {
    private url: string = "";
    private responseBody: object;
    private responseStatusCode: number;
    private requestBody: object;
    private requestedHeaders: Array<{ key: string, value: string }> = [];

    public withHeader(header: { key: string, value: string }) {
        this.requestedHeaders.push(header);
        return this;
    }

    public withUrl(url: string) {
        this.url = url;
        return this;
    }

    public withRequestBody(body: object) {
        this.requestBody = body;
        return this;
    }

    public withResponseBody(body: object) {
        this.responseBody = body;
        return this;
    }

    public withResponseStatusCode(statusCocde: number) {
        this.responseStatusCode = statusCocde;
        return this;
    }

    public post(): Router {
        return Router()
            .post(this.url, this.routerInternals);
    }

    public get(): Router {
        if (!this.url) {
            throw new Error("Get cannot be on the root, need to give an url ;)");
        }
        return Router()
            .get(this.url, this.routerInternals);
    }

    public put(): Router {
        return Router()
            .put(this.url, this.routerInternals);
    }

    private isResponseSent = false;

    private routerInternals = (request: Request, response: Response, next: NextFunction) => {
        this.processHeaders(request, response);
        this.processBody(request, response);
        this.setResponseStatusCode(response);
        this.processResponseBody(response);
        this.processDefaultResponse(request, response);
    }

    private processHeaders(request: Request, response: Response): void {
        if (!this.isResponseSent && this.requestedHeaders.length > 0) {
            this.requestedHeaders.forEach((requestedHeader) => {

                const actualHeaderValue = request.headers[requestedHeader.key];
                if (actualHeaderValue !== requestedHeader.value) {
                    const msg = "Requested header was not found";
                    console.error(msg);
                    console.log(`Expected: ${actualHeaderValue}`);
                    console.log(`Actual:   ${requestedHeader.value}`);
                    console.log(`Match:   ${actualHeaderValue === requestedHeader.value}`);
                    response.statusMessage = msg;

                    this.responseSendError(response, 500);
                }
            });
        }
    }

    private processBody(request: Request, response: Response) {
        const expectedBody = this.requestBody ? JSON.stringify(request.body) : "";
        const actualBody = JSON.stringify(this.requestBody);

        if (!this.isResponseSent && this.requestBody && expectedBody !== actualBody) {
            const msg = "Requested body did not match";
            console.error(msg);
            console.log(`Expected: ${expectedBody}`);
            console.log(`Actual:   ${actualBody}`);
            console.log(`Match:   ${expectedBody === actualBody}`);

            response.statusMessage = msg;
            this.responseSendError(response, 500);
        }
    }

    private setResponseStatusCode(response: Response) {
        if (this.responseStatusCode) {
            response.statusCode = this.responseStatusCode;
        }
    }

    private processResponseBody(response: Response) {
        if (!this.isResponseSent && this.responseBody) {
            this.responseJson(response, this.responseBody);
        }
    }

    private processDefaultResponse(request: Request, response: Response) {
        if (!this.isResponseSent && !this.responseBody) {
            this.responseJson(response, request.body);
        }
    }

    private responseSendError(response: Response, body?: any) {
        response.send(body);
        this.isResponseSent = true;
    }

    private responseJson(response: Response, body: any) {
        response.json(body);
        this.isResponseSent = true;
    }
}
