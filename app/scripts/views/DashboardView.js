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

		},

		initialize: function() {

			var host = Parse.User.current().get('host');
			var relation = host.relation('boats');
			relation.query().find(function(list) {
				console.log(list);
			})


			// var user = Parse.User.current();

			// console.log(user);

			// var relation = user.relation('Boat');

			// console.log(relation);

			// relation.query().find(function(list) {
			// 	console.log(list);
			// })
			


		}

	});
	return DashboardView;
});
