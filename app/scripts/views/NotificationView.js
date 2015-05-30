define([
'views/BaseView',
'text!templates/NotificationTemplate.html'
], function(BaseView, NotificationTemplate){
	var NotificationView = BaseView.extend({

		className: "view-my-certifications",

		template: _.template(NotificationTemplate),

		debug: true,

		theme: "dashboard",

	});
	return NotificationView;
});