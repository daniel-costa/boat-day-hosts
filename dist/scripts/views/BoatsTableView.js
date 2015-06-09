define([
'views/BaseView',
'text!templates/BoatsTableTemplate.html'
], function(BaseView, BoatsTableTemplate){
	var DashboardView = BaseView.extend({

		tagName: "table",

		className: "view-boats-table table",
		
		attributes: {
			style: "margin-bottom:0px;"
		},

		template: _.template(BoatsTableTemplate),

	});
	return DashboardView;
});
