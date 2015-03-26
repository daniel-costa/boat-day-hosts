define([
'jquery', 
'underscore', 
'parse',
'text!templates/dashboard.html'
], function($, _, Parse, DashboardTemplate){
	var DashboardView = Parse.View.extend({

		template: _.template(DashboardTemplate),

		events: {
		},

		initialize: function() {
			this.render();
		},

		render: function() {
			this.$el.html(this.template());
		}

	});
	return DashboardView;
});
