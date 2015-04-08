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

			if(this._in('email').val() == "") {

				this._error("email empty");
				return;
			}

			if(this._in('password').val() == "") {

				this._error("password empty");
				return;
			}

			if(this._in('password').val() != this._in('password_confirm').val()) {

				this._error("Passwords don't match");
				return;

			}

			// ToDo
			// - Password length to test, minimum 6 chars
			// - Password complecity to do

			var userSignUpSuccess = function() {

				Parse.history.navigate('terms', true);

			};

			var userSignUpError = function(error) {

			    self._error(error.message);

			};

			var params = {
				email: this._in('email').val(),
				username: this._in('email').val(),
				password: this._in('password').val(),
				tos: false,
				host: new HostModel({ type: $('input[name="account_type"]:checked').val() }),
				status: 'creation'
			};

			new Parse.User().signUp(params).then(userSignUpSuccess, userSignUpError);
		}

	});
	return SignUpAccountView;
});
