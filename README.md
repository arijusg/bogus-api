# Bogus Api
Mock api for tests

Setup spec:
```
const apiServer = new ApiServer();

before(async () => {
    await apiServer.start();
});

after(async () => {
    await apiServer.stop();
});
```

Set a new route:
```
apiServer.setRouter(
    new RouteBuilder()
        .withUrl('/my-super-url')
        .withHeader({ key: "authorization", value: authHeader })
        .withResponseBody({ hello: "me" })
        .post(),
);
```

Base url:
```
apiServer.url
```

Full example:
```
import { assert } from "chai";
import { CoreOptions, post, RequestCallback, RequestResponse } from "request";
import { ApiServer, RouteBuilder } from "bogus-api";

describe("My Awesome project", () => {

    const apiServer = new ApiServer();

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
        const password = "Superman stinks";
        const authType = "Basic";
        const authHeader = `${authType} ${Buffer.from(`${username}:${password}`).toString("base64")}`;

        // Bogus Api
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

        const result = await callPost as RequestResponse;

        assert.deepEqual(result.body, { hello: "me" });
    });
});

```