define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/HomeTemplate.html'
], function($, _, Parse, BaseView, HomeTemplate){
	var HomeView = BaseView.extend({

		className: "view-home",

		template: _.template(HomeTemplate),

		events: {

			"submit form" : "signIn"

		},

		signIn: function(){

			event.preventDefault();

			Parse.User.logIn(this._in('email').val(), this._in('password').val(), {

				success: function(user) {

					if(user.get("tos")) {

						Parse.history.navigate('/dashboard', true);   					

					} else {

						Parse.history.navigate('/terms', true); 

					}

				},
				error: function(user, error) {

					console.log("Login failed");

				} 
			});
		
		}

	});
	return HomeView;
});
