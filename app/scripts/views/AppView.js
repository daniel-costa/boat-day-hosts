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

			alert(params.type + ": "+ params.message);
			// ToDo Check if already exist and dont add new
		},

		initialize: function(cb) {

			if( Parse.User.current() ) {

				cb();
				
			} else {

				cb();
				
			}
		}

	});
	return AppView;
});