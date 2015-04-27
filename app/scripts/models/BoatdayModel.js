define([
'parse'
], function(Parse){
	var BoatdayModel = Parse.Object.extend("Boatday", {

		defaults: {

			status: 'creation', 
			host: null, 
			boat: null, 
			captain: null, 
			name: null, 
			date: null,
			time: null, 
			duration: null, 
			pricePerSeat: null, 
			availableSeats: null, 
			minimumSeats: null, 
			location: null, 
			description: null,
			bookingPolicy: null, 
			cancellationPolicy: null
		},

		validate: function(attributes) {

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.boat == "" ) {
				_return.fields.boat = "A boat name is required";
			}

			if( attributes.captain == "#" ) {
				_return.fields.captain = "A captain name is required";
			}

			if( !attributes.name ) {
				_return.fields.name = "A event name is required";
			}

			if( !/^[0-9]+([\.][0-9]+)?$/g.test(attributes.pricePerSeat) ) {
				_return.fields.pricePerSeat = "A price per seat is not valid";
			}

			if( !/^\d+$/.test(attributes.availableSeats) ) {
				_return.fields.city = "A available seats is not valid";
			}

			if( !attributes.description ) {
				_return.fields.description = "A event description is required";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		 }

	});
	return BoatdayModel;
});