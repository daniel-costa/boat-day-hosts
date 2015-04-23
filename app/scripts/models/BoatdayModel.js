define([
'parse'
], function(Parse){
	var BoatdayModel = Parse.Object.extend("Boatday", {

		defaults: {

			status: 'creation', 
			host: 'null', 
			name: ''

		},

	});
	return BoatdayModel;
});