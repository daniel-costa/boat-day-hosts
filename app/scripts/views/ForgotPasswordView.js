define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/ForgotPasswordTemplate.html'
], function($, _, Parse, BaseView, ForgotPasswordTemplate){
	var ForgotPasswordView = BaseView.extend({

		className: "view-home",

		template: _.template(ForgotPasswordTemplate),

		events: {
			"submit form" : "forgotPassword"
		},

		forgotPassword: function(event){

			event.preventDefault();

			var self = this;
			console.log(123);

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
