var fs = require('fs');
var path = require('path');

function ask(question, format, callback) {
	var stdin = process.stdin;
	var stdout = process.stdout;

	stdin.resume();
	stdout.write(question + ": ");
 
	stdin.once('data', function(data) {
		data = data.toString().trim();
	 
		if (format.test(data)) {
			callback(data);
		} else {
			stdout.write("It should match: "+ format +"\n");
			ask(question, format, callback);
		}
	});
}

console.log('Word generator');

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1, this.length);
};

function writeNewWordToFile(word, cb) {
	fs.readFile(path.join(__dirname, 'words.json'), 'utf8', function(err, data) {
		if (err) throw err;

		var words = JSON.parse(data);
		words.push(word);

		fs.writeFile(path.join(__dirname, 'words.json'), JSON.stringify(words), function(err) {
			if (err) throw err;

			cb();
		});
	});
}

ask('name', /.+/, function(name) {
	ask('translations (separated by comma)', /.+/, function(translations) {
		ask('type.name', /.+/, function(typeName) {
			if (typeName.toLowerCase() === 'noun') {
				ask('type.gender', /.+/, function(typeGender) {
					var word = {};
					word.name = name.capitalize(); // automatically capitalize nouns
					word.translations = translations.split(',').map(function(translation) {
						return translation.trim();
					});
					word.type = {};
					word.type.name = typeName.capitalize();
					word.type.gender = typeGender.charAt(0).toLowerCase();
					word.wiktionaryURL = 'http://de.wiktionary.org/wiki/' + word.name;

					console.log(word);
					
					writeNewWordToFile(word, function() {
						process.exit();
					});
				});
			} else {
				var word = {};
				word.name = name;
				word.translations = translations.split(',').map(function(translation) {
					return translation.trim();
				});
				word.type = {};
				word.type.name = typeName.capitalize();
				word.wiktionaryURL = 'http://de.wiktionary.org/wiki/' + word.name;

				console.log(word);

				writeNewWordToFile(word, function() {
					process.exit();
				});
			}
		});
	});
});