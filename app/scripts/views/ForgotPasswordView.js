define([
'views/BaseView',
'text!templates/ForgotPasswordTemplate.html'
], function(BaseView, ForgotPasswordTemplate){
	var ForgotPasswordView = BaseView.extend({

		className: "view-forgot-password container",

		template: _.template(ForgotPasswordTemplate),

		events: {
			"submit form" : "forgotPassword"
		},

		theme: "guest",

		forgotPassword: function(event){

			event.preventDefault();

			var self = this;

			var requestPasswordResetSuccess = function() {

				self.$el.find('.form').html('<h5 class="text-center">A password reset link has been sent to your email.</h5>');

			};

			var requestPasswordResetError = function(error) {
				console.log(error.message);
				self._error(error.message);
			};

			Parse.User.requestPasswordReset(this._in('email').val()).then(requestPasswordResetSuccess, requestPasswordResetError);
		
		},

	});
	return ForgotPasswordView;
});
