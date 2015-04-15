define([
'jquery', 
'underscore', 
'parse',
'models/HostModel',
'models/DriverModel',
'views/BaseView',
'text!templates/SignUpTemplate.html'
], function($, _, Parse, HostModel, DriverModel, BaseView, SignUpAccountTemplate){
	var SignUpAccountView = BaseView.extend({

		className: "view-sign-up",

		template: _.template(SignUpAccountTemplate),

		progressCurrent: 0,

		signUpType: null,

		events: {
			'keyup [name="password"]' : "computePasswordStrength",
			"submit form" : "signUp",
		},

		initialize: function(params) {
			
			this.signUpType = params.type;

		},

		computePasswordStrength: function() {

			var password = this._in('password').val();
			var total = 0;
			var className;

			if( password.length > 0 && password.length < 6) {
				
				total += 25;

			} else if( password.length >= 6 ) {

				total += 25;

				if( password.match(/[a-zA-Z]/) ) {

					total += 25;

				}

				if( password.match(/[0-9]/) ) {

					total += 25;

				}

				if( password.match("[^a-zA-Z0-9]") ) {

					total += 25;

				}

			}

			if( total <= 25 ) {
				
				className = 'progress-bar-danger';

			} else if( total <= 75){

				className = 'progress-bar-warning';

			} else if( total <= 100){

				className = 'progress-bar-success';

			}

			console.log(total);

			if( total != this.progressCurrent ) {
				$('.progress-bar').animate({ width: total+'%' }, 200, 'linear')
				.removeClass('progress-bar-danger progress-bar-warning progress-bar-success')
				.addClass(className);
			}

			this.progressCurrent = total;
		},

		render: function() {
			
			BaseView.prototype.render.call(this);

			if( this.signUpType == 'driver' ) {

				this.$el.find('div.hostType').hide();

			}

			return this;

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

			if(this._in('password').val().length < 6) {

				this._error("Password should contain at least 6 characters");
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
				status: 'creation'
			};

			if( this.signUpType == 'driver') {
				
				params.driver = new DriverModel();

			} else {

				params.host = new HostModel({ type: this.$el.find('[name="hostType"]:checked').val() });
			}

			new Parse.User().signUp(params).then(userSignUpSuccess, userSignUpError);
		}

	});
	return SignUpAccountView;
});
