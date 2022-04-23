var express = require('express');
const { postLogin } = require('../controllers/login.controller');
var router = express.Router();
const validationRule= require('../middlewares/validation-rule');
var loginController = require('../controllers/login.controller');


router.get('/webview/login', loginController.viewLogin);

router.get('/authorization-code/callback', loginController.callback);

router.post('/send', loginController.send);

module.exports = router;