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
			"submit form" : "signUp", 
			'keyup [name="password"]' : "passStrength"
		},

		passStrength: function(){

			console.log("CHECKPOINT");
			var password = this._in('password').val();
			console.log(password);
			var passLength = password.length;
			var regex = "[^a-zA-Z0-9]";
			var numberFlag = 0;
			var numberGenerator = 0;
			var specialFlag = 0;

    		var total = 0;

    		if( passLength < 6) {

    			numberGenerator = 25;
    			console.log("passLength < 6: " +numberGenerator);
    		} else{

    			if( passLength >= 6) {

    			numberGenerator = 50;
    			console.log("passLength > 6: " + numberGenerator);

    			}

    			if( password.match(/[0-9]/)){

    			numberFlag = 25;	
    			console.log("Contains number: " + numberFlag);

    			}

    			if( password.match(regex)){

    			specialFlag = 25;
    			console.log("contains special char: " + specialFlag);

    			}

    		}

    		total = numberGenerator + numberFlag + specialFlag ;
    		console.log("total:" + total);

    		if( total == 25){

    			$(".progress-bar").css('background-color','#FF0040');
    			//$('<div>Weak password</div>').appendTo('.alert');

    		} else if( total == 50){

    			$(".progress-bar").css('background-color','#FFA500');
    			//$('<div>Secure enough</div>').appendTo('.alert');

    		} else if( total == 75){

    			$(".progress-bar").css('background-color','#FFA500');
    			//$('<div>Secure enough</div>').appendTo('.alert');

    		} else if( total == 100){

    			$(".progress-bar").css('background-color','#006600');
    			//$('<div>Strong password</div>').appendTo('.alert');

    		}

    		$('.progress-bar').css('width',total+'%');

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

			if(this._in('password').val().length < 4) {

				this._error("Password should contain atleast 4 characters");
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
