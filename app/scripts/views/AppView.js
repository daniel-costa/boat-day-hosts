define(['parse'], function(Parse){
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


			if( Parse.User.current() && Parse.User.current().get("status") != "creation" ) {

				var callbackError = function(error) {
					console.log(error);
				};

				var hostSuccess = function(host) {
					Parse.User.current().get("profile").fetch().then(cb, callbackError);
				};

				Parse.User.current().get("host").fetch().then(hostSuccess, callbackError);

			} else {
				cb();
			}
		}

	});
	return AppView;
});