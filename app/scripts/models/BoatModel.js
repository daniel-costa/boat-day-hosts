define([
'parse'
], function(Parse){
	var BoatModel = Parse.Object.extend("Boat", {

		defaults: {

			status: 'creation',
			host: null,
			name: null, 
			hullID: null,
			length: null,
			capacity: null,
			type: null, 
			features: {
				airConditioning: false,
				autopilot: false,
				cooler: false,
				depthFinder: false,
				fishFinder: false,
				gps: false,
				grill: false,
				internet: false,
				liveBaitWell: false,
				microwave: false,
				refrigeration: false,
				rodHolder: false,
				shower: false,
				sink: false,
				stereo: false,
				stereoAuxInput: false,
				sonar: false,
				swimLadder: false,
				tvDvd: false,
				trollingMotor: false,
				wakeboardTower: false
			}

		},

		initialize: function() {
		},

		validate: function(attributes) {

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.name == "" ) {
				_return.fields.name = "You must to enter a display name";

			}
			
			if( attributes.type == "" ) {
				_return.fields.type = "You must to enter a type of boat";

			}

			if( attributes.hullID == "" ) {
				_return.fields.hullID = "You must to enter a hull ID";

			}

			if( !/^\d+$/.test(attributes.length) ) {
				_return.fields.length = "Please indicate the length of your boat";

			}

			if( !/^\d+$/.test(attributes.capacity) ) {
				_return.fields.capacity = "Please indicate the capacity of your boat";

			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return BoatModel;
});