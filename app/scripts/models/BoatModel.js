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
			insurance: null,
			boatPicture: null

		},

		validate: function(attributes) {

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.name == "" ) {
				_return.fields.name = "You must to enter a display name";

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

			if( !attributes.boatPicture ) {
				_return.fields.boatPicture = "You must to upload a boat picture";

			}

			if( !attributes.insurance ) {
				_return.fields.insurance = "You must upload a proof of insurance";

			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return BoatModel;
});