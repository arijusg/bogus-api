import { ApiServer, NextFunction, Request, Response, Router } from "./api";

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

    public post(): any {

        const customRouter = Router()
            .post(this.url, (request: Request, response: Response, next: NextFunction) => {
                const expectedBody = this.requestBody ? JSON.stringify(request.body) : "";
                const actualBody = JSON.stringify(this.requestBody);

                let isResponseSent = false;

                if (!isResponseSent && this.requestedHeaders.length > 0) {
                    this.requestedHeaders.forEach((requestedHeader) => {

                        const actualHeaderValue = request.headers[requestedHeader.key];
                        if (actualHeaderValue !== requestedHeader.value) {
                            const msg = "Requested header was not found";
                            console.error(msg);
                            console.log(`Expected: ${actualHeaderValue}`);
                            console.log(`Actual:   ${requestedHeader.value}`);
                            console.log(`Match:   ${actualHeaderValue === requestedHeader.value}`);
                            response.statusMessage = msg;

                            isResponseSent = true;
                            response.send(404);
                        }

                    });
                }
                if (!isResponseSent && this.requestBody && expectedBody !== actualBody) {
                    const msg = "Requested body did not match";
                    console.error(msg);
                    console.log(`Expected: ${expectedBody}`);
                    console.log(`Actual:   ${actualBody}`);
                    console.log(`Match:   ${expectedBody === actualBody}`);

                    response.statusMessage = msg;
                    isResponseSent = true;

                    response.send(404);
                }

                if (!isResponseSent && !this.responseBody) {
                    isResponseSent = true;

                    response.json(request.body);
                } else if (!isResponseSent) {
                    isResponseSent = true;
                    response.json(this.responseBody);
                    next();
                }
            });
        return customRouter;
    }
}
