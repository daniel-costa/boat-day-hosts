define(['parse'], function(Parse){
	var AppView = Parse.View.extend({

		el: document,

		events: {
			'globalError': 'displayError',
			'globalInfo': 'displayInfo',
			'globalMessage': 'displayMessage',
			'fetchUserInfo': 'fetchUserInfo'
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

			this.fetchUserInfo(event, cb);

		},

		fetchUserInfo: function(event, cb) {

			if( Parse.User.current() ) {

				console.log('** fetch user infos **');

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