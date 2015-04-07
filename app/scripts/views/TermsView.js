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
			//"checkbox" : "acceptTos",
			'click [type="checkbox"]': 'clicked',
			"submit form" : "hostRegistration"
		},

		clicked: function(){

			var user = Parse.User.current();
			user.set("tos", true);
			user.save();
			
		},

		hostRegistration: function(){

			Parse.history.navigate('host-registration', true);

		}
	});
	return TermsView;
});
