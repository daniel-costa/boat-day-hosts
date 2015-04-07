define([
'jquery', 
'underscore', 
'parse',
'models/HostModel',
'views/BaseView',
'text!templates/SignUpTemplate.html'
], function($, _, Parse, HostModel, BaseView, SignUpAccountTemplate){
	var SignUpAccountView = BaseView.extend({

		template: _.template(SignUpAccountTemplate),

		events: {
			"submit form" : "signUp"
		},

		signUp: function(){
			
			event.preventDefault();

			var self = this;

			// At this stage a user must never be logged in
			// but for test purposes we will make the test
			// and log him out
			if(Parse.User.current()) {
				Parse.User.logOut();
				return;
			}

			var user = new Parse.User();
			user.set("email", this._in('email').val());
			user.set("username", this._in('email').val());
			user.set("password", this._in('password').val());
			user.set("tos", false);
			user.set("host", new HostModel({ type: $('input[name="account_type"]:checked').val() }));

			user.signUp(null, {
			  success: function(user) {
			    console.log("succeed");
				Parse.history.navigate('terms', true);		
			  },
			  error: function(user, error) {
			    
			    self._error(error.message);
		
			  }
			});
		}

	});
	return SignUpAccountView;
});
