define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatDaysTableTemplate.html'
], function($, _, Parse, BaseView, BoatDaysTableTemplate){
	var DashboardView = BaseView.extend({

		tagName: "table",

		className: "view-boatdays-table table",
		
		attributes: {
			style: "margin-bottom:0px;"
		},

		template: _.template(BoatDaysTableTemplate),

		events : {

		},

		initialize: function() {


		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;

		}

	});
	return DashboardView;
});
