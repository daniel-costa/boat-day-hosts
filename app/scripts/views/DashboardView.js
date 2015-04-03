define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/DashboardTemplate.html'
], function($, _, Parse, BaseView, DashboardTemplate){
	var DashboardView = BaseView.extend({

		template: _.template(DashboardTemplate),

	});
	return DashboardView;
});
