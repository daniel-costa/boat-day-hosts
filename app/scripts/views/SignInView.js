define([
'jquery', 
'underscore', 
'parse',
'text!templates/SignIn.html'
], function($, _, Parse, SignInTemplate){
	var SignInView = Parse.View.extend({
		el: $("#app"),

		template: _.template(SignInTemplate),

		events: {
			"click button.sign-in": "SignIn"
		},

		initialize: function() {
			
		},

		render: function() {
			return this.template();
		},

		SignIn: function() {
			console.log("Foo");
			alert('click');
		}

	});
	return SignInView;
});
