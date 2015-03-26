define([
'jquery',
'parse',
'views/sign-in',
'views/dashboard'
], function($, Parse, SignIn, Dashboard){
	var AppView = Parse.View.extend({

		el: $("#app"),

		initialize: function() {
			this.render();
		},

		render: function() {
			if (Parse.User.current()) {
				new Dashboard({ el: this.$el });
			} else {
				new SignIn({ el: this.$el });
			}
		}
	});
	return AppView;
});