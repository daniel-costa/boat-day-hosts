define([
'parse'
], function(Parse){
	var NotificationModel = Parse.Object.extend("Notification", {

		defaults: {
			to: null,
			from: null,
			message: null,
			read: false,
			open: null,
			payload: {
				id: null,
				action: null
			}
		}
 
	});
	return NotificationModel;
});