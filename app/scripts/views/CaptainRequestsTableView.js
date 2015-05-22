define([
'views/BaseView',
'text!templates/CaptainRequestsTableTemplate.html'
], function(BaseView, CaptainRequestsTableTemplate){
	var CaptainRequestsTableView = BaseView.extend({

		tagName: "table",

		className: "view-captain-requests-table table",
		
		attributes: {
			style: "margin-bottom:0px;"
		},

		template: _.template(CaptainRequestsTableTemplate),

		initialize: function() {
			console.log(this.collection);
		}

	});
	return CaptainRequestsTableView;
});
