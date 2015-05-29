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
			self.buttonLoader('...');
			self.cleanForm();

			if(self._in('email').val() == '') {
				self.buttonLoader();
				self.fieldError('email', 'Oops, you missed one!');
				return;
			}

			var requestPasswordResetSuccess = function() {
				self.buttonLoader();
				self._info("A password reset link has been sent to your email.");

			};

			var requestPasswordResetError = function(error) {
				
				self.buttonLoader();
				
				switch(error.code) {
					case 205:
						self._error("No user found for this email.");
						break;
					default:
						self._error("An error occured, please try later.");	
						break;
				}
				
			};

			Parse.User.requestPasswordReset(this._in('email').val()).then(requestPasswordResetSuccess, requestPasswordResetError);
		
		},

	});
	return ForgotPasswordView;
});
