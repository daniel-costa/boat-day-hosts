define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/CaptainRequestsTableTemplate.html'
], function($, _, Parse, BaseView, CaptainRequestsTableTemplate){
	var CaptainRequestsTableView = BaseView.extend({

		tagName: "table",

		className: "view-captain-requests-table table",
		
		attributes: {
			style: "margin-bottom:0px;"
		},

		template: _.template(CaptainRequestsTableTemplate),

	});
	return CaptainRequestsTableView;
});
