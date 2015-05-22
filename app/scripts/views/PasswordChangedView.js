define([
'views/BaseView',
'text!templates/PasswordChangedTemplate.html'
], function(BaseView, PasswordChangedTemplate){
	var PasswordChangedView = BaseView.extend({

		className: "view-home",

		template: _.template(PasswordChangedTemplate),

	});
	return PasswordChangedView;
});
