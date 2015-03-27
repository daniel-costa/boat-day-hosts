define([
'jquery',
'parse',
'views/sign-up',
'views/dashboard'
], function($, Parse, SignUp, Dashboard){
	var AppView = Parse.View.extend({

		el: $("#app"),

		initialize: function() {
			this.render();
		},

		render: function() {
			if (Parse.User.current()) {
				new Dashboard({ el: this.$el });
			} else {
				new SignUp({ el: this.$el });
			}
			new Dashboard({el: this.$el});
		}
	});
	return AppView;
});