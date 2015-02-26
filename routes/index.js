var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('index', {
		scripts: ['index.js']
	});
});

router.get('/words.json', function(req, res) {
	res.json(require('../words.json'));
});

module.exports = router;