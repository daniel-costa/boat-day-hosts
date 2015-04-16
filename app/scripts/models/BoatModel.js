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

			if( attributes.name == "" ) {

				return "You must to enter a display name";

			}

			if( attributes.hullID == "" ) {

				return "You must to enter a hull ID";

			}

			if( !/^[0-9]+\.?[0-9]+$/.test(attributes.length) ) {

				return "Please indicate the length of your boat";

			}

			if( !/^\d+$/.test(attributes.capacity) ) {

				return "Please indicate the capacity of your boat";

			}

			// if( !attributes.boatPicture ) {

			// 	return "You must to upload a boat picture";

			// }

			// if( !attributes.insurance ) {

			// 	return "You must upload a proof of insurance";

			// }

		}
 
	});
	return BoatModel;
});