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

		debug: false,

		events: {
			'keyup [name="password"]' : "displayPasswordStrength",
			"submit form" : "signUp",
		},

		initialize: function(params) {
			
			this.signUpType = params.type;

		},

		render: function() {
			
			BaseView.prototype.render.call(this);
			this.$el.find('.alert-info').hide();

			if( this.signUpType == 'driver' ) {

				this.$el.find('div.hostType').hide();

			}
			
			this.$el.find('.passwordComplexity .alert').hide();
			this.$el.find('.passwordComplexity .alert-info').show();
			this.$el.find('.form-control-feedback').hide();

			return this;

		},

		debugAutofillFields: function() {

			this._in('email').val(Math.random().toString(36) + '@gmail.com');
			this._in('password').val('kimon123');
			this._in('passwordConfirm').val('kimon123');
			
		},

		scorePassword: function(pass) {
			var score = 0;

			if (!pass)
				return score;

			// award every unique letter until 5 repetitions
			var letters = new Object();
			for (var i=0; i<pass.length; i++) {
				letters[pass[i]] = (letters[pass[i]] || 0) + 1;
				score += 5.0 / letters[pass[i]];
			}

			// bonus points for mixing it up
			var variations = {
				digits: /\d/.test(pass),
				lower: /[a-z]/.test(pass),
				upper: /[A-Z]/.test(pass),
				nonWords: /\W/.test(pass),
			}

			var variationCount = 0;
			for (var check in variations) {
				variationCount += (variations[check] == true) ? 1 : 0;
			}
			score += (variationCount - 1) * 10;

			return parseInt(score);
		},

		displayPasswordStrength: function() {

			var score = this.scorePassword(this._in('password').val());

			if( score != this.progressCurrent ) {
				var className = score < 50 ? 'danger' : 'success' ;
				$('.progress-bar').css({ width: Math.min(score, 100) +'%' })
				.removeClass('progress-bar-danger progress-bar-success')
				.addClass('progress-bar-' + className);
				this.$el.find('.passwordComplexity .alert').hide();
				this.$el.find('.alert-' + className).show();
				this.progressCurrent = score;
			}

		},

		signUp: function(event){
			
			event.preventDefault();

			var self = this;
			var err = false;

			self.buttonLoader('Saving');

			this.$el.find('.form-control-feedback').hide();
			this.$el.find('.has-error').removeClass('has-error');

			if(this._in('email').val() == "") {

				this._in('email').closest('.form-group').addClass("has-error").find('.form-control-feedback').show();
				err = true;

			}

			if(this._in('password').val() == "") {

				this._in('password').closest('.form-group').addClass("has-error").find('.form-control-feedback').show();
				this._in('passwordConfirm').closest('.form-group').addClass("has-error").find('.form-control-feedback').show();
				err = true;

			}

			if( this._in('password').val() != "" &&  this.scorePassword(this._in('password').val()) < 50 ) {

				this._in('password').closest('.form-group').addClass("has-error").find('.form-control-feedback').show();
				this._in('passwordConfirm').closest('.form-group').addClass("has-error").find('.form-control-feedback').show();
				this._error('Password must to be stronger.');
				err = true;

			}

			if(this._in('password').val() != this._in('passwordConfirm').val()) {

				this._in('passwordConfirm').closest('.form-group').addClass("has-error").find('.form-control-feedback').show();
				err = true;

			}

			if( err ) {

				self.buttonLoader();
				return;

			}

			var userSignUpSuccess = function() {

				Parse.history.navigate('dashboard', true);

			};

			var userSignUpError = function( error ) {

				self.buttonLoader();
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
