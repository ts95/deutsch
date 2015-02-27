var fs = require('fs');
var path = require('path');
var express = require('express');
var chokidar = require('chokidar');

var router = express.Router();

var wordsFile = path.join(__dirname, '../words.json');
var words = JSON.parse(fs.readFileSync(wordsFile, 'utf8'));


chokidar.watch(wordsFile).on('change', function() {
	fs.readFile(wordsFile, 'utf8', function(err, data) {
		if (err) return console.log(err);
		words = JSON.parse(data);
		console.log('words.json has been updated');
	});
});

router.get('/', function(req, res) {
	res.render('index', {
		scripts: ['index.js']
	});
});

router.get('/words.json', function(req, res) {
	res.json(words);
});

module.exports = router;