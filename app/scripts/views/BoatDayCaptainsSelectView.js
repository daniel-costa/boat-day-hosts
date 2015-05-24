define([
'views/BaseView',
'text!templates/BoatDayCaptainsSelectTemplate.html'
], function(BaseView, BoatDayCaptainsSelectTemplate){
	var BoatDayCaptainsSelectView = BaseView.extend({

		tagName: "select",

		className: "view-captains-select form-control",
		
		attributes: {
			name: "captain"
		},

		template: _.template(BoatDayCaptainsSelectTemplate),

		currentCaptain: null,
		
		initialize: function(data) {
			this.currentCaptain = data.currentCaptain;
		}

	});
	return BoatDayCaptainsSelectView;
});
