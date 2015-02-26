$(function() {
	var speech = {
		getDefaultVoice: function() {
			if (typeof speechSynthesis === 'undefined') {
				return undefined;
			}

			var germanAnnaVoice = speechSynthesis.getVoices().filter(function(voice) {
				return voice.name === 'Anna';
			})[0];

			if (germanAnnaVoice) {
				return germanAnnaVoice;
			}

			var germanGoogleVoice = speechSynthesis.getVoices().filter(function(voice) {
				return voice.name === 'Google Deutsch';
			})[0];

			if (germanGoogleVoice) {
				return germanGoogleVoice;
			}

			var randomGermanVoice = speechSynthesis.getVoices().filter(function(voice) {
				return voice.lang === 'de-DE';
			});

			return germanGoogleVoice;
		},

		say: function(message, delayDuration) {
			var defaultVoice = this.defaultVoice || speech.getDefaultVoice();

			if (!defaultVoice) {
				console.log("No voice found. Couldn't play voice.");
				return;
			}

			if (!this.defaultVoice) this.defaultVoice = defaultVoice;

			setTimeout(function() {
				var utterance = new SpeechSynthesisUtterance(message);
				utterance.voice = defaultVoice;
				speechSynthesis.speak(utterance);
			}, delayDuration << 0);
		},

		speaking: function() {
			return speechSynthesis.speaking;
		},
	};

	if (typeof speechSynthesis !== 'undefined') {
		speechSynthesis.onvoiceschanged = function(e) {};
	}

	$.get('/words.json', function(initialWords) {
		var fadeDuration = 1000;

		console.log('Number of words in total:', initialWords.length);

		var words = initialWords.slice();

		function fetchWord() {
			if (words.length === 0) {
				words = initialWords.slice();
			}

			var randomIndex = Math.random() * words.length << 0;
			var word = words.splice(randomIndex, 1)[0];

			console.log(word.name + ',', words.length, 'word(s) left.');

			speech.say(word.name, 400);

			$('#word').fadeIn(fadeDuration);
			$('#word').text(word.name);
			$('#word').attr('href', word.wiktionaryURL);

			if (word.type.gender) {
				$('#gender').fadeIn(fadeDuration);
				$('#gender').text(word.type.gender);
				$('#gender').attr('title', {
					m: "Masculine",
					f: "Feminine",
					n: "Neuter",
				}[word.type.gender]);
			} else {
				$('#gender').text("");
				$('#gender').attr('title', "");
			}

			$('#description').fadeIn(fadeDuration);
			$('#description').text(word.type.name);

			return word;
		}

		function returnWord(word) {
			words.push(word);
		}

		var word = fetchWord();

		$('#input').keyup(function(e) {
			if (e.keyCode === 13) {
				var answer = $(this).val();
				$(this).val("");

				if (~word.translations.indexOf(answer.trim().toLowerCase())) {
					speech.say("Richtig");
				} else {
					returnWord(word);
					speech.say("Falsch");
					$('#help').text(word.name + ' = ' + word.translations.join(', '))
						.fadeIn(fadeDuration).delay(5000).fadeOut(fadeDuration);
				}

				$('#word').fadeOut(fadeDuration);
				$('#gender').fadeOut(fadeDuration);
				$('#description').fadeOut(fadeDuration, function() {
					word = fetchWord();
				});
			}
		});

		$('#word').mouseover(function() {
			if (speech.speaking()) return;
			var utterance = $(this).text();
			speech.say(utterance);
		});

		$('#gender').mouseover(function() {
			if (speech.speaking()) return;
			var utterance = {
				m: 'Maskulinum',
				f: 'Femininum',
				n: 'Neutrum',
			}[$(this).text()];
			speech.say(utterance);
		});
	});

});