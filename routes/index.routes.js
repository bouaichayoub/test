var express = require('express');
var router = express.Router();
var homeController = require('../controllers/home.controller');

router.get('/', homeController.index);

module.exports = router;