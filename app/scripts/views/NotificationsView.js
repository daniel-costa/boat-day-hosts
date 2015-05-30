define([
'views/BaseView',
'models/NotificationModel',
'text!templates/NotificationTemplate.html',
'text!templates/NotificationsTemplate.html'
], function(BaseView, NotificationModel, NotificationTemplate, NotificationsTemplate){
	var NotificationsView = BaseView.extend({

		className: "view-my-certifications",

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
			self.$el.find('.left-navigation .my-notifications').addClass('active');
			self.$el.find('.add-boat, .add-boatday, .my-boats, .my-requests').hide();

			var ctn = $('<div>');

			var gotNotification = function(notification) {

				self.notifications[notification.id] = notification;

				if(!notification.get("read")) {
					notification.save({ read: new Date()});
				}


				ctn.append(_.template(NotificationTemplate)({ notification: notification }));

			}

			var query = new Parse.Query(NotificationModel);
			query.equalTo("to", Parse.User.current().get("profile"));
			query.include('from');
			query.find().then(function(matches){
				_.each(matches, gotNotification);
				self.$el.find('.notification-list').html(ctn);
			});

			return this;

		}

	});
	return NotificationsView;
});