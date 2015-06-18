define([
'parse'
], function(Parse){
	var NotificationModel = Parse.Object.extend("Notification", {

		// defaults: {
		// 	to: null,
		// 	from: null,
		// 	message: null,
		// 	read: false,
		// 	open: null,
		// 	payload: {
		// 		id: null,
		// 		action: null
		// 	}
		// }

		defaults: {
			to: null,
			from: null,
			fromTeam: false,
			action: null,
			message: null,
			boat: null,
			boatday: null,
			read: null
		}
 
	});
	return NotificationModel;
});