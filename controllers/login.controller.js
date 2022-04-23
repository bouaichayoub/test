const { validationResult } = require('express-validator');
const axios = require('axios');

var OktaAuth = require('@okta/okta-auth-js').OktaAuth;

const viewLogin = (req, res) => {
    res.render('login', { title: 'Webview Login CX', session: req.query.s, siteKey: process.env.SITE_KEY_RECAPTCHA, clientId: process.env.OKTA_CLIENT_ID, redirectUri: process.env.OKTA_REDIRECT_URI, issuer: process.env.OKTA_AUTH_SERVER,clientId2:process.env.OKTA_CLIENT_ID_APIGEE,issuer2: process.env.OKTA_AUTH_SERVER_APIGEE });
}

const okta = async (req, res) => {

  const authClient = new OktaAuth({
    clientId: process.env.OKTA_CLIENT_ID,
    redirectUri: process.env.OKTA_REDIRECT_URI,
    issuer: process.env.OKTA_AUTH_SERVER,
    responseType: 'code',
    pkce: true
  });

  const authClient2 = new OktaAuth({
    clientId: process.env.OKTA_CLIENT_ID_APIGEE,
    redirectUri: process.env.OKTA_REDIRECT_URI,
    issuer: process.env.OKTA_AUTH_SERVER_APIGEE,
    authorizeUrl: process.env.OKTA_AUTH_SERVER_APIGEE + "/oauth/v1/authorize",
    responseType: 'code',
    pkce: false,
    tokenManager: {
      storage: 'cookie'
    }
  });
  const username = req.body.username;
  authClient.signInWithCredentials({username: username, password: req.body.password})
  .then((transaction) => {
    if (transaction.status === 'SUCCESS'){
      console.log(transaction.status)
      return authClient2.token.getWithoutPrompt({
        responseType: ['id_token', 'token'],
        sessionToken: transaction.sessionToken,
      });
    }
  })

  res.status(200).send("OKTA");
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
    console.log(response.data)
    res.send('test');
  })
  .catch(error => {
    console.log(error)
    res.sendStatus(401)
  });
}

module.exports = {
  viewLogin,
  okta,
  callback
}