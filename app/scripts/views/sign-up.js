define([
'jquery', 
'underscore', 
'parse',
'text!templates/sign-up.html'
], function($, _, Parse, SignUpTemplate){
	var SignUpView = Parse.View.extend({

		template: _.template(SignUpTemplate),

		events: {
			"submit form": "SignUp"
		},

		initialize: function(){

			this.render();
		},

		render: function(){

			this.$el.html(this.template());
		},

		SignUp: function(){
			alert ('clicked');
		}

	});

	return SignUpView;
});