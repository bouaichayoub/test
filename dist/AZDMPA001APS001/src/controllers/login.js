"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.callback = exports.loginView = void 0;
const axios_1 = __importDefault(require("axios"));
let loginView = (req, res) => {
    res.render("login", {
        title: "Webview Login CX",
        session: req.query.s,
        siteKey: process.env.SITE_KEY_RECAPTCHA,
        clientId: process.env.OKTA_CLIENT_ID,
        redirectUri: process.env.OKTA_REDIRECT_URI,
        issuer: process.env.OKTA_AUTH_SERVER,
        clientId2: process.env.OKTA_CLIENT_ID_APIGEE,
        issuer2: process.env.OKTA_AUTH_SERVER_APIGEE
    });
};
exports.loginView = loginView;
let callback = (req, res) => {
    const headers = {
        accept: "application/json",
    }, paramsString = `grant_type=authorization_code&redirect_uri=${process.env.OKTA_REDIRECT_URI}&code=${req.query.code}`;
    (0, axios_1.default)({
        url: `${process.env.OKTA_AUTH_SERVER_APIGEE}/oauth/v1/token`,
        method: "POST",
        headers,
        auth: {
            username: process.env.OKTA_CLIENT_ID_APIGEE,
            password: process.env.OKTA_CLIENT_SECRET_APIGEE,
        },
        data: paramsString,
    })
        .then(response => {
        req.session.access_token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        res.sendStatus(response.status);
    }).catch(error => {
        console.log(error.response.data);
        res.sendStatus(error.response.status);
    });
};
exports.callback = callback;
let send = (req, res) => {
    const session = req.body.session;
    const webview_name = "Webview Login";
    const data = {
        session: session,
        parameters: {
            webview_name: webview_name,
            access_token: req.session.access_token,
            refresh_token: req.session.refresh_token
        }
    };
    // call webhook RingCentral and show result Here [TODO]
    const headers = {
        accept: "application/json",
    };
    (0, axios_1.default)({
        url: `${process.env.WEBHOOK_RING_CENTRAL}`,
        method: "POST",
        headers,
        data: data,
    })
        .then(response => {
        res.status(response.status).json(response.statusText);
    }).catch(error => {
        res.status(error.status).json(error.statusText);
    });
    const result = {
        success: true,
        message: "Success"
    };
    // res.status(200).json(data);
};
exports.send = send;
//# sourceMappingURL=login.js.map