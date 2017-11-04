# Bogus Api 
[![Build Status](https://travis-ci.org/arijusg/bogus-api.svg?branch=master)](https://travis-ci.org/arijusg/bogus-api) 
[![Quality Gate on SonarCloud](https://sonarcloud.io/api/badges/gate?key=bogus-api)](https://sonarcloud.io/dashboard/index/bogus-api) 
[![Coverage](https://sonarcloud.io/api/badges/measure?key=bogus-api&metric=coverage)](https://sonarcloud.io/component_measures/domain/Coverage?id=bogus-api) 
[![npm version](https://badge.fury.io/js/%40arijusg%2Fbogus-api.svg)](https://badge.fury.io/js/%40arijusg%2Fbogus-api)

Api mocking framework for tests

Setup spec:
```
import { BogusApiServer, RouteBuilder } from '@arijusg/bogus-api';

const bogus = new BogusApiServer();

before(async () => {
    await bogus.start();
});

after(async () => {
    await bogus.stop();
});
```

Set a new route:
```
bogus.setRouter(
    new RouteBuilder()
        .withUrl('/my-super-url')
        .withHeader({ key: "authorization", value: authHeader })
        .withResponseBody({ hello: "me" })
        .post(),
);
```

Base url:
```
bogus.url
```

Full example:
```
import { assert } from "chai";
import { CoreOptions, post, RequestCallback, RequestResponse } from "request";
import { BogusApiServer, RouteBuilder } from "bogus-api";

describe("My Awesome project", () => {

    const bogus = new BogusApiServer();

    before(async () => {
        await bogus.start();
    });

    after(async () => {
        await bogus.stop();
    });

    it("should match route url and header", async () => {
        const url = "/heloo";
        const absoluteUrl = `${bogus.url}${url}`;
        const username = "Batman";
        const password = "Superman stinks";
        const authType = "Basic";
        const authHeader = `${authType} ${Buffer.from(`${username}:${password}`).toString("base64")}`;

        // Bogus Api
        bogus.setRouter(
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