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

			"submit form" : "signIn",
			"click .signUp" : "signUp"

		},

		signUp: function() {

			if( this.$el.find('[name="signUp"]:checked').val() == 'host' ) {

				Parse.history.navigate('sign-up/host', true);

			} 

			if( this.$el.find('[name="signUp"]:checked').val() == 'driver' ) {

				Parse.history.navigate('sign-up/driver', true);

			}
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
