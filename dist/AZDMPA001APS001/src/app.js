"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const login_routes_1 = __importDefault(require("./routes/login.routes"));
const index_routes_1 = __importDefault(require("./routes/index.routes"));
if (process.env.APP_DEV_ENV) {
    dotenv_1.default.config();
}
const app = (0, express_1.default)();
const port = 3978;
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Session
app.use((0, express_session_1.default)({
    secret: "KeyBotSecret",
    saveUninitialized: false,
    resave: false
}));
app.use(login_routes_1.default);
app.use(index_routes_1.default);
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "public")));
app.listen(process.env.port || process.env.PORT || port, () => {
    console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map