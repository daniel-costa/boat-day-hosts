define([
'parse'
], function(Parse){
	var BoatModel = Parse.Object.extend("Boat", {

		defaults: {

			status: 'creation',
			host: null,
			name: null, 
			hullID: null,
			buildYear: null,
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
				_return.fields.name = "Oops, you missed one! Please enter the name of your boat.";
			}
			
			if( attributes.type == "" ) {
				_return.fields.type = "Oops, you missed one! Please enter the make of your boat.";
			}

			if( attributes.hullID == "" ) {
				_return.fields.hullID = "Oops, you missed one! Please enter a valid hull ID.";
			}

			if( !/^\d+$/.test(attributes.buildYear) || attributes.buildYear < 1900 || attributes.buildYear > new Date().getFullYear()) {
				_return.fields.buildYear = "Oops, you missed one!";
			}

			if( !/^\d+$/.test(attributes.length) ) {
				_return.fields.length = "Oops, you missed one!";
			}

			if( !/^\d+$/.test(attributes.capacity) ) {
				_return.fields.capacity = "Oops, you missed one! How many Guests fit aboard your boat?";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return BoatModel;
});