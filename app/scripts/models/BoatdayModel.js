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
				_return.fields.name = "A name for your BoatDay is required";
			}

			if( attributes.boat == "" ) {
				_return.fields.boat = "A boat name is required";
			}

			if( attributes.captain == "#" ) {
				_return.fields.captain = "A captain name is required";
			}

			if( !attributes.availableSeats ) {
				_return.fields.availableSeats = "Available seats is required";
			}

			if( !/^[0-9]+([\.][0-9]+)?$/g.test(attributes.price) ) {
				_return.fields.price = "A price per seat is not valid";
			}

			if( !attributes.description ) {
				_return.fields.description = "A event description is required";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		 }

	});
	return BoatDayModel;
});