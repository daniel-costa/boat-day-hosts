define([
'views/BaseView',
'text!templates/AccountTemplate.html'
], function(BaseView, AccountTemplate){
	var AccountView = BaseView.extend({

		className: "view-my-profile",

		template: _.template(AccountTemplate),

		events: {
		},

		theme: "account",

		initialize: function() {
			this.templateData = {
				_profile: Parse.User.current().get('profile')._toFullJSON(),
				_host: Parse.User.current().get('host')._toFullJSON()
			};
		},

	});
	return AccountView;
});