if (process.env.APP_DEV_ENV) {
   require("dotenv").config();
}
const bodyParser = require('body-parser')
const express = require('express');
const path = require('path');
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static('public'));

const webviewRouter = require('./routes/webview.routes');
const indexRouter = require('./routes/index.routes');

app.use('/', indexRouter);
app.use('/', urlencodedParser, webviewRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/utils", express.static(path.join(__dirname, 'utils')));

app.post('/test', (req, res) => {
   res.render('index', { title: 'Proxy App' });
})

var server = app.listen(3978, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})