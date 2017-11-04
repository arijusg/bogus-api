import { ApiServer, NextFunction, Request, Response, Router } from "./api";

export class RouteBuilder {
    private url: string = "";
    private responseBody: object;
    private requestBody: object;

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

                if (!this.responseBody) {
                    response.json(request.body);
                } else if (this.requestBody && expectedBody !== actualBody) {
                    const msg = "Requested body did not match";
                    console.error(msg);
                    console.log(`Expected: ${expectedBody}`);
                    console.log(`Actual:   ${actualBody}`);
                    console.log(`Match:   ${expectedBody === actualBody}`);

                    response.statusMessage = msg;
                    response.send(404);
                } else {
                    response.json(this.responseBody);
                    next();
                }
            });
        return customRouter;
    }
}
