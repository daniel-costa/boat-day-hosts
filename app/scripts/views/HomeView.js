define([
'views/BaseView',
'text!templates/HomeTemplate.html'
], function(BaseView, HomeTemplate){
	var HomeView = BaseView.extend({

		className: "view-home container",

		template: _.template(HomeTemplate),

		events: {
			"submit form" : "signIn",
			'click .create-account': 'createAccount'
		},

		theme: "guest",

		createAccount: function() {

			this.$el.find('.content').addClass('zoomOut').one(this.__ANIMATION_ENDS__, function() {
				Parse.history.navigate('sign-up', true);	
			});
			
		},

		signIn: function(event){

			event.preventDefault();

			var self = this;
		
			var logInSuccess = function(user) {

				$(document).trigger('fetchUserInfo', function() {
					Parse.history.navigate('dashboard', true);
				});

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
