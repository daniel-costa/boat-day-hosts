define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/HelpCenterTemplate.html'
], function($, _, Parse, BaseView, HelpCenterTemplate){
	var HelpCenterView = BaseView.extend({

		className:"view-help-center",

		template: _.template(HelpCenterTemplate),

		events: {
			
			"submit form" : "sendReport", 
		}, 

		initialize: function() {
			console.log("INITIALIZED");
		}, 

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;
		},

		sendReport: function(event) {

			event.preventDefault();

			console.log("Clicked send button");
		}

	});

	return HelpCenterView;

});