define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/TermsTemplate.html'
], function($, _, Parse, BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		template: _.template(TermsTemplate),

		events: {
			"submit form" : "hostRegistration"
		},

		hostRegistration: function(){

			// var user = Parse.User.current();
			// user.set("tos", true);
			// user.save();

			Parse.history.navigate('host-registration', true);

		}
	});
	return TermsView;
});
