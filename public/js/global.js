if (typeof console === 'undefined') {
	window.console = {
		log: function() {}
	};
}

$.cookie.json = true;

$(function() {

	if (!$.cookie('cookiesMessage')) {
		var $cookiesMessage = $('<div class="cookies-message">')
			.text('By using this website you accept its use of cookies.');

		$('body').append($cookiesMessage);

		$cookiesMessage.delay(5000).fadeOut(1000, function() {
			$cookiesMessage.remove();
			$.cookie('cookiesMessage', true, { expires: 1000 });
		});
	}

});