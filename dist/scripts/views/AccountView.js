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

		getCertStatus: function(status) {

			console.log(status);
			switch(status) {
				case null       : return "Not-Submitted"; break;
				case "pending"  : return "In Review";     break;
				case "approved" : return "Approved";      break;
				case "denied"   : return "Denied";        break;
			}
		}
	});
	return AccountView;
});