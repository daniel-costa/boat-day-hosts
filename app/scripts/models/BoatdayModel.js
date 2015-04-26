define([
'parse'
], function(Parse){
	var BoatdayModel = Parse.Object.extend("Boatday", {

		defaults: {

			status: 'creation', 
			host: null, 
			boatName: null, 
			captain: null, 
			eventName: null, 
			eventDate: null,
			departureTime: null, 
			duration: null, 
			pricePerSeat: null, 
			availableSeats: null, 
			minimumSeats: null, 
			departureLocation: 'latitude 0 longitude 0', 
			eventDescription: null,
			bookingPolicy: null, 
			cancellationPolicy: null
		},

		validate: function(attributes) {

			if( attributes.boatName == "#" ) {
				return  "A boat name is required";
			}

			if( attributes.captain == "#" ) {
				return  "A captain name is required";
			}

			if( !attributes.eventName ) {

				return "A event name is required";
			}

			if( !attributes.pricePerSeat ) {

				return "A price per seat is required";
			}	

			if( !/^[0-9]+([\.][0-9]+)?$/g.test(attributes.pricePerSeat) ) {
				return "A price per seat is not valid";
			}

			if( !attributes.availableSeats ) {

				return "A available seats is required";
			}

			if( !/^\d+$/.test(attributes.availableSeats) ) {

				return "A available seats is not valid";
			}

			if( !attributes.minimumSeats ) {

				return "A minimum seats to go out is required";
			}

			if( !/^\d+$/.test(attributes.minimumSeats) ) {

				return "A minimum seats is not valid";
			}

			if( !attributes.eventDescription ) {

				return "A event description is required";
			}
		 }

	});
	return BoatdayModel;
});