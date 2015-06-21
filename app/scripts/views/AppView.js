define(['parse'], function(Parse){
	var AppView = Parse.View.extend({

		el: document,

		events: {
			'globalError': 'displayError',
			'globalInfo': 'displayInfo',
			'globalMessage': 'displayMessage',
			'fetchUserInfo': 'fetchUserInfo',
			'updateNotificationsAmount': 'updateNotificationsAmount',
		},

		notifications: 0,

		notificationsHolder: null,

		displayError: function(event, message) {
			this.displayMessage(event, {type: 'error', message: message});
		},

		displayInfo: function(event, message) {
			this.displayMessage(event, {type: 'info', message: message});
		},

		displayMessage: function(event, params) {

			if( $('.display-messages').length > 0) {
				$('.display-messages').append($('<p>').text(params.message).addClass(params.type == 'error' ? 'alert-danger' : 'alert-info'));
			} else {
				alert(params.type + ": "+ params.message);
			}
		},

		initialize: function(cb) {

			var self = this;

			this.fetchUserInfo(event, cb);
			setInterval(function() { self.updateNotificationsAmount() }, 60 * 1000);

		},

		updateNotificationsAmount: function(event, holder) {
			
			if( holder ) {
				this.notificationsHolder = holder;
			}

			var self = this;

			var cb = function() {
				if ( self.notificationsHolder ) {
					if( self.notifications == 0)  {
						$(self.notificationsHolder).hide();
					} else {
						$(self.notificationsHolder).text(self.notifications).show();
					}
				}
			};

			this.checkNotifications(cb);

		},

		checkNotifications: function(cb) {

			var self = this;

			if( Parse.User.current().get('profile') ) {
				var query = new Parse.Query(Parse.Object.extend("Notification"));
				query.equalTo('to', Parse.User.current().get('profile'));
				query.equalTo('read', undefined);
				query.count().then(function(total) {
					self.notifications = total;
					cb();
				});
			}
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