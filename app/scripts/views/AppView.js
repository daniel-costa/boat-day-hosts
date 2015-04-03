define([
'jquery',
'parse',
], function($, Parse){
	var AppView = Parse.View.extend({

		el: document,

		events: {
			'globalError': 'displayError',
			'globalInfo': 'displayInfo',
			'globalMessage': 'displayMessage'
		},

		displayError: function(event, message) {
			this.displayMessage(event, {type: 'error', message: message});
		},

		displayInfo: function(event, message) {
			this.displayMessage(event, {type: 'info', message: message});
		},

		displayMessage: function(event, params) {

			$('<nav id="globalMessage" class="bar bar-standard bar-header-secondary message"><span class="icon icon-info"></span> </nav>')
			.append(params.message)
			.addClass('message-' + params.type)
			.appendTo('#content .content');

			setTimeout(function() {
			  $('#globalMessage').remove();
			}, 5000);

			// ToDo Check if already exist and dont add new
		},

		initialize: function() {
		}

	});
	return AppView;
});