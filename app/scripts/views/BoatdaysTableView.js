define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatdaysTableTemplate.html'
], function($, _, Parse, BaseView, BoatdaysTableTemplate){
	var DashboardView = BaseView.extend({

		tagName: "table",

		className: "view-boatdays-table table",
		
		attributes: {
			style: "margin-bottom:0px;"
		},

		template: _.template(BoatdaysTableTemplate),

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
