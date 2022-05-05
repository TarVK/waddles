"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let data;
// process.env.NODE_ENV is a variable passed by either webpack, or the server startup process
// See webpack.config.js and jest.config.js (defaults to test)
if (process.env.NODE_ENV === "production") {
    data = {
        // TODO: read url from environment variables, put port in webpack build
        domain: {
            socket: {
                address: "https://waddles.herokuapp.com",
                port: process.env.PORT || "",
            },
            resources: {
                address: "https://waddles.herokuapp.com",
                port: process.env.PORT || "",
            },
        },
        dev: false,
    };
}
else {
    data = {
        domain: {
            socket: {
                address: "http://localhost",
                port: "4000",
            },
            resources: {
                address: "http://localhost",
                port: "3000",
            },
        },
        dev: true,
    };
}
exports.domain = data.domain;
exports.dev = data.dev;
//# sourceMappingURL=config.js.map