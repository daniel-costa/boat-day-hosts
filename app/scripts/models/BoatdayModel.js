define([
'parse'
], function(Parse){
	var BoatDayModel = Parse.Object.extend("BoatDay", {

		defaults: {

			status: 'creation', 
			name: null,
			host: null, 
			boat: null, 
			captain: null, 
			date: null,
			departureTime: null,
			duration: null, 
			price: null, 
			availableSeats: null, 
			location: null, 
			description: null,
			bookingPolicy: null, 
			cancellationPolicy: null, 
			category: null,
			features: {
				leisure: {
					cruising: false,
					partying: false,
					sightseeing: false,
					other: false
				},
				fishing: {
					flats: false,
					lake: false,
					offshore: false,
					recreational: false,
					other: false,
					equipment: false,
					equipmentItems: {
						bait: false,
						lines: false,
						hooks: false,
						lures: false,
						nets: false,
						rods: false,
						sinkers: false
					}
				},
				sports: {
					snorkeling: false,
					tubing: false,
					wakeBoarding: false,
					waterSkiing: false,
					equipment: false,
					equipmentItems: {
						fins: false,
						helmets: false,
						masks: false,
						snorkels: false,
						towLine: false,
						tubes: false,
						wakeboard: false,
						waterSkis: false
					}
				},
				global: {
					children: false,
					smoking: false,
					drinking: false,
					pets: false 
				}, 
				extras: {
					food: false,
					drink: false,
					music: false,
					towels: false,
					sunscreen: false,
					inflatables: false
				}
			}
		},

		validate: function(attributes) {

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.name == "" ) {
				_return.fields.name = "Oops, you missed one! Please provide a name for your BoatDay.";
			}

			if( !attributes.boat ) {
				_return.fields.boat = "Oops, you missed one! Please select the boat for your BoatDay.";
			}

			if( !attributes.captain ) {
				_return.fields.captain = "Oops, you missed one! Please select the captain for your BoatDay.";
			}

			if( !attributes.availableSeats ) {
				_return.fields.availableSeats = "Oops, you missed one! Please specify the number of avialable seats for your BoatDay.";
			}

			if( !/^[0-9]+([\.][0-9]+)?$/g.test(attributes.price) ) {
				_return.fields.price = "A price per seat is not valid";
			}

			if( !attributes.description ) {
				_return.fields.description = "Oops, you missed one! Please describe your BoatDay for potential Guests.";
			}

			if( !attributes.location ) {
				_return.fields.location = "Oops, you missed one! Please tell Guests where to come aboard your BoatDay.";
			}

			if( !attributes.date ) {
				_return.fields.date = "Oops, you missed one! Please choose a date for your BoatDay.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		 }

	});
	return BoatDayModel;
});