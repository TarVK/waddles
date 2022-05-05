"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const App_1 = require("./App");
console.log("Starting");
const app = express_1.default();
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
app.get("/ping", (req, resp) => {
    resp.json({ type: "pong", timestamp: Date.now() });
});
if (config_1.domain.resources.port == config_1.domain.socket.port) {
    const server = http_1.default.createServer(app);
    App_1.startApplication(server);
    server.listen(config_1.domain.resources.port, () => console.log(`Example app listening on port ${config_1.domain.resources.port}!`));
}
else {
    App_1.startApplication();
    // Use webpack dev server during development
    if (process.env.NODE_ENV === "production")
        app.listen(config_1.domain.resources.port, () => console.log(`Example app listening on port ${config_1.domain.resources.port}!`));
}
//# sourceMappingURL=index.js.map