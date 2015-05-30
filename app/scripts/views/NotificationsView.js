define([
'views/BaseView',
'views/NotificationView',
'models/NotificationModel',
'text!templates/NotificationsTemplate.html'
], function(BaseView, NotificationView, NotificationModel, NotificationsTemplate){
	var NotificationsView = BaseView.extend({

		className: "view-my-certifications",

		template: _.template(NotificationsTemplate),

		debug: true,

		theme: "dashboard",

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			var notifications = $('<div>');

			var gotNotification = function(notification) {
				var view = new NotificationView({ model: notification });
				self.subViews.push(view);
				notifications.append(view.render().el);
			}

			var query = new Parse.Query(NotificationModel);
			// query.equalTo("to", ...)
			query.include('from');
			query.each(gotNotification).then(function() {
				self.$el.find('.notification-list').html(notifications);
			})

			return this;

		}

	});
	return NotificationsView;
});