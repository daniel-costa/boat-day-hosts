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

			var self = this, err = false;
			self.buttonLoader('...');
			self.cleanForm();

			if(self._in('email').val() == '') {
				self.fieldError('email', 'Oops, you missed one!');
				err = true;
			}

			if(self._in('password').val() == '') {
				self.fieldError('password', 'Oops, you missed one!');
				err = true;
			}

			if(err) {
				self.buttonLoader();
				return;
			}

			var logInSuccess = function(user) {

				$(document).trigger('fetchUserInfo', function() {
					Parse.history.navigate('dashboard', true);
				});

			};

			var logInError = function(error) {
				self._error(error.message);
				self.buttonLoader();
			};

			Parse.User.logIn(this._in('email').val(), this._in('password').val()).then(logInSuccess, logInError);
		
		},

	});
	return HomeView;
});
