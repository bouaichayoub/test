var session = require('express-session')
const axios = require('axios');

const viewLogin = (req, res) => {
    res.render('login', { title: 'Webview Login CX', session: req.query.s, siteKey: process.env.SITE_KEY_RECAPTCHA, clientId: process.env.OKTA_CLIENT_ID, redirectUri: process.env.OKTA_REDIRECT_URI, issuer: process.env.OKTA_AUTH_SERVER,clientId2:process.env.OKTA_CLIENT_ID_APIGEE,issuer2: process.env.OKTA_AUTH_SERVER_APIGEE });
}

const callback = async (req, res) => {
  const headers = {
    accept: "application/json",
  },
  paramsString = `grant_type=authorization_code&redirect_uri=${process.env.OKTA_REDIRECT_URI}&code=${req.query.code}`;
  axios({
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
    req.session.token_type = response.data.token_type;
    console.log(response)
  })
  .catch(error => {
    console.log(error.response.data)
    res.sendStatus(error.response.status)
  });
}

const send = async (req, res) => {
  const session = req.body.session;
  const webview_name = "Webview Login";
  const data  = {
    session: session,
    parameters: {
      webview_name : webview_name,
      access_token : req.session.token_type,
      refreshToken : "sessionExpress.tokens.refreshToken"
    }
  };

  const result = {
    success: true,
    message: "Success"
  };
  console.log(data);
  res.status(200).json(data);

}

module.exports = {
  viewLogin,
  callback,
  send
}