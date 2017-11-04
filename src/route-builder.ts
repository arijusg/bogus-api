import { ApiServer } from "./api";
import { NextFunction, Request, Response, Router } from 'express';

export class RouteBuilder {
    private url: string = "";
    private responseBody: object;
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

    private isResponseSent = false;

    private responseSend(response: Response, body?: any) {
        if (this.isResponseSent) { return; }
        response.send(404);
        this.isResponseSent = true;
    }

    private responseJson(response: Response, body: any) {
        if (this.isResponseSent) { return; }
        response.json(body);
        this.isResponseSent = true;
    }

    public post(): Router {
        return Router()
            .post(this.url, (request: Request, response: Response, next: NextFunction) => {
                const expectedBody = this.requestBody ? JSON.stringify(request.body) : "";
                const actualBody = JSON.stringify(this.requestBody);

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

                            this.responseSend(response, 404);
                        }
                    });
                }

                if (!this.isResponseSent && this.requestBody && expectedBody !== actualBody) {
                    const msg = "Requested body did not match";
                    console.error(msg);
                    console.log(`Expected: ${expectedBody}`);
                    console.log(`Actual:   ${actualBody}`);
                    console.log(`Match:   ${expectedBody === actualBody}`);

                    response.statusMessage = msg;
                    this.responseSend(response, 404);
                }

                if (!this.isResponseSent && !this.responseBody) {
                    this.responseJson(response, request.body);
                }

                if (!this.isResponseSent) {
                    this.responseJson(response, this.responseBody);
                }
            });
    }
}
