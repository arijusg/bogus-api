import { assert } from "chai";

import { Hello } from "./hello";

describe("Hello you", () => {
    it("should return a message with name", () => {
        const hello = new Hello();
        const result = hello.you();

        assert.equal(result, "Hello, Super Awesome Batman");
    });
});
