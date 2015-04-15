define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/DashboardTemplate.html'
], function($, _, Parse, BaseView, DashboardTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),

		events : {

		}

	});
	return DashboardView;
});
