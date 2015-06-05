define([
'views/BaseView',
'text!templates/BoatDayBoatsSelectTemplate.html'
], function(BaseView, BoatDayBoatsSelectTemplate){
	var BoatDayBoatsSelectView = BaseView.extend({

		tagName: "select",

		className: "view-boats-select form-control",
		
		attributes: {
			name: "boat"
		},

		template: _.template(BoatDayBoatsSelectTemplate),

		currentBoat: null,
		
		initialize: function(data) {
			this.currentBoat = data.currentBoat;
		}

	});
	return BoatDayBoatsSelectView;
});
