define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatsSelectTemplate.html'
], function($, _, Parse, BaseView, BoatsSelectTemplate){
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
