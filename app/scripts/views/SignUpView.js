define([
'models/HostModel',
'models/ProfileModel',
'views/BaseView',
'text!templates/SignUpTemplate.html'
], function(HostModel, ProfileModel, BaseView, SignUpAccountTemplate){
	var SignUpAccountView = BaseView.extend({

		className: "view-sign-up",

		template: _.template(SignUpAccountTemplate),

		progressCurrent: 0,

		debug: true,

		theme: "account",
		
		events: {
			'keyup [name="password"]' : "displayPasswordStrength",
			"submit form" : "signUp",
		},

		debugAutofillFields: function() {

			this._in('email').val(Math.random().toString(36) + '@gmail.com');
			this._in('password').val('kimon123');
			this._in('passwordConfirm').val('kimon123');
			
		},

		displayPasswordStrength: function() {

			var score = this.scorePassword(this._in('password').val());

			if( score != this.progressCurrent ) {
				
				if(score > 50) {	
					this.$el.find('.input-progress .bar').animate({width: 0});
					this.$el.find('.passwordComplexity').hide();
				} else {
					var percent = Math.min(score, 100) +'%';
					this.$el.find('.input-progress .bar').animate({width: percent});
					this.$el.find('.passwordComplexity').show();
				}

				this.progressCurrent = score;
			}
		},

		signUp: function(event){
			
			event.preventDefault();

			var self = this;
			var err = false;

			self.buttonLoader('Saving');
			self.cleanForm();

			if(this._in('email').val() == "") {

				this.fieldError('email', 'Oops, you missed one!');
				err = true;

			}

			if(this._in('password').val() == "") {

				this.fieldError('password', 'Oops, you missed one!');
				err = true;
				var errPass = true;

			} 
			
			if(this._in('passwordConfirm').val() == "") {

				this.fieldError('passwordConfirm', 'Oops, you missed one!');
				err = true;
				var errPassconf = true;

			} 

			if( !errPass && this.scorePassword(this._in('password').val()) < 50 ) {

				this.fieldError('password', 'Oops, password is too weak, let\'s make it stronger');
				err = true;

			} 

			if( !errPassconf && this._in('password').val() != this._in('passwordConfirm').val() ) {

				this.fieldError('passwordConfirm', 'Oops, they don\'t match.');
				err = true;

			}

			if( err ) {

				self.buttonLoader();
				return;

			}

			var userSignUpSuccess = function() {

				Parse.User.current().get('host').save({ user: Parse.User.current() }).then(function() { 
					Parse.history.navigate('dashboard', true);
				});
				

			};

			var userSignUpError = function( error ) {

				self.buttonLoader();
				console.log(error);
				switch(error.code) {
					case 125:
						self._error("Please provide a valid email address.");
						break;
					case 202:
						self._error("This email is already taken.");
						break;
					default:
						self._error("An error occured, please try later.");	
						break;
				}

			};

			var type = this.$el.find('[name="hostType"]:checked').val();
			
			var rate = type == 'business' ? Parse.Config.current().get('PRICE_HOST_CHARTER_PART') : Parse.Config.current().get('PRICE_HOST_PRIVATE_PART');
			

			var data = {
				email: this._in('email').val(),
				username: this._in('email').val(),
				password: this._in('password').val(),
				tos: false,
				status: 'creation',
				host: new HostModel({ type: type, rate: rate }),
				profile: new ProfileModel(),
				type: 'host',
			};

			new Parse.User().signUp(data).then(userSignUpSuccess, userSignUpError);
		}

	});
	return SignUpAccountView;
});
