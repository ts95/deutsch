var express = require('express');

var words = require('../words.json');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/words.json', function(req, res) {
	res.json(words);
});

module.exports = router;