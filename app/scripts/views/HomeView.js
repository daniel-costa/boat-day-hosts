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

			var self = this;

			var logInSuccess = function(user) {

				Parse.history.navigate('dashboard', true);

			};

			var logInError = function(error) {
				console.log(error.message);
				self._error(error.message);
			};

			Parse.User.logIn(this._in('email').val(), this._in('password').val()).then(logInSuccess, logInError);
		
		},

	});
	return HomeView;
});
