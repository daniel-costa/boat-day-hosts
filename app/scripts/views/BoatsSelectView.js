define([
'views/BaseView',
'text!templates/BoatsSelectTemplate.html'
], function(BaseView, BoatsSelectTemplate){
	var DashboardView = BaseView.extend({

		tagName: "select",

		className: "view-boats-select form-control",
		
		attributes: {
			name: "boat"
		},

		template: _.template(BoatsSelectTemplate),

	});
	return DashboardView;
});
