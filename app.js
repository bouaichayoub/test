if (process.env.APP_DEV_ENV) {
   require("dotenv").config();
}
const bodyParser = require('body-parser')
const axios = require('axios').default;
const express = require('express');
const path = require('path');
const app = express();
var session = require('express-session')
const filestore = require("session-file-store")(session)
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static('public'));

const webviewRouter = require('./routes/webview.routes');
const indexRouter = require('./routes/index.routes');

app.use('/', indexRouter);
app.use('/', urlencodedParser, webviewRouter);

// Session
app.use(session({
   name: "session-id",
   secret: "GFGEnter", // Secret key,
   saveUninitialized: false,
   resave: false,
   store: new filestore()
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/utils", express.static(path.join(__dirname, 'utils')));

app.get('/test', (req, res) => {
   res.status(200).send({"text": "OK"});
})

var server = app.listen(process.env.PORT, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})