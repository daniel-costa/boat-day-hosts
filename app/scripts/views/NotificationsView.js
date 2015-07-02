define([
'views/BaseView',
'models/NotificationModel',
'text!templates/NotificationTemplate.html',
'text!templates/NotificationsTemplate.html'
], function(BaseView, NotificationModel, NotificationTemplate, NotificationsTemplate){
	var NotificationsView = BaseView.extend({

		className: "view-my-notifications",

		template: _.template(NotificationsTemplate),

		debug: true,

		theme: "dashboard",

		events: {
			"click .open-notification": "notificationOpened"
		},

		notifications: {},


		notificationOpened: function(event) {
			var self = this;
			event.preventDefault();
			var btn = $(event.currentTarget);
			var id = btn.attr("data-id");
			var notification = self.notifications[id];
			var data = {};

			if(!notification.get("open")) {
				data.open = new Date();
			}

			notification.save(data).then(function() {

				if( notification.get("payload").scope == "host" ) {

					Parse.history.navigate("my-account", true);

				} else if ( notification.get("payload").scope == "certifications" ) {

					Parse.history.navigate("my-certifications", true);

				} else if ( notification.get("payload").scope == "boat" ) {

					Parse.history.navigate("boat/" + notification.get("payload").id, true);
				}
				
			});

		},	

		render: function() {

			BaseView.prototype.render.call(this);
			var self = this;

			//self.$el.find('.navbar-brand').text('My messages');
			self.$el.find('.left-navigation .menu-my-notifications').addClass('active');
			self.$el.find('.left-navigation a.link').hide();
			self.$el.find('.left-navigation a.menu-my-notifications').show().css('display', "block");

			self.$el.find('.add-boat, .add-boatday, .my-boats, .my-requests').hide();

			var gotNotification = function(notification) {

				self.notifications[notification.id] = notification;

				var data = {
					bd: notification.get("fromTeam"),
					action: notification.get("action"),
					boatId: notification.get("boat") ? notification.get("boat").id : null,
					boatName: notification.get("boat") ? notification.get("boat").get('name') : null,
					boatdayId: notification.get("boatday") ? notification.get("boatday").id : null,
					boatdayName: notification.get("boatday") ? notification.get("boatday").get('name') : null,
					message: notification.get("message") ? notification.get("message").replace(/\n/g, "<br>") : '',
					sender: notification.get("from"),
					read:  notification.get("read"),
					// requestId: request.id,
					// amount: request.get('contribution'),
					// seats: request.get('seats')
					requestId: notification.id,
					amount: notification.get('contribution'),
					seats: notification.get('seats')
				};

				self.$el.find('.notification-list').append(_.template(NotificationTemplate)(data));


				if(!notification.get("read")) {
					notification.save({ read: new Date()});
				}
			}

			var query = new Parse.Query(NotificationModel);
			query.descending('createdAt');
			query.equalTo("to", Parse.User.current().get("profile"));
			query.include('from');
			query.include('boat');
			query.include('boatday');
			query.include('request');
			query.find().then(function(matches){

				if(matches.length > 0) {
					self.$el.find('.notification-list').show();
				}

				_.each(matches, gotNotification);
			});

			return this;

		}

	});
	return NotificationsView;
});