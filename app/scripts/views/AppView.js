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

			if( $('.display-messages').length == 1) {
				$('.display-messages').append($('<p>').text(params.message).addClass(params.type == 'error' ? 'alert-danger' : 'alert-info'));
			} else {
				alert(params.type + ": "+ params.message);
			}
		},

		initialize: function(cb) {

			this.fetchUserInfo(event, cb);

		},

		fetchUserInfo: function(event, cb) {

			if( Parse.User.current() ) {

				if( Parse.User.current().get("host").createdAt && Parse.User.current().get("profile").createdAt ) {
					cb();
					return;
				}

				console.log('** fetch user infos **');

				var callbackError = function(error) {
					cb();
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