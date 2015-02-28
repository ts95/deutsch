$(function() {
	/**
	 * Utilities for interacting with the HTML5 speech synthesis API.
	 */
	var speech = {
		getDefaultVoice: function() {
			if (typeof speechSynthesis === 'undefined') {
				return undefined;
			}

			function findFirstVoice(property, value) {
				return speechSynthesis.getVoices().filter(function(voice) {
					return voice[property] === value;
				})[0];
			}

			return findFirstVoice('name', 'Anna') ||
					findFirstVoice('name', 'Google Deutsch') ||
					findFirstVoice('name', 'de-DE');
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

	/**
	 * Stores the user's progress. When a user has guessed the meaning of a word
	 * correctly enough times, the user won't be presented with this word anymore.
	 */
	var progressStore = {

		// The number of times a user has to guess a word correctly before
		// it word isn't used anymore.
		limit: 50,

		// Once there are less than @lowerBound words left in the words list,
		// the progress store will not be used.
		lowerBound: 20,

		getCount: function(wordName) {
			return $.cookie(wordName) << 0;
		},

		correct: function(wordName) {
			var count = $.cookie(wordName) || 0;
			count++;
			$.cookie(wordName, count, { expires: 60 });
		},

		incorrect: function(wordName) {
			var count = $.cookie(wordName) || 0;
			count--;
			$.cookie(wordName, count, { expires: 60 });
		},
	};

	if (typeof speechSynthesis !== 'undefined') {
		speechSynthesis.onvoiceschanged = function(e) {};
	}

	$.get('/words.json', function(initialWords) {
		var random;
		if (typeof crypto !== 'undefined') {
			random = new Random(Random.engines.browserCrypto);
		} else {
			var mt = Random.engines.mt19937();
			mt.autoSeed();
			random = new Random(mt);
		}

		var fadeDuration = 1000;

		console.log('Number of words in total:', initialWords.length);

		var words = initialWords.slice();

		function fetchWord() {
			if (words.length === 0) {
				words = initialWords.slice();
			}

			var randomIndex = random.integer(0, words.length-1);

			while (progressStore.getCount(words[randomIndex].name) >= progressStore.limit &&
					words.length > progressStore.lowerBound) {
				console.log('Word', words[randomIndex].name, 'was excluded.');
				words.splice(randomIndex, 1);
				randomIndex = random.integer(0, words.length-1);
			}

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
				$('#gender').hide();
			}

			$('#description').fadeIn(fadeDuration);
			$('#description').text(word.type.name);

			return word;
		}

		function returnWord(word) {
			words.push(word);
		}

		function correctBlink() {
			$('#input').attr('class', 'input-correct');
			setTimeout(function() {
				$('#input').attr('class', 'input-default');
			}, 750);
		}

		function incorrectBlink() {
			$('#input').attr('class', 'input-incorrect');
			setTimeout(function() {
				$('#input').attr('class', 'input-default');
			}, 750);
		}

		var word = fetchWord();

		$('#input').keyup(function(e) {
			if (e.keyCode === 13 && !$(this).attr('disabled')) {
				var answer = $(this).val();
				$(this).val("");

				$('#input').prop('disabled', true);
				setTimeout(function() {
					$('#input').prop('disabled', false);
					$('#input').focus();
				}, 1200);

				if (~word.translations.indexOf(answer.trim().toLowerCase())) {
					speech.say("Richtig");
					progressStore.correct(word.name);
					correctBlink();
				} else {
					returnWord(word);
					speech.say("Falsch");
					progressStore.incorrect(word.name);
					incorrectBlink();
					$('#help').prepend($('<div>').text(word.name + ' = ' + word.translations.join(', '))
						.fadeIn(fadeDuration).delay(5000).fadeOut(fadeDuration));
					if ($('#help').children().length > 3) {
						$('#help').children().last().remove();
					}
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