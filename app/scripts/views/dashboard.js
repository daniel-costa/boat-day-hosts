define([
'jquery', 
'underscore', 
'parse',
'text!templates/dashboard.html'
], function($, _, Parse, DashboardTemplate){
	var DashboardView = Parse.View.extend({

		template: _.template(DashboardTemplate),

		events: {
			"click #signOut" : "signOut"
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			this.$el.html(this.template());
		},
		signOut: function(){
			alert('sign out template');

		}

	});
	return DashboardView;
});
