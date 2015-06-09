define([
'views/BaseView',
'text!templates/PasswordChangedTemplate.html'
], function(BaseView, PasswordChangedTemplate){
	var PasswordChangedView = BaseView.extend({

		className: "view-password-changed container",

		template: _.template(PasswordChangedTemplate),

		theme: "guest",

	});
	return PasswordChangedView;
});
