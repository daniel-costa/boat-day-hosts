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

  				user = Parse.User.current();

  				if(user.get("tos") == false){

  					Parse.history.navigate('/terms', true);	
  					
  				} else if(user.get("tos") == true) {

  					Parse.history.navigate('/dashboard', true);	

  					console.log("redirect to dahboard page");
  				} else {

  					console.log("redirect to dahboard page");
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
