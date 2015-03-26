define([
'jquery', 
'underscore', 
'parse',
'text!templates/sign-in.html'
], function($, _, Parse, SignInTemplate){
	var SignInView = Parse.View.extend({

		template: _.template(SignInTemplate),

		events: {
			"submit form": "SignIn"
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			this.$el.html(this.template());
		},

		SignIn: function() {
			alert('click');
		}

	});
	return SignInView;
});
